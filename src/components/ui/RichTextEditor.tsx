import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  Link as LinkIcon,
} from "lucide-react";
import Link from "@tiptap/extension-link";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  error?: string;
}

interface ToolbarBtnProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}

function ToolbarBtn({
  onClick,
  active,
  title,
  children,
  disabled,
}: ToolbarBtnProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`p-1.5 rounded text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed
        ${
          active
            ? "bg-primary text-primary-foreground"
            : "text-foreground hover:bg-surface"
        }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-4 bg-border mx-1 self-center" />;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  error,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline" },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync when form resets (e.g. data loads from server after mount)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false as any);
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href;
    const url = window.prompt("URL", previous);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      className={`border rounded-lg overflow-hidden ${error ? "border-red-500" : "border-border"}`}
    >
      {/* Toolbar — your exact markup */}
      <div className="flex items-center flex-wrap gap-0.5 p-2 border-b border-border bg-bg">
        <ToolbarBtn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo size={14} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo size={14} />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="H2"
        >
          <Heading2 size={14} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="H3"
        >
          <Heading3 size={14} />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold size={14} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic size={14} />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List size={14} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered size={14} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Quote"
        >
          <Quote size={14} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Divider"
        >
          <Minus size={14} />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn
          onClick={setLink}
          active={editor.isActive("link")}
          title="Insert link"
        >
          <LinkIcon size={14} />
        </ToolbarBtn>
      </div>

      {/* Editor — your exact ProseMirror styling */}
      <div
        className="bg-surface
        [&_.ProseMirror]:min-h-50
        [&_.ProseMirror]:p-3
        [&_.ProseMirror]:text-sm
        [&_.ProseMirror]:text-foreground
        [&_.ProseMirror]:outline-none
        [&_.ProseMirror_h2]:text-base
        [&_.ProseMirror_h2]:font-bold
        [&_.ProseMirror_h2]:mb-2
        [&_.ProseMirror_h3]:text-sm
        [&_.ProseMirror_h3]:font-semibold
        [&_.ProseMirror_h3]:mb-1
        [&_.ProseMirror_p]:my-1.5
        [&_.ProseMirror_ul]:list-disc
        [&_.ProseMirror_ul]:pl-5
        [&_.ProseMirror_ol]:list-decimal
        [&_.ProseMirror_ol]:pl-5
        [&_.ProseMirror_blockquote]:border-l-4
        [&_.ProseMirror_blockquote]:border-primary
        [&_.ProseMirror_blockquote]:pl-3
        [&_.ProseMirror_blockquote]:italic
        [&_.ProseMirror_blockquote]:text-muted
        [&_.ProseMirror_hr]:border-border
        [&_.ProseMirror_hr]:my-3
        [&_.ProseMirror_a]:text-primary
        [&_.ProseMirror_a]:underline
        [&_.ProseMirror_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
        [&_.ProseMirror_.is-editor-empty:first-child::before]:text-muted
        [&_.ProseMirror_.is-editor-empty:first-child::before]:pointer-events-none
        [&_.ProseMirror_.is-editor-empty:first-child::before]:float-left
        [&_.ProseMirror_.is-editor-empty:first-child::before]:h-0"
      >
        <EditorContent editor={editor} />
      </div>

      {error && (
        <p className="text-xs text-red-500 px-3 py-2 border-t border-border">
          {error}
        </p>
      )}
    </div>
  );
}
