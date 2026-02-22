import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const PAGE_SIZE = 20

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '0')
  const tag = searchParams.get('tag') || ''
  const search = searchParams.get('search') || ''

  let query = supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

  if (tag) {
    query = query.contains('keywords', [tag])
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`)
  }

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    posts: data,
    total: count,
    page,
    hasMore: (page + 1) * PAGE_SIZE < (count || 0)
  })
}