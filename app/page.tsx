'use client'

import { useState, useEffect, useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'

type Post = {
  id: string
  url: string
  title: string
  summary: string
  keywords: string[]
  favicon_url: string | null
  domain: string | null
  created_at: string
}

function estimateReadTime(text: string): number {
  const words = text.split(' ').length
  return Math.max(1, Math.ceil(words / 200))
}

function decodeHtml(html: string): string {
  return html
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&hellip;/g, '…')
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [dark, setDark] = useState(false)
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(data => { setPosts(data); setLoading(false) })
  }, [])

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    posts.forEach(p => p.keywords?.forEach(k => tags.add(k)))
    return Array.from(tags).slice(0, 20)
  }, [posts])

  const filtered = useMemo(() => {
    return posts.filter(p => {
      const matchSearch = search === '' ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.summary.toLowerCase().includes(search.toLowerCase())
      const matchTag = !activeTag || p.keywords?.includes(activeTag)
      return matchSearch && matchTag
    })
  }, [posts, search, activeTag])

  const bg = dark ? '#0a0a0a' : '#f5f0e8'
  const fg = dark ? '#f0ece0' : '#1a1208'
  const accent = '#e8472a'
  const muted = dark ? '#555' : '#999'
  const cardBg = dark ? '#111' : '#fff'
  const border = dark ? '#222' : '#e0d8cc'
  const tagBg = dark ? '#1a1a1a' : '#ede8df'
  const tagFg = dark ? '#888' : '#666'

  return (
    <div style={{
      minHeight: '100vh',
      background: bg,
      color: fg,
      fontFamily: "'DM Mono', 'Courier New', monospace",
      transition: 'background 0.3s, color 0.3s'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: ${accent}; color: #fff; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${accent}; }
        .card { transition: transform 0.2s, box-shadow 0.2s; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
        .tag { cursor: pointer; transition: all 0.15s; }
        .tag:hover { background: ${accent} !important; color: #fff !important; }
        .search-input::placeholder { color: ${muted}; }
        .search-input:focus { outline: none; border-color: ${accent} !important; }
        .he-btn { transition: all 0.15s; }
        .he-btn:hover { background: #2563eb !important; color: #fff !important; border-color: #2563eb !important; }
        .title-link:hover { text-decoration: underline !important; text-underline-offset: 4px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .post-card { animation: fadeUp 0.4s ease forwards; opacity: 0; }
      `}</style>

      {/* Header */}
      <header style={{
        borderBottom: `1px solid ${border}`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: bg,
        backdropFilter: 'blur(12px)',
        direction: 'ltr',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
            <div>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: '-0.5px',
                color: fg
              }}>
                DAVID'S<span style={{ color: accent }}>.</span>FEED
              </div>
              <div style={{ fontSize: 10, color: muted, letterSpacing: '0.15em', marginTop: 2 }}>
                LINKS WORTH READING
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <input
                  className="search-input"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  style={{
                    background: 'transparent',
                    border: `1px solid ${border}`,
                    borderRadius: 4,
                    padding: '6px 12px 6px 32px',
                    color: fg,
                    fontSize: 12,
                    width: 160,
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s'
                  }}
                />
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: muted, fontSize: 12 }}>⌕</span>
              </div>

              {/* Dark/Light toggle */}
              <button
                onClick={() => setDark(!dark)}
                style={{
                  background: 'transparent',
                  border: `1px solid ${border}`,
                  borderRadius: 4,
                  padding: '6px 10px',
                  color: fg,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s'
                }}
              >
                {dark ? '○' : '●'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero line */}
      <div style={{ borderBottom: `3px solid ${accent}`, maxWidth: 1100, margin: '0 auto', paddingLeft: 24, paddingRight: 24 }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(48px, 8vw, 96px)',
          fontWeight: 900,
          lineHeight: 0.9,
          letterSpacing: '-3px',
          padding: '32px 0 24px',
          color: fg
        }}>
          THE<br />
          <span style={{ color: accent, fontStyle: 'italic' }}>FEED</span>
        </div>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 24px', borderBottom: `1px solid ${border}` }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: muted, letterSpacing: '0.1em', marginRight: 4 }}>FILTER</span>
            <button
              className="tag"
              onClick={() => setActiveTag(null)}
              style={{
                background: !activeTag ? accent : tagBg,
                color: !activeTag ? '#fff' : tagFg,
                border: 'none',
                borderRadius: 2,
                padding: '4px 10px',
                fontSize: 11,
                fontFamily: 'inherit',
                letterSpacing: '0.05em',
                cursor: 'pointer'
              }}
            >
              ALL
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                className="tag"
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                style={{
                  background: activeTag === tag ? accent : tagBg,
                  color: activeTag === tag ? '#fff' : tagFg,
                  border: 'none',
                  borderRadius: 2,
                  padding: '4px 10px',
                  fontSize: 11,
                  fontFamily: 'inherit',
                  letterSpacing: '0.05em',
                  cursor: 'pointer'
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Posts */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 64px' }}>
        {loading && (
          <div style={{ padding: '64px 0', textAlign: 'center', color: muted, fontSize: 12, letterSpacing: '0.1em' }}>
            LOADING...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ padding: '64px 0', textAlign: 'center', color: muted, fontSize: 12, letterSpacing: '0.1em' }}>
            NO RESULTS
          </div>
        )}

        {/* Featured post */}
        {!loading && filtered.length > 0 && (() => {
          const post = filtered[0]
          const readTime = estimateReadTime(post.summary)
          return (
            <div
              className="card post-card"
              style={{
                display: 'block',
                background: cardBg,
                borderBottom: `1px solid ${border}`,
                padding: '40px 28px',
                marginTop: 1,
                animationDelay: '0.05s',
                direction: 'ltr',
              }}
            >
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
                <span style={{
                  background: accent,
                  color: '#fff',
                  fontSize: 9,
                  letterSpacing: '0.15em',
                  padding: '3px 8px',
                  fontWeight: 500
                }}>LATEST</span>
                <span style={{ fontSize: 11, color: muted }}>{post.domain}</span>
                <span style={{ fontSize: 11, color: muted }}>·</span>
                <span style={{ fontSize: 11, color: muted }}>{readTime} min read</span>
                <span style={{ fontSize: 11, color: muted }}>·</span>
                <span style={{ fontSize: 11, color: muted }}>
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
              </div>
              <h2 style={{ marginBottom: 16, maxWidth: 800 }}>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="title-link"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 'clamp(28px, 4vw, 48px)',
                    fontWeight: 700,
                    lineHeight: 1.1,
                    letterSpacing: '-1px',
                    color: 'inherit',
                    textDecoration: 'none',
                    direction: 'ltr',
                    unicodeBidi: 'plaintext',
                    display: 'block',
                  }}
                >
                  {decodeHtml(post.title)}
                </a>
              </h2>
              <p style={{ fontSize: 15, color: dark ? '#aaa' : '#555', lineHeight: 1.7, maxWidth: 680, marginBottom: 20 }}>
                {post.summary}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {post.keywords?.slice(0, 5).map(k => (
                  <span key={k} style={{
                    background: tagBg,
                    color: tagFg,
                    fontSize: 10,
                    padding: '3px 8px',
                    borderRadius: 2,
                    letterSpacing: '0.05em'
                  }}>{k}</span>
                ))}

              </div>
            </div>
          )
        })()}

        {/* Grid of remaining posts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 1,
          background: border,
          marginTop: 1
        }}>
          {filtered.slice(1).map((post, i) => {
            const readTime = estimateReadTime(post.summary)
            return (
              <div
                key={post.id}
                className="card post-card"
                style={{
                  display: 'block',
                  background: cardBg,
                  padding: '28px 24px',
                  animationDelay: `${0.05 * (i + 2)}s`,
                  direction: 'ltr',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  {post.favicon_url && (
                    <img src={post.favicon_url} width={14} height={14} style={{ borderRadius: 2 }} alt="" />
                  )}
                  <span style={{ fontSize: 10, color: muted, letterSpacing: '0.08em' }}>{post.domain}</span>
                  <span style={{ fontSize: 10, color: muted }}>·</span>
                  <span style={{ fontSize: 10, color: muted }}>{readTime}m</span>
                </div>

                <h3 style={{ marginBottom: 10 }}>
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="title-link"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 20,
                      fontWeight: 700,
                      lineHeight: 1.2,
                      letterSpacing: '-0.3px',
                      color: 'inherit',
                      textDecoration: 'none',
                      direction: 'ltr',
                      unicodeBidi: 'plaintext',
                      display: 'block',
                    }}
                  >
                    {decodeHtml(post.title)}
                  </a>
                </h3>

                <p style={{
                  fontSize: 13,
                  color: dark ? '#888' : '#666',
                  lineHeight: 1.6,
                  marginBottom: 16,
                }}>
                  {post.summary}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    {post.keywords?.slice(0, 2).map(k => (
                      <span key={k} style={{
                        background: tagBg,
                        color: tagFg,
                        fontSize: 9,
                        padding: '2px 6px',
                        borderRadius: 2,
                        letterSpacing: '0.05em'
                      }}>{k}</span>
                    ))}

                  </div>
                  <span style={{ fontSize: 10, color: muted, whiteSpace: 'nowrap', marginLeft: 8 }}>
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${border}`,
        padding: '24px',
        textAlign: 'center',
        color: muted,
        fontSize: 11,
        letterSpacing: '0.1em'
      }}>
        DAVID'S TECH FEED · SUMMARIZED BY AI
      </footer>
    </div>
  )
}
