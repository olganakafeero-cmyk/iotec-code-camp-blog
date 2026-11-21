import { useState } from 'react'
import { useQuery } from 'convex/react'
import { Lock, Plus, Unlock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '../../../convex/_generated/api'
import { useNavigate } from '../../navigation/RouterContext'
import { PATHS } from '../../navigation/paths'

type Filter = 'all' | 'published' | 'draft'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
]

function StatusBadge({ status }: { status: string }) {
  const published = status === 'published'
  return (
    <span
      className={
        published
          ? 'inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700'
          : 'inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700'
      }
    >
      <span
        className={
          published
            ? 'size-1.5 rounded-full bg-emerald-500'
            : 'size-1.5 rounded-full bg-amber-500'
        }
      />
      {published ? 'Published' : 'Draft'}
    </span>
  )
}

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

export function AdminBlogsPage() {
  const navigate = useNavigate()
  const blogs = useQuery(api.blogs.list)
  const [filter, setFilter] = useState<Filter>('all')

  const all = blogs ?? []
  const counts: Record<Filter, number> = {
    all: all.length,
    published: all.filter((blog) => blog.status === 'published').length,
    draft: all.filter((blog) => blog.status === 'draft').length,
  }
  const visible = all.filter((blog) => filter === 'all' || blog.status === filter)

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground">
          Articles &amp; Essays
        </h1>
        <Button
          type="button"
          className="self-start px-4 py-2 text-xs font-medium shadow-2xs sm:self-auto"
          onClick={() => navigate(PATHS.ADMIN_BLOGS_NEW)}
        >
          <Plus aria-hidden="true" className="size-3.5" />
          <span>Create New Blog</span>
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={
              filter === item.value
                ? 'rounded-full border border-foreground bg-foreground px-4 py-1.5 text-xs font-medium text-background'
                : 'rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted'
            }
          >
            {item.label} ({counts[item.value]})
          </button>
        ))}
      </div>

      {blogs === undefined && (
        <p className="py-16 text-sm text-muted-foreground">Loading blogs...</p>
      )}

      {blogs !== undefined && visible.length === 0 && (
        <div className="my-auto py-16">
          <p className="text-sm text-muted-foreground">
            {all.length === 0
              ? 'No blogs yet. Click "Create New Blog" to write your first one.'
              : 'No blogs match this filter.'}
          </p>
        </div>
      )}

      {visible.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Blog</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Access</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((blog) => (
                <tr
                  key={blog._id}
                  className="border-b border-border last:border-0 hover:bg-muted/40"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {blog.coverImageUrl ? (
                        <img
                          src={blog.coverImageUrl}
                          alt={blog.title}
                          className="h-10 w-16 shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-10 w-16 shrink-0 rounded-md bg-muted" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {blog.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {blog.readTime} · {blog.wordCount} words
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {capitalise(blog.category)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={blog.status} />
                  </td>
                  <td className="px-4 py-3">
                    {blog.subscriptionMode === 'paid' ? (
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Lock className="size-3.5" />
                        {blog.price.currency} {blog.price.amount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Unlock className="size-3.5" />
                        Free
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(blog.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}