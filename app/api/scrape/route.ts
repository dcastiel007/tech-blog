import { NextRequest, NextResponse } from 'next/server'
import { scrapeUrl } from '@/lib/scraper'
import { summarizeContent } from '@/lib/summarize'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('x-admin-password')
  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { url } = body

  if (!url || !isValidUrl(url)) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  try {
    const { title, content, domain, favicon_url } = await scrapeUrl(url)

    if (!content || content.length < 100) {
      return NextResponse.json(
        { error: 'Could not extract meaningful content from this URL.' },
        { status: 422 }
      )
    }

    const { summary, keywords } = await summarizeContent(title, content, url)

    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert({ url, title, summary, keywords, favicon_url, domain })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, post: data })
  } catch (err: any) {
    console.error('Scrape/summarize error:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}

function isValidUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}