import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

type SummarizeResult = {
  summary: string
  keywords: string[]
}

export async function summarizeContent(
  title: string,
  content: string,
  url: string
): Promise<SummarizeResult> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `You are a tech blog assistant. Given a webpage's content, return a JSON object with:
- "summary": 2-3 sentence summary of what this link is about, written for a tech-savvy audience. Be concise and informative.
- "keywords": array of 5-7 relevant keywords/tags (lowercase, single words or short phrases)

URL: ${url}
Title: ${title}

Content:
${content}

Respond ONLY with valid JSON. No markdown, no explanation.`,
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const parsed = JSON.parse(raw)
    return {
      summary: parsed.summary || 'No summary available.',
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    }
  } catch {
    console.error('Failed to parse Claude response:', raw)
    return {
      summary: 'Summary could not be generated.',
      keywords: [],
    }
  }
}