import { supabase, Post } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'

export const revalidate = 60

async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return []
  }
  return data as Post[]
}

export default async function HomePage() {
  const posts = await getPosts()

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold text-white">{"David's Tech Feed"}</h1>
          <p className="text-sm text-gray-500 mt-1">Links worth reading, summarized by AI</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {posts.length === 0 && (
          <p className="text-gray-500 text-sm">No posts yet. Add one via /admin.</p>
        )}

        {posts.map((post) => (
          <article
            key={post.id}
            className="border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-start gap-3">
              {post.favicon_url && (
                <img
   src={post.favicon_url}
    alt=""
    className="w-5 h-5 mt-0.5 rounded-sm flex-shrink-0"
  />
)}
              <div className="flex-1 min-w-0">
                
<a                href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-white hover:text-blue-400 transition-colors leading-snug block"
                >
                  {post.title}
                </a>
                <span className="text-xs text-gray-600 mt-0.5 block">
                  {post.domain} · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-400 mt-3 leading-relaxed">{post.summary}</p>

            {post.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {post.keywords.map((k) => (
                  <span
                    key={k}
                    className="text-xs bg-gray-800 text-gray-400 px-2.5 py-0.5 rounded-full border border-gray-700"
                  >
                    {k}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </main>
  )
}