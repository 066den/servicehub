import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'

interface GenerateDescriptionRequest {
	prompt: string
}

export async function POST(req: Request) {
	const session = await getServerSession(authOptions)

	if (!session?.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	try {
		const body: GenerateDescriptionRequest = await req.json()

		if (!body.prompt) {
			return NextResponse.json(
				{ error: 'Prompt is required' },
				{ status: 400 }
			)
		}

		const openaiApiKey = process.env.OPENAI_API_KEY

		if (!openaiApiKey) {
			console.error('OPENAI_API_KEY is not set in environment variables')
			return NextResponse.json(
				{ error: 'OpenAI API key is not configured' },
				{ status: 500 }
			)
		}

		// Вызов OpenAI API
		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${openaiApiKey}`,
			},
			body: JSON.stringify({
				model: 'gpt-4o-mini',
				messages: [
					{
						role: 'system',
						content:
							'Ти корисний асистент, який допомагає створювати якісний контент українською мовою. Відповідай точно на запит користувача.',
					},
					{
						role: 'user',
						content: body.prompt,
					},
				],
				temperature: 0.7,
				max_tokens: 2000,
			}),
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}))
			console.error('OpenAI API error:', errorData)
			return NextResponse.json(
				{
					error:
						errorData.error?.message ||
						'Failed to generate description',
				},
				{ status: response.status }
			)
		}

		const data = await response.json()
		const content = data.choices?.[0]?.message?.content

		if (!content) {
			return NextResponse.json(
				{ error: 'No content received from OpenAI' },
				{ status: 500 }
			)
		}

		// Возвращаем текст ответа как есть
		// Парсинг JSON (если требуется) выполняется на клиенте
		return NextResponse.json({
			success: true,
			text: content.trim(),
		})
	} catch (error) {
		console.error('Error generating description:', error)
		return NextResponse.json(
			{
				error: 'Internal server error',
				details:
					error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		)
	}
}

