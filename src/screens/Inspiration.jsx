import { useState } from 'react'

const FILTERS = ['All', '🔥 Trending', '⚡ Hot', '💼 Business', '📚 Education', '🌿 Lifestyle', '💻 Tech']

const ITEMS = [
  {
    id: 1, author: 'TWIN Team', handle: '@twin',
    title: '3 habits that doubled my productivity',
    category: 'Business', format: 'TikTok',
    gradient: 'linear-gradient(160deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)',
    textColor: '#e0e0ff',
    height: 220, verified: true, likes: 4821, saved: true,
    avatar: '⚡',
  },
  {
    id: 2, author: 'Sofia R.', handle: '@sofiar',
    title: 'How I learned Spanish in 90 days',
    category: 'Education', format: 'YouTube Short',
    gradient: 'linear-gradient(160deg,#f8b500 0%,#e06c00 100%)',
    textColor: '#fff',
    height: 300, verified: false, likes: 2340, saved: false,
    avatar: '🎓',
  },
  {
    id: 3, author: 'TWIN Team', handle: '@twin',
    title: 'Morning routine that actually works',
    category: 'Lifestyle', format: 'Instagram Reel',
    gradient: 'linear-gradient(160deg,#e8f5e9 0%,#a5d6a7 50%,#388e3c 100%)',
    textColor: '#1b5e20',
    height: 260, verified: true, likes: 7103, saved: true,
    avatar: '🌿',
  },
  {
    id: 4, author: 'Marcus K.', handle: '@marcusk',
    title: 'Neural networks explained simply',
    category: 'Tech', format: 'TED Talk',
    gradient: 'linear-gradient(160deg,#0d0d0d 0%,#1a1a1a 40%,#2d2d2d 100%)',
    textColor: '#00e5ff',
    height: 190, verified: false, likes: 9430, saved: false,
    avatar: '🤖',
  },
  {
    id: 5, author: 'Elena V.', handle: '@elenav',
    title: 'Stop doing this in job interviews',
    category: 'Business', format: 'TikTok',
    gradient: 'linear-gradient(160deg,#fce4ec 0%,#f48fb1 50%,#c2185b 100%)',
    textColor: '#4a0019',
    height: 240, verified: false, likes: 5677, saved: true,
    avatar: '💼',
  },
  {
    id: 6, author: 'TWIN Team', handle: '@twin',
    title: 'Why your content gets 0 views',
    category: 'Education', format: 'Instagram Reel',
    gradient: 'linear-gradient(160deg,#1c1c3a 0%,#3949ab 100%)',
    textColor: '#c5cae9',
    height: 280, verified: true, likes: 12041, saved: false,
    avatar: '⚡',
  },
  {
    id: 7, author: 'Jordan M.', handle: '@jordanm',
    title: '5 apps I use every single day',
    category: 'Tech', format: 'TikTok',
    gradient: 'linear-gradient(160deg,#fff8e1 0%,#ffcc02 50%,#ff8f00 100%)',
    textColor: '#3e2000',
    height: 200, verified: false, likes: 3210, saved: false,
    avatar: '📱',
  },
  {
    id: 8, author: 'Zoe P.', handle: '@zoep',
    title: 'Meal prep Sunday — under $40',
    category: 'Lifestyle', format: 'YouTube Short',
    gradient: 'linear-gradient(160deg,#e8eaf6 0%,#9fa8da 50%,#3f51b5 100%)',
    textColor: '#1a237e',
    height: 310, verified: false, likes: 6550, saved: true,
    avatar: '🥗',
  },
  {
    id: 9, author: 'TWIN Team', handle: '@twin',
    title: 'How to go viral on LinkedIn',
    category: 'Business', format: 'TED Talk',
    gradient: 'linear-gradient(160deg,#0a192f 0%,#172a45 50%,#1e3a5f 100%)',
    textColor: '#64ffda',
    height: 230, verified: true, likes: 8820, saved: false,
    avatar: '⚡',
  },
  {
    id: 10, author: 'Alex T.', handle: '@alext',
    title: 'Build in public — my $0 to $1k story',
    category: 'Business', format: 'Instagram Reel',
    gradient: 'linear-gradient(160deg,#f3e5f5 0%,#ce93d8 50%,#7b1fa2 100%)',
    textColor: '#fff',
    height: 260, verified: false, likes: 4100, saved: true,
    avatar: '🚀',
  },
  {
    id: 11, author: 'Nina L.', handle: '@ninal',
    title: 'Reading 1 book a week changed me',
    category: 'Lifestyle', format: 'TikTok',
    gradient: 'linear-gradient(160deg,#efebe9 0%,#bcaaa4 50%,#6d4c41 100%)',
    textColor: '#fff',
    height: 210, verified: false, likes: 2890, saved: false,
    avatar: '📖',
  },
  {
    id: 12, author: 'TWIN Team', handle: '@twin',
    title: 'AI tools that save 10h per week',
    category: 'Tech', format: 'YouTube Short',
    gradient: 'linear-gradient(160deg,#e0f2f1 0%,#4db6ac 50%,#00695c 100%)',
    textColor: '#fff',
    height: 250, verified: true, likes: 15230, saved: true,
    avatar: '⚡',
  },
]

const CATEGORY_MAP = {
  'All': null,
  '🔥 Trending': null,   // uses top likes
  '⚡ Hot': null,
  '💼 Business': 'Business',
  '📚 Education': 'Education',
  '🌿 Lifestyle': 'Lifestyle',
  '💻 Tech': 'Tech',
}

function formatLikes(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k'
  return String(n)
}

export default function Inspiration({ onMakeSimilar }) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [saved, setSaved] = useState(() => {
    const s = {}
    ITEMS.forEach(i => { s[i.id] = i.saved })
    return s
  })

  const categoryFilter = CATEGORY_MAP[activeFilter]
  let filtered = categoryFilter
    ? ITEMS.filter(i => i.category === categoryFilter)
    : activeFilter === '🔥 Trending' ? [...ITEMS].sort((a, b) => b.likes - a.likes)
    : activeFilter === '⚡ Hot'      ? [...ITEMS].sort((a, b) => b.likes - a.likes).slice(0, 6)
    : ITEMS

  // Split into two columns, distributing by cumulative height
  const left = [], right = []
  let leftH = 0, rightH = 0
  filtered.forEach(item => {
    if (leftH <= rightH) { left.push(item); leftH += item.height }
    else                  { right.push(item); rightH += item.height }
  })

  const toggleSave = (id) => setSaved(prev => ({ ...prev, [id]: !prev[id] }))

  const renderCard = (item) => (
    <div key={item.id} className="inspo-card">
      {/* Thumbnail */}
      <div
        className="inspo-thumb"
        style={{ background: item.gradient, height: item.height }}
      >
        {/* AI badge */}
        <div className="inspo-ai-badge">AI</div>

        {/* Format pill */}
        <div className="inspo-format-pill">{item.format}</div>

        {/* Save button */}
        <button
          className={`inspo-save-btn ${saved[item.id] ? 'saved' : ''}`}
          onClick={() => toggleSave(item.id)}
        >
          {saved[item.id] ? '♥' : '♡'}
        </button>

        {/* Play overlay */}
        <div className="inspo-play-overlay">
          <div className="inspo-play-btn">▶</div>
        </div>

        {/* Bottom text overlay */}
        <div className="inspo-thumb-footer" style={{ color: item.textColor }}>
          <div className="inspo-card-title">{item.title}</div>
        </div>
      </div>

      {/* Card footer */}
      <div className="inspo-card-footer">
        <div className="inspo-author-row">
          <div className="inspo-avatar">{item.avatar}</div>
          <div className="inspo-author-info">
            <span className="inspo-author-name">{item.author}</span>
            {item.verified && <span className="inspo-verified">✦</span>}
          </div>
          <span className="inspo-likes">♥ {formatLikes(item.likes)}</span>
        </div>
        <button
          className="inspo-make-similar"
          onClick={() => onMakeSimilar && onMakeSimilar(item)}
        >
          Make similar →
        </button>
      </div>
    </div>
  )

  return (
    <div className="inspo-screen">
      {/* Filter pills */}
      <div className="inspo-filters">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`inspo-filter-pill ${activeFilter === f ? 'active' : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Two-column masonry */}
      <div className="inspo-grid">
        <div className="inspo-col">{left.map(renderCard)}</div>
        <div className="inspo-col">{right.map(renderCard)}</div>
      </div>
    </div>
  )
}
