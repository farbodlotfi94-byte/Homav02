'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Heading2,
  Quote,
  Undo,
  Redo,
} from 'lucide-react';
import { cn } from './utils';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minHeight?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  tooltip?: string;
}

function ToolbarButton({ onClick, isActive, disabled, children, tooltip }: ToolbarButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={cn(
          'w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200',
          'hover:bg-accent/10 active:scale-95',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent',
          isActive && 'bg-accent/20 text-accent shadow-sm'
        )}
      >
        {children}
      </button>
      {/* Tooltip */}
      {tooltip && showTooltip && !disabled && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium bg-foreground text-background rounded-md whitespace-nowrap z-50 pointer-events-none animate-in fade-in-0 zoom-in-95 duration-150">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
        </div>
      )}
    </div>
  );
}

interface ToolbarGroupProps {
  children: React.ReactNode;
  className?: string;
}

function ToolbarGroup({ children, className }: ToolbarGroupProps) {
  return (
    <div className={cn('flex items-center gap-0.5 p-1 bg-muted/50 rounded-lg', className)}>
      {children}
    </div>
  );
}

interface EditorToolbarProps {
  editor: Editor | null;
}

function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 border-b border-border/50 bg-gradient-to-b from-muted/40 to-transparent" dir="ltr">
      {/* Text Formatting Group */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          tooltip="درشت"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          tooltip="کج"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          tooltip="زیرخط"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
      </ToolbarGroup>

      {/* Structure Group */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          tooltip="تیتر"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          tooltip="لیست نقطه‌ای"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          tooltip="لیست شماره‌ای"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          tooltip="نقل قول"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
      </ToolbarGroup>

      {/* Alignment Group */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          tooltip="راست‌چین"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          tooltip="وسط‌چین"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          tooltip="چپ‌چین"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
      </ToolbarGroup>

      {/* Undo/Redo Group - pushed to the right */}
      <div className="flex-grow" />
      <ToolbarGroup className="bg-transparent">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          tooltip="برگشت"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          tooltip="دوباره"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </ToolbarGroup>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'متن را وارد کنید...',
  className,
  disabled = false,
  minHeight = '120px',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'right', // RTL default for Persian
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // If editor is empty, return empty string instead of <p></p>
      if (html === '<p></p>' || html === '<p dir="auto"></p>') {
        onChange('');
      } else {
        onChange(html);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
        dir: 'rtl',
        style: `min-height: ${minHeight}; padding: 12px 16px;`,
      },
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // Only update if value is significantly different
      const currentContent = editor.getHTML();
      const isEmpty = currentContent === '<p></p>' || currentContent === '<p dir="auto"></p>';

      if (value === '' && isEmpty) {
        return; // Both are empty, no need to update
      }

      if (value !== currentContent) {
        editor.commands.setContent(value, false);
      }
    }
  }, [value, editor]);

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  return (
    <div
      className={cn(
        'border border-border rounded-[12px] bg-input-background overflow-hidden',
        'focus-within:border-accent transition-colors duration-300',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      dir="rtl"
    >
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />

      {/* Custom styles for the editor */}
      <style>{`
        .ProseMirror {
          font-family: 'Vazirmatn', sans-serif;
          color: var(--foreground);
          line-height: 1.75;
        }

        .ProseMirror p {
          margin: 0;
        }

        .ProseMirror p + p {
          margin-top: 0.75em;
        }

        .ProseMirror h2 {
          font-size: 1.25em;
          font-weight: 600;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }

        .ProseMirror h3 {
          font-size: 1.1em;
          font-weight: 600;
          margin-top: 0.75em;
          margin-bottom: 0.5em;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding-right: 1.5em;
          padding-left: 0;
          margin: 0.5em 0;
        }

        .ProseMirror li {
          margin: 0.25em 0;
        }

        .ProseMirror blockquote {
          border-right: 3px solid var(--accent);
          border-left: none;
          padding-right: 1em;
          padding-left: 0;
          margin: 0.75em 0;
          color: var(--muted-foreground);
          font-style: italic;
        }

        .ProseMirror strong {
          font-weight: 700;
        }

        .ProseMirror em {
          font-style: italic;
        }

        .ProseMirror u {
          text-decoration: underline;
        }

        /* Placeholder styling */
        .ProseMirror.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: right;
          color: var(--muted-foreground);
          pointer-events: none;
          height: 0;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: right;
          color: var(--muted-foreground);
          pointer-events: none;
          height: 0;
        }

        /* Text alignment */
        .ProseMirror [style*="text-align: right"] {
          text-align: right;
        }

        .ProseMirror [style*="text-align: center"] {
          text-align: center;
        }

        .ProseMirror [style*="text-align: left"] {
          text-align: left;
        }
      `}</style>
    </div>
  );
}

export default RichTextEditor;
