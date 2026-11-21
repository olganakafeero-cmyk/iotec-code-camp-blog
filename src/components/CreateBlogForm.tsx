import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, ReactNode } from 'react'
import { useMutation } from 'convex/react'
import {
  Clock,
  Eye,
  ImagePlus,
  Lock,
  Maximize2,
  Save,
  Send,
  Sparkles,
  Unlock,
  X,
} from 'lucide-react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { BlogBodyEditor } from './BlogBodyEditor'
import { blogFormSchema } from '../lib/blog-form-schema'
import {
  AUTHOR,
  CATEGORIES,
  CURRENCY,
  PRICE_PRESETS,
  labelOf,
} from '../lib/blog-options'
import {
  countWords,
  getImageDimensions,
  makeExcerpt,
  makePreviewHtml,
  readMinutesLabel,
  readTimeFor,
  slugify,
} from '../lib/blog-utils'
import './create-blog.css'

const emptyForm = {
  title: '',
  subtitle: '',
  category: CATEGORIES[0] as string,
  subscriptionMode: 'free',
  priceAmount: '0',
  body: '',
}

type FormState = typeof emptyForm
type ErrorKey = keyof FormState | 'cover'
type Errors = Partial<Record<ErrorKey, string>>
type SaveStatus = 'draft' | 'published'

interface FieldProps {
  id: string
  label: string
  counter?: string
  hint?: string
  error?: string
  children: ReactNode
}

function Field({ id, label, counter, hint, error, children }: FieldProps) {
  return (
    <div className={error ? 'cb-field invalid' : 'cb-field'}>
      <div className="cb-field-head">
        <label className="cb-label" htmlFor={id}>
          {label} <span className="cb-required">*</span>
        </label>
        {counter && <span className="cb-counter">{counter}</span>}
      </div>
      {children}
      {error ? <p className="cb-error">{error}</p> : hint && <p className="cb-hint">{hint}</p>}
    </div>
  )
}

interface CreateBlogFormProps {
  onSaved: () => void
}

export function CreateBlogForm({ onSaved }: CreateBlogFormProps) {
  const createBlog = useMutation(api.blogs.create)
  const generateUploadUrl = useMutation(api.blogs.generateUploadUrl)

  const [form, setForm] = useState<FormState>(emptyForm)
  const [cover, setCover] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState<SaveStatus | null>(null)
  const [serverError, setServerError] = useState('')
  const [previewing, setPreviewing] = useState(false)
  const [zen, setZen] = useState(false)
  const [dragging, setDragging] = useState(false)
  const previewRef = useRef('')

  const setField = (name: keyof FormState, value: string) =>
    setForm((previous) => ({ ...previous, [name]: value }))

  const words = countWords(form.body)
  const isPaid = form.subscriptionMode === 'paid'

  useEffect(() => {
    if (!zen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setZen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zen])

  const chooseFile = (file?: File) => {
    if (!file) return
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = URL.createObjectURL(file)
    setCover(file)
    setCoverPreview(previewRef.current)
    setErrors((previous) => ({ ...previous, cover: undefined }))
  }

  const removeCover = () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = ''
    setCover(null)
    setCoverPreview('')
  }

  const onFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    chooseFile(event.target.files?.[0])
    event.target.value = ''
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    chooseFile(event.dataTransfer.files?.[0])
  }

  const save = async (status: SaveStatus) => {
    setServerError('')

    // 1. Check every field with Zod.
    const result = blogFormSchema.safeParse({ ...form, cover })
    if (!result.success) {
      const next: Errors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as ErrorKey
        if (key && !next[key]) next[key] = issue.message
      }
      setErrors(next)
      setPreviewing(false)
      return
    }
    setErrors({})

    const data = result.data
    const file = data.cover
    if (!file) return
    const wordCount = countWords(data.body)

    try {
      setSaving(status)

      // 2. Upload the picture to Convex.
      const [dimensions, uploadUrl] = await Promise.all([
        getImageDimensions(file),
        generateUploadUrl(),
      ])
      const upload = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      if (!upload.ok) throw new Error('Upload failed')
      const { storageId } = (await upload.json()) as { storageId: Id<'_storage'> }

      // 3. Save the blog.
      await createBlog({
        slug: slugify(data.title),
        title: data.title,
        subtitle: data.subtitle,
        excerpt: makeExcerpt(data.body),
        previewContentHtml: makePreviewHtml(data.body),
        fullContentHtml: data.body,
        category: data.category,
        readTime: readTimeFor(wordCount),
        wordCount,
        status,
        subscriptionMode: data.subscriptionMode,
        price: {
          amount: data.subscriptionMode === 'paid' ? data.priceAmount : 0,
          currency: CURRENCY,
        },
        coverImageStorageId: storageId,
        coverImageData: {
          alt: data.title,
          caption: '',
          fileName: file.name,
          fileSize: file.size,
          dimensions,
        },
        author: AUTHOR,
      })
      onSaved()
    } catch {
      setServerError('Could not save the blog. Check your connection and try again.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <form className="cb-wrap" onSubmit={(event) => event.preventDefault()} noValidate>
      <header className="cb-header">
        <div>
          <h1 className="cb-heading">Create Blog</h1>
          <span className="cb-mode">
            <span className="cb-dot"></span> DRAFT MODE
          </span>
        </div>

        <div className="cb-header-actions">
          <button
            type="button"
            className="cb-btn"
            disabled={saving !== null}
            onClick={() => save('draft')}
          >
            <Save size={14} /> {saving === 'draft' ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            className="cb-btn"
            onClick={() => setPreviewing((value) => !value)}
          >
            <Eye size={14} /> {previewing ? 'Back to editing' : 'Preview'}
          </button>
          <button
            type="button"
            className="cb-btn primary"
            disabled={saving !== null}
            onClick={() => save('published')}
          >
            <Send size={14} /> {saving === 'published' ? 'Publishing...' : 'Publish Article'}
          </button>
        </div>
      </header>

      {Object.values(errors).some(Boolean) && (
        <p className="cb-error cb-summary">Please fix the highlighted fields.</p>
      )}
      {serverError && <p className="cb-error cb-summary">{serverError}</p>}

      <div className="cb-grid">
        <section className="cb-card">
          <div className="cb-card-top">
            <div className="cb-state">
              <span className="cb-tag">DRAFT</span>
              <span className="cb-unsaved">
                <Clock size={12} /> Unsaved working copy
              </span>
            </div>
            <div className="cb-category">
              <label htmlFor="category">CATEGORY:</label>
              <select
                id="category"
                value={form.category}
                onChange={(event) => setField('category', event.target.value)}
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {labelOf(item)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div hidden={previewing}>
            <Field
              id="title"
              label="Title"
              counter={`${form.title.length} / 100 characters max`}
              hint="A concise definitive title."
              error={errors.title}
            >
              <input
                id="title"
                className="cb-serif"
                placeholder="e.g. Architecting Distributed Systems"
                value={form.title}
                onChange={(event) => setField('title', event.target.value)}
              />
            </Field>

            <Field
              id="subtitle"
              label="Subtitle"
              counter={`${form.subtitle.length} / 250 characters max`}
              hint="Displays directly beneath the cover art on the reader dispatch feed."
              error={errors.subtitle}
            >
              <textarea
                id="subtitle"
                rows={3}
                placeholder="Summarize the core thesis, fieldwork constraints, or architectural implications in one or two deliberate sentences..."
                value={form.subtitle}
                onChange={(event) => setField('subtitle', event.target.value)}
              />
            </Field>

            <div className={errors.cover ? 'cb-field invalid' : 'cb-field'}>
              <div className="cb-field-head">
                <span className="cb-label">
                  Cover Artwork <span className="cb-required">*</span>
                </span>
                <span className="cb-counter">Aspect ratio 16:9 recommended</span>
              </div>

              <label
                className={dragging ? 'cb-drop dragging' : 'cb-drop'}
                onDragOver={(event) => {
                  event.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
              >
                <input
                  type="file"
                  accept="image/webp,image/jpeg,image/png"
                  onChange={onFileInput}
                  hidden
                />
                {coverPreview ? (
                  <div className="cb-cover-preview">
                    <img src={coverPreview} alt="Selected cover" />
                    <button
                      type="button"
                      className="cb-remove"
                      onClick={(event) => {
                        event.preventDefault()
                        removeCover()
                      }}
                    >
                      <X size={14} /> Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="cb-drop-icon">
                      <ImagePlus size={18} />
                    </span>
                    <p className="cb-drop-text">
                      <span className="cb-link">Click to upload</span> or drag and drop image
                    </p>
                    <p className="cb-hint">
                      Supported formats: WebP, JPG, PNG only (Max file size: 5MB)
                    </p>
                    <div className="cb-chips">
                      <span>High Res</span>
                      <span>RGB Color Profile</span>
                      <span>2400 × 1350 px</span>
                    </div>
                  </>
                )}
              </label>
              {errors.cover && <p className="cb-error">{errors.cover}</p>}
            </div>

            <div className={errors.body ? 'cb-field invalid' : 'cb-field'}>
              <div className="cb-field-head">
                <span className="cb-label">
                  Body Text <span className="cb-required">*</span>
                </span>
                <span className="cb-counter">
                  <button type="button" className="cb-zen" onClick={() => setZen(true)}>
                    <Maximize2 size={12} /> Zen
                  </button>
                  {words} words · {readMinutesLabel(words)}
                </span>
              </div>

              <div className={zen ? 'cb-editor zen' : 'cb-editor'}>
                {zen && (
                  <button type="button" className="cb-zen-exit" onClick={() => setZen(false)}>
                    <X size={14} /> Exit Zen
                  </button>
                )}
                <BlogBodyEditor onChange={(html) => setField('body', html)} />
              </div>
              {errors.body && <p className="cb-error">{errors.body}</p>}
            </div>
          </div>

          {previewing && (
            <article className="cb-preview">
              {coverPreview && <img src={coverPreview} alt="Cover preview" />}
              <h2>{form.title || 'Untitled blog'}</h2>
              <p className="cb-preview-sub">{form.subtitle}</p>
              <div
                className="cb-preview-body"
                dangerouslySetInnerHTML={{ __html: form.body }}
              />
            </article>
          )}
        </section>

        <aside className="cb-card cb-side">
          <div className="cb-side-head">
            <span className="cb-icon">
              <Sparkles size={16} />
            </span>
            <div>
              <h2>Monetization &amp; Tier</h2>
              <p>Reader access &amp; paywall settings</p>
            </div>
          </div>

          <p className="cb-label">Subscription Mode</p>
          <div className="cb-toggle">
            <button
              type="button"
              className={!isPaid ? 'active' : ''}
              onClick={() => setField('subscriptionMode', 'free')}
            >
              <Unlock size={14} /> Free
            </button>
            <button
              type="button"
              className={isPaid ? 'active' : ''}
              onClick={() => setField('subscriptionMode', 'paid')}
            >
              <Lock size={14} /> Paid
            </button>
          </div>

          <div className={errors.priceAmount ? 'cb-price invalid' : 'cb-price'}>
            <p className="cb-label small">Price in {CURRENCY}</p>
            <div className="cb-price-input">
              <span>{CURRENCY}</span>
              <input
                type="number"
                min={0}
                disabled={!isPaid}
                value={isPaid ? form.priceAmount : '0'}
                onChange={(event) => setField('priceAmount', event.target.value)}
              />
            </div>
            {errors.priceAmount && <p className="cb-error">{errors.priceAmount}</p>}
          </div>

          <div className="cb-presets">
            <span>Presets:</span>
            {PRICE_PRESETS.map((amount) => (
              <button
                type="button"
                key={amount}
                onClick={() => {
                  setField('subscriptionMode', 'paid')
                  setField('priceAmount', String(amount))
                }}
              >
                {amount.toLocaleString()}
                <small>{CURRENCY}</small>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </form>
  )
}