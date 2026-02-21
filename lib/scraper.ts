export async function scrapeUrl(url: string): Promise<{
  title: string
  content: string
  domain: string
  favicon_url: string
}> {
  const domain = new URL(url).hostname.replace('www.', '')
  const favicon_url = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`

  try {
    const jinaUrl = `https://r.jina.ai/${url}`
    const res = await fetch(jinaUrl, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) throw new Error(`Jina failed: ${res.status}`)

    const data = await res.json()

    return {
      title: data.data?.title || domain,
      content: data.data?.content?.slice(0, 8000) || '',
      domain,
      favicon_url,
    }
  } catch (err) {
    console.warn('Jina failed, falling back to raw fetch:', err)

    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })

    const html = await res.text()
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch?.[1]?.trim() || domain

    const stripped = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 6000)

    return { title, content: stripped, domain, favicon_url }
  }
}