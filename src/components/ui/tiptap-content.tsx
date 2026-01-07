'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface TipTapContentProps {
	content?: string | null
	className?: string
	maxLength?: number
}

const TipTapContent = ({
	content,
	className,
	maxLength,
}: TipTapContentProps) => {
	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: {
					levels: [1, 2, 3],
				},
				link: false,
				underline: false,
			}),
			Underline,
			Link.configure({
				openOnClick: false,
				HTMLAttributes: {
					class: 'text-blue-600 underline cursor-pointer',
				},
			}),
			Image.configure({
				inline: true,
				allowBase64: true,
			}),
			Table,
			TableRow,
			TableCell,
			TableHeader,
		],
		editable: false,
		immediatelyRender: false,
	})

	useEffect(() => {
		if (!editor || !content) {
			editor?.commands.clearContent()
			return
		}

		try {
			// Пытаемся распарсить как JSON (TipTap формат)
			const parsed = typeof content === 'string' ? JSON.parse(content) : content

			// Проверяем, что это валидный TipTap документ
			if (parsed && typeof parsed === 'object' && parsed.type) {
				editor.commands.setContent(parsed)
			} else {
				// Если не JSON, то это обычный текст
				editor.commands.setContent(content)
			}
		} catch {
			// Если не удалось распарсить, используем как обычный текст
			editor.commands.setContent(content)
		}
	}, [content, editor])

	if (!editor) {
		return null
	}

	// Получаем текстовое представление для ограничения длины
	const textContent = editor.getText()
	const shouldTruncate = maxLength && textContent.length > maxLength

	return (
		<div className={cn('tiptap-content', className)}>
			<EditorContent
				editor={editor}
				className={cn(
					'prose prose-sm max-w-none',
					'[&_.ProseMirror]:outline-none [&_.ProseMirror]:text-sm [&_.ProseMirror]:text-gray-500',
					'[&_table]:border-collapse [&_table]:w-full [&_table]:my-2',
					'[&_td]:border [&_td]:border-gray-300 [&_td]:px-2 [&_td]:py-1 [&_td]:text-xs',
					'[&_th]:border [&_th]:border-gray-300 [&_th]:px-2 [&_th]:py-1 [&_th]:bg-gray-100 [&_th]:font-semibold [&_th]:text-xs',
					'[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-1',
					'[&_ul]:list-disc [&_ul]:ml-4 [&_ul]:my-1 [&_ul]:text-sm',
					'[&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:my-1 [&_ol]:text-sm',
					'[&_h1]:text-lg [&_h1]:font-bold [&_h1]:my-2',
					'[&_h2]:text-base [&_h2]:font-bold [&_h2]:my-1.5',
					'[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:my-1',
					'[&_p]:my-1',
					shouldTruncate && 'line-clamp-2'
				)}
			/>
		</div>
	)
}

export { TipTapContent }
