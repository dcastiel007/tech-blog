'use client'

import { useState } from 'react'

type Post = {
  id: string
  url: string
  title: string
  summary: string
  keywords: string[]
  domain: string
  created_at: string
}

export default function AdminPage() {
  const [url, setUrl] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmed, setPasswordConfirmed] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [loadingPosts, setLoadingPosts] = useState(false)

  async function fetchPosts(pw: string) {
    setLoadingPosts(true)
    const res = await fetch('/api/posts')
    const data = await res.json()
    if (Array.isArray(data)) {
      setPosts(data)
      setPasswordConfirmed(true)
    }
    setLoadingPosts(false)
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    fetchPosts(password)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const res = await fetch('/api/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password,
      },
      body: JSON.stringify({ url }),
    })

    const data = await res.json()

    if (!res.ok) {
      setStatus('error')
      setMessage(data.error || 'Unknown error')
      return
    }

    setStatus('success')
    setMessage('Post created!')
    setUrl('')
    fetchPosts(password)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this post?')) return
    await fetch(`/api/posts/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': password },
    })
    fetchPosts(password)
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingPost) return

    await fetch(`/api/posts/${editingPost.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password,
      },
      body: JSON.stringify({
        title: editingPost.title,
        summary: editingPost.summary,
        keywords: editingPost.keywords,
      }),
    })

    setEditingPost(null)
    fetchPosts(password)
  }

  if (!passwordConfirmed) {
    return (
      <main className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-8 text-white">Admin</h1>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Enter
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-white">Admin</h1>

        <form onSubmit={handleSubmit} className="space-y-4 mb-12">
          <div>
            <label className="block text-sm text-gray-400 mb-1">URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {status === 'loading' ? 'Processing...' : 'Create Post'}
          </button>
          {message && (
            <p className={`text-sm ${status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
              {message}
            </p>
          )}
        </form>

        {editingPost && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleEdit} className="bg-gray-900 rounded-xl p-6 w-full max-w-lg space-y-4">
              <h2 className="text-lg font-bold text-white">Edit Post</h2>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  value={editingPost.title}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Summary</label>
                <textarea
                  value={editingPost.summary}
                  onChange={(e) => setEditingPost({ ...editingPost, summary: e.target.value })}
                  rows={4}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Keywords (comma separated)</label>
                <input
                  value={editingPost.keywords.join(', ')}
                  onChange={(e) => setEditingPost({ ...editingPost, keywords: e.target.value.split(',').map(k => k.trim()) })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg">Save</button>
                <button type="button" onClick={() => setEditingPost(null)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <h2 className="text-lg font-semibold text-white mb-4">All Posts</h2>
        {loadingPosts && <p className="text-gray-500 text-sm">Loading...</p>}
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="border border-gray-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{post.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{post.domain}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setEditingPost(post)}
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-xs bg-red-900/50 hover:bg-red-800 text-red-400 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}