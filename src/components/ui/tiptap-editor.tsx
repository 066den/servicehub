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
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
	Bold,
	Italic,
	Underline as UnderlineIcon,
	Strikethrough,
	List,
	ListOrdered,
	Heading1,
	Heading2,
	Heading3,
	Link as LinkIcon,
	Image as ImageIcon,
	Table as TableIcon,
	Undo,
	Redo,
} from 'lucide-react'
import { Button } from './button'

interface TipTapEditorProps {
	value?: string
	onChange?: (value: string) => void
	placeholder?: string
	className?: string
	error?: boolean
	disabled?: boolean
}

const TipTapEditor = ({
	value,
	onChange,
	placeholder = 'Введіть текст...',
	className,
	error,
	disabled,
}: TipTapEditorProps) => {
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
			Placeholder.configure({
				placeholder,
			}),
		],
		content: value || '',
		onUpdate: ({ editor }) => {
			const json = JSON.stringify(editor.getJSON())
			onChange?.(json)
		},
		editable: !disabled,
		immediatelyRender: false,
	})

	useEffect(() => {
		if (!editor) return

		// Парсим значение, если это JSON строка
		if (value) {
			try {
				const parsed = typeof value === 'string' ? JSON.parse(value) : value
				const currentContent = editor.getJSON()

				// Обновляем только если содержимое отличается
				if (JSON.stringify(currentContent) !== JSON.stringify(parsed)) {
					editor.commands.setContent(parsed)
				}
			} catch {
				// Если не JSON, то это обычный текст - конвертируем в TipTap формат
				if (typeof value === 'string' && !value.startsWith('{')) {
					editor.commands.setContent(value)
				}
			}
		} else {
			editor.commands.clearContent()
		}
	}, [value, editor])

	if (!editor) {
		return null
	}

	const addLink = () => {
		const previousUrl = editor.getAttributes('link').href
		const url = window.prompt('Введіть URL:', previousUrl)

		if (url === null) {
			return
		}

		if (url === '') {
			editor.chain().focus().extendMarkRange('link').unsetLink().run()
			return
		}

		editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
	}

	const addImage = () => {
		const url = window.prompt('Введіть URL зображення:')

		if (url) {
			editor.chain().focus().setImage({ src: url }).run()
		}
	}

	return (
		<div
			className={cn(
				'rounded-lg border-2 border-gray-200 bg-gray-50 transition-all duration-300',
				'focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100',
				'hover:border-gray-300',
				error &&
					'border-red-500 focus-within:border-red-500 focus-within:ring-red-100',
				disabled && 'bg-gray-100 cursor-not-allowed',
				className
			)}
		>
			{/* Панель инструментов */}
			<div className='flex flex-wrap items-center gap-1 p-2 border-b border-gray-200'>
				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={() => editor.chain().focus().toggleBold().run()}
					disabled={
						!editor.can().chain().focus().toggleBold().run() || disabled
					}
					className={cn(
						'h-8 w-8 p-0',
						editor.isActive('bold') && 'bg-gray-200'
					)}
					title='Жирний'
				>
					<Bold className='h-4 w-4' />
				</Button>

				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={() => editor.chain().focus().toggleItalic().run()}
					disabled={
						!editor.can().chain().focus().toggleItalic().run() || disabled
					}
					className={cn(
						'h-8 w-8 p-0',
						editor.isActive('italic') && 'bg-gray-200'
					)}
					title='Курсив'
				>
					<Italic className='h-4 w-4' />
				</Button>

				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={() => editor.chain().focus().toggleUnderline().run()}
					disabled={disabled}
					className={cn(
						'h-8 w-8 p-0',
						editor.isActive('underline') && 'bg-gray-200'
					)}
					title='Підкреслення'
				>
					<UnderlineIcon className='h-4 w-4' />
				</Button>

				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={() => editor.chain().focus().toggleStrike().run()}
					disabled={
						!editor.can().chain().focus().toggleStrike().run() || disabled
					}
					className={cn(
						'h-8 w-8 p-0',
						editor.isActive('strike') && 'bg-gray-200'
					)}
					title='Закреслення'
				>
					<Strikethrough className='h-4 w-4' />
				</Button>

				<div className='w-px h-6 bg-gray-300 mx-1' />

				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 1 }).run()
					}
					disabled={disabled}
					className={cn(
						'h-8 w-8 p-0',
						editor.isActive('heading', { level: 1 }) && 'bg-gray-200'
					)}
					title='Заголовок 1'
				>
					<Heading1 className='h-4 w-4' />
				</Button>

				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 2 }).run()
					}
					disabled={disabled}
					className={cn(
						'h-8 w-8 p-0',
						editor.isActive('heading', { level: 2 }) && 'bg-gray-200'
					)}
					title='Заголовок 2'
				>
					<Heading2 className='h-4 w-4' />
				</Button>

				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 3 }).run()
					}
					disabled={disabled}
					className={cn(
						'h-8 w-8 p-0',
						editor.isActive('heading', { level: 3 }) && 'bg-gray-200'
					)}
					title='Заголовок 3'
				>
					<Heading3 className='h-4 w-4' />
				</Button>

				<div className='w-px h-6 bg-gray-300 mx-1' />

				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					disabled={disabled}
					className={cn(
						'h-8 w-8 p-0',
						editor.isActive('bulletList') && 'bg-gray-200'
					)}
					title='Маркований список'
				>
					<List className='h-4 w-4' />
				</Button>

				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					disabled={disabled}
					className={cn(
						'h-8 w-8 p-0',
						editor.isActive('orderedList') && 'bg-gray-200'
					)}
					title='Нумерований список'
				>
					<ListOrdered className='h-4 w-4' />
				</Button>

				<div className='w-px h-6 bg-gray-300 mx-1' />

				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={addLink}
					disabled={disabled}
					className={cn(
						'h-8 w-8 p-0',
						editor.isActive('link') && 'bg-gray-200'
					)}
					title='Додати посилання'
				>
					<LinkIcon className='h-4 w-4' />
				</Button>

				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={addImage}
					disabled={disabled}
					className='h-8 w-8 p-0'
					title='Додати зображення'
				>
					<ImageIcon className='h-4 w-4' />
				</Button>

				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={() => {
						editor
							.chain()
							.focus()
							.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
							.run()
					}}
					disabled={disabled}
					className='h-8 w-8 p-0'
					title='Додати таблицю'
				>
					<TableIcon className='h-4 w-4' />
				</Button>

				<div className='w-px h-6 bg-gray-300 mx-1' />

				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={() => editor.chain().focus().undo().run()}
					disabled={!editor.can().chain().focus().undo().run() || disabled}
					className='h-8 w-8 p-0'
					title='Скасувати'
				>
					<Undo className='h-4 w-4' />
				</Button>

				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={() => editor.chain().focus().redo().run()}
					disabled={!editor.can().chain().focus().redo().run() || disabled}
					className='h-8 w-8 p-0'
					title='Повторити'
				>
					<Redo className='h-4 w-4' />
				</Button>
			</div>

			{/* Область редактирования */}
			<EditorContent
				editor={editor}
				className={cn(
					'prose prose-sm max-w-none focus:outline-none',
					'[&_.ProseMirror]:min-h-[200px] [&_.ProseMirror]:px-4 [&_.ProseMirror]:py-3',
					'[&_.ProseMirror]:outline-none [&_.ProseMirror]:text-base [&_.ProseMirror]:text-gray-900',
					'[&_.ProseMirror_.is-empty::before]:content-[attr(data-placeholder)]',
					'[&_.ProseMirror_.is-empty::before]:float-left [&_.ProseMirror_.is-empty::before]:pointer-events-none [&_.ProseMirror_.is-empty::before]:text-gray-500 [&_.ProseMirror_.is-empty::before]:h-0',
					'[&_table]:border-collapse [&_table]:w-full [&_table]:my-4',
					'[&_td]:border [&_td]:border-gray-300 [&_td]:px-2 [&_td]:py-1',
					'[&_th]:border [&_th]:border-gray-300 [&_th]:px-2 [&_th]:py-1 [&_th]:bg-gray-100 [&_th]:font-semibold',
					'[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-2',
					'[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-2',
					'[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-2',
					'[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:my-4',
					'[&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-3',
					'[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:my-2',
					disabled &&
						'[&_.ProseMirror]:cursor-not-allowed [&_.ProseMirror]:opacity-60'
				)}
			/>
		</div>
	)
}

export { TipTapEditor }
