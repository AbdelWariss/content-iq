import { cn } from "@/lib/utils";
import CharacterCount from "@tiptap/extension-character-count";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import UnderlineExt from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { EditorToolbar } from "./EditorToolbar";

interface RichEditorProps {
  content: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  readonly?: boolean;
  streaming?: boolean;
}

export function RichEditor({
  content,
  onChange,
  placeholder = "Le contenu généré apparaîtra ici...",
  className,
  readonly = false,
  streaming = false,
}: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: { depth: 100 } }),
      UnderlineExt,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: false }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content,
    editable: !readonly && !streaming,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[300px] px-4 py-3",
      },
    },
  });

  // Sync content depuis l'extérieur (streaming token par token)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getText();
    if (streaming && content !== current) {
      editor.commands.setContent(content, false);
    } else if (!streaming && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor, streaming]);

  // Activer/désactiver l'édition selon le streaming
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readonly && !streaming);
  }, [editor, readonly, streaming]);

  const wordCount = editor?.storage.characterCount?.words() ?? 0;

  if (!editor) return null;

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border bg-background overflow-hidden",
        streaming && "border-primary/50 ring-1 ring-primary/20",
        className,
      )}
    >
      {!readonly && <EditorToolbar editor={editor} wordCount={wordCount} />}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
