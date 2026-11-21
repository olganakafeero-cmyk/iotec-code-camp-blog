import { Placeholder } from '@tiptap/extension-placeholder'
import { useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Link, RichTextEditor } from '@/components/editor'
import '@/components/editor/style.css'

interface BlogBodyEditorProps {
  onChange: (html: string) => void
}

export function BlogBodyEditor({ onChange }: BlogBodyEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Link,
      Placeholder.configure({
        placeholder:
          'Begin drafting the archival monograph here. Use headings, blockquotes, code blocks, and lists to structure your thesis...',
      }),
    ],
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  return (
    <RichTextEditor editor={editor}>
      <RichTextEditor.Toolbar sticky>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
          <RichTextEditor.Strikethrough />
        </RichTextEditor.ControlsGroup>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.H1 />
          <RichTextEditor.H2 />
          <RichTextEditor.H3 />
        </RichTextEditor.ControlsGroup>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Blockquote />
          <RichTextEditor.Code />
          <RichTextEditor.CodeBlock />
        </RichTextEditor.ControlsGroup>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
          <RichTextEditor.Link />
          <RichTextEditor.Unlink />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>
      <RichTextEditor.Content />
    </RichTextEditor>
  )
}