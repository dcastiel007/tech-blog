import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const PAGE_SIZE = 20

export const revalidate = 60

type MaybeCause = {
  message?: string
  code?: string
  details?: string
  cause?: { code?: string; message?: string; hostname?: string; port?: number }
}

// Surfaces the real reason in the Vercel runtime logs. `fetch failed` on its own
// says nothing - the useful detail (ENOTFOUND / ECONNREFUSED / ETIMEDOUT, and the
// host that failed) lives on err.cause, which String(err) drops.
function logFailure(stage: string, err: unknown) {
  const e = (err ?? {}) as MaybeCause
  console.error('[api/posts] failed', {
    stage,
    message: e.message ?? String(err),
    code: e.code,
    details: e.details,
    causeCode: e.cause?.code,
    causeMessage: e.cause?.message,
    causeHost: e.cause?.hostname,
    causePort: e.cause?.port,
  })
}

// Keeps the response shape intact so the client never gets `undefined` where it
// expects an array. 503 rather than 500: the data source is temporarily
// unreachable, the request itself was fine.
function unavailable(page: number) {
  return NextResponse.json(
    { posts: [], total: 0, page, hasMore: false, error: 'Data source unavailable' },
    { status: 503 }
  )
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const parsedPage = parseInt(searchParams.get('page') || '0', 10)
  const page = Number.isFinite(parsedPage) && parsedPage >= 0 ? parsedPage : 0
  const tag = searchParams.get('tag') || ''
  const search = searchParams.get('search') || ''
  const favoritesOnly = searchParams.get('favorites') === '1'

  try {
    let query = supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (tag) query = query.contains('keywords', [tag])
    if (search) query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`)
    if (favoritesOnly) query = query.eq('is_favorite', true)

    const { data, error, count } = await query

    if (error) {
      logFailure('supabase', error)
      return unavailable(page)
    }

    const posts = Array.isArray(data) ? data : []
    const total = count ?? 0

    return NextResponse.json({
      posts,
      total,
      page,
      hasMore: (page + 1) * PAGE_SIZE < total,
    })
  } catch (err) {
    logFailure('throw', err)
    return unavailable(page)
  }
}
