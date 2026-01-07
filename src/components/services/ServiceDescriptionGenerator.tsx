'use client'

import { DescriptionGenerator, type DescriptionGeneratorConfig } from '../ui/DescriptionGenerator'

interface ServiceDescriptionGeneratorProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	categoryName: string | null
	subcategoryName: string | null
	typeName: string | null
	onInsert: (description: string) => void
}

export const ServiceDescriptionGenerator = ({
	open,
	onOpenChange,
	categoryName,
	subcategoryName,
	typeName,
	onInsert,
}: ServiceDescriptionGeneratorProps) => {
	const config: DescriptionGeneratorConfig = {
		type: 'service',
		title: 'Генерація опису послуги',
		description:
			'Заповніть форму та згенеруйте опис послуги за допомогою штучного інтелекту',
		fields: [
			{
				key: 'category',
				label: 'Категорія',
				value: categoryName,
				required: true,
			},
			{
				key: 'subcategory',
				label: 'Підкатегорія',
				value: subcategoryName,
				required: true,
			},
			{
				key: 'type',
				label: 'Тип послуги',
				value: typeName,
				required: true,
			},
		],
	}

	return (
		<DescriptionGenerator
			open={open}
			onOpenChange={onOpenChange}
			config={config}
			onInsert={onInsert}
		/>
	)
}

