'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered, Heading2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Toggle } from '@/components/ui/toggle'

export default function RichTextEditor({
    name,
    defaultValue = ''
}: {
    name: string,
    defaultValue?: string
}) {
    const [content, setContent] = useState(defaultValue)

    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        immediatelyRender: false,
        content: defaultValue,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base focus:outline-none min-h-[150px] max-w-none p-3',
            },
        },
        onUpdate: ({ editor }) => {
            setContent(editor.getHTML())
        },
    })

    // Update if external default value changes (less likely, but good practice)
    useEffect(() => {
        if (editor && defaultValue && editor.getHTML() !== defaultValue && defaultValue !== '') {
            editor.commands.setContent(defaultValue)
        }
    }, [defaultValue, editor])

    if (!editor) {
        return null
    }

    return (
        <div className="flex flex-col border rounded-md overflow-hidden bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            <input type="hidden" name={name} value={content} />

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 p-1">
                <Toggle
                    size="sm"
                    pressed={editor.isActive('heading', { level: 2 })}
                    onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    aria-label="Toggle Heading"
                >
                    <Heading2 className="h-4 w-4" />
                </Toggle>
                <div className="w-[1px] h-4 bg-border mx-1" />
                <Toggle
                    size="sm"
                    pressed={editor.isActive('bold')}
                    onPressedChange={() => editor.chain().focus().toggleBold().run()}
                    aria-label="Toggle Bold"
                >
                    <Bold className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('italic')}
                    onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                    aria-label="Toggle Italic"
                >
                    <Italic className="h-4 w-4" />
                </Toggle>
                <div className="w-[1px] h-4 bg-border mx-1" />
                <Toggle
                    size="sm"
                    pressed={editor.isActive('bulletList')}
                    onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                    aria-label="Toggle Bullet List"
                >
                    <List className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('orderedList')}
                    onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                    aria-label="Toggle Ordered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </Toggle>
            </div>

            {/* Editor Area */}
            <div className="bg-background relative custom-prose">
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}
