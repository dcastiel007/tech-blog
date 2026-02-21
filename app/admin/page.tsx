'use client'

import { useState } from 'react'

export default function AdminPage() {
  const [url, setUrl] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [lastPost, setLastPost] = useState<any>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
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
      setLastPost(data.post)
      setUrl('')
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-8 text-white">Post a Link</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-sm text-gray-400 mb-1">Admin Password</label>
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
            disabled={status === 'loading'}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
          >
            {status === 'loading' ? 'Processing...' : 'Create Post'}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-sm ${status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
            {message}
          </p>
        )}

        {lastPost && status === 'success' && (
          <div className="mt-6 bg-gray-800 rounded-lg p-4 space-y-2">
            <p className="font-semibold text-white">{lastPost.title}</p>
            <p className="text-sm text-gray-400">{lastPost.summary}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {lastPost.keywords.map((k: string) => (
                <span key={k} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                  {k}
                </span>
              ))}
            </div>
            <a href="/" className="block mt-3 text-xs text-blue-400 hover:underline">
              → View on blog
            </a>
          </div>
        )}
      </div>
    </main>
  )
}