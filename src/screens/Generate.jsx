import { useState, useRef, useEffect } from 'react'

const FORMATS = [
  { id: 'tiktok',   label: 'TikTok',         hint: '15–30s'  },
  { id: 'reels',    label: 'Instagram Reel',  hint: '20–30s'  },
  { id: 'youtube',  label: 'YouTube Short',   hint: '30–60s'  },
  { id: 'tedtalk',  label: 'TED Talk',        hint: '2–5 min' },
]

const TRENDS = [
  '🔥 POV storytelling', '⚡ 3 tips format', '💡 Myth vs. fact',
  '📈 Before & after', '🎯 Hot take', '🌊 Day in my life',
]

// Starter suggestions shown when prompt is empty
const STARTER_SUGGESTIONS = [
  { label: '3 tips', text: '3 tips that changed how I approach my work every day' },
  { label: 'My story', text: 'How I went from zero to my first $1k online' },
  { label: 'Hot take', text: 'Unpopular opinion: most productivity advice is completely wrong' },
  { label: 'Tutorial', text: 'Step by step: how to build an audience from scratch in 30 days' },
  { label: 'Myth busting', text: 'Everyone thinks this is the best approach — but here\'s what actually works' },
  { label: 'Before & after', text: 'I used to struggle with this every day until I discovered one simple shift' },
  { label: 'Day in my life', text: 'What my typical morning looks like as a content creator' },
]

// Contextual suggestions shown while typing
const CONTEXTUAL = [
  { trigger: /money|financ|earn|income|revenue|profit/i,
    items: ['Add specific numbers ($500/month)', 'Mention the time frame (90 days)', 'Include a before/after'] },
  { trigger: /fitness|gym|workout|health|diet|weight/i,
    items: ['Add your personal result', 'Name the exact routine', 'Mention the biggest mistake people make'] },
  { trigger: /learn|study|skill|course|book|read/i,
    items: ['Describe who this is for', 'Add the time it takes', 'Include one surprising fact'] },
  { trigger: /social|tiktok|instagram|youtube|content|viral/i,
    items: ['Add your niche context', 'Mention the platform algorithm trick', 'Include a real stat'] },
  { trigger: /business|startup|product|brand|marketing/i,
    items: ['Specify your target audience', 'Add the key insight', 'Mention a common myth'] },
]

// Enhanced versions for the AI Enhance simulation
const ENHANCE_MAP = [
  { trigger: /.{1,}/,  // matches anything
    enhance: (t) => {
      const first = t.trim().replace(/[.!?]+$/, '')
      return `${first}.\n\nIn this video I'll break it down into 3 clear steps — no fluff, just what actually works. By the end you'll know exactly what to do and where most people go wrong.`
    }
  },
]

function getContextualSuggestions(text) {
  if (!text || text.length < 4) return []
  for (const rule of CONTEXTUAL) {
    if (rule.trigger.test(text)) return rule.items
  }
  return []
}

export default function Generate({ onGenerate, onOpenAvatar, selectedAvatar }) {
  const avatar = selectedAvatar ?? { name: 'My Avatar', emoji: '🧑‍💼', gradient: 'linear-gradient(135deg,#F4C5B0,#C0513A)' }
  const [prompt, setPrompt]             = useState('')
  const [format, setFormat]             = useState('tiktok')
  const [variations, setVariations]     = useState(1)
  const [activePanel, setActivePanel]   = useState(null)
  const [linkValue, setLinkValue]       = useState('')
  const [selectedTrend, setSelectedTrend] = useState(null)
  const [isRecording, setIsRecording]   = useState(false)
  const [recordingDone, setRecordingDone] = useState(false)
  const [isFocused, setIsFocused]       = useState(false)
  const [isEnhancing, setIsEnhancing]   = useState(false)
  const [enhancedFlag, setEnhancedFlag] = useState(false)
  const recordTimer = useRef(null)
  const enhanceTimer = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => () => {
    clearTimeout(recordTimer.current)
    clearTimeout(enhanceTimer.current)
  }, [])

  const togglePanel = (panel) =>
    setActivePanel(prev => prev === panel ? null : panel)

  const startRecording = () => {
    setIsRecording(true)
    recordTimer.current = setTimeout(() => {
      setIsRecording(false)
      setRecordingDone(true)
    }, 4000)
  }

  const resetRecording = () => {
    clearTimeout(recordTimer.current)
    setIsRecording(false)
    setRecordingDone(false)
  }

  const handleEnhance = () => {
    if (!prompt.trim() || isEnhancing) return
    setIsEnhancing(true)
    setEnhancedFlag(false)
    enhanceTimer.current = setTimeout(() => {
      const rule = ENHANCE_MAP.find(r => r.trigger.test(prompt))
      if (rule) setPrompt(rule.enhance(prompt))
      setIsEnhancing(false)
      setEnhancedFlag(true)
      setTimeout(() => setEnhancedFlag(false), 3000)
    }, 1800)
  }

  const applySuggestion = (text) => {
    setPrompt(text)
    setEnhancedFlag(false)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  const handleGenerate = () => {
    if (!prompt.trim()) return
    onGenerate({ prompt, format, variations })
    setPrompt('')
    setSelectedTrend(null)
    setLinkValue('')
    setRecordingDone(false)
    setActivePanel(null)
    setEnhancedFlag(false)
  }

  const contextual   = getContextualSuggestions(prompt)
  const showStarters = !prompt.trim() && isFocused
  const showContextual = prompt.trim().length >= 4 && contextual.length > 0

  const attachments = [
    linkValue     && `🔗 ${linkValue.replace(/^https?:\/\//, '').slice(0, 24)}…`,
    selectedTrend && selectedTrend,
    recordingDone && '🎤 Audio note',
  ].filter(Boolean)

  return (
    <div className="gen-screen">

      {/* Avatar row */}
      <div className="gen-avatar-row" style={{ cursor: 'pointer' }} onClick={onOpenAvatar}>
        <div className="gen-avatar-thumb" style={{ background: avatar.gradient }}>
          <span style={{ fontSize: 22 }}>{avatar.emoji}</span>
        </div>
        <div className="gen-avatar-info">
          <div className="gen-avatar-name">{avatar.name}</div>
          <div className="gen-avatar-sub">{avatar.mine === false ? 'Preset avatar' : 'Ready to use'}</div>
        </div>
        <span className="gen-avatar-chevron">›</span>
      </div>

      {/* Prompt card */}
      <div className="gen-card">
        <div className="gen-prompt-header">
          <label className="gen-label">What's your video about?</label>
          {enhancedFlag && (
            <span className="gen-enhanced-badge fade-in">✨ Enhanced</span>
          )}
        </div>

        {/* Textarea */}
        <div className={`gen-textarea-wrap ${isEnhancing ? 'enhancing' : ''}`}>
          <textarea
            ref={textareaRef}
            className="gen-textarea"
            placeholder="Share your idea, topic or key message…"
            value={isEnhancing ? '' : prompt}
            onChange={e => { setPrompt(e.target.value); setEnhancedFlag(false) }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            rows={4}
          />
          {isEnhancing && (
            <div className="gen-enhance-shimmer">
              <div className="gen-shimmer-line" style={{ width: '85%' }} />
              <div className="gen-shimmer-line" style={{ width: '65%' }} />
              <div className="gen-shimmer-line" style={{ width: '75%' }} />
              <div className="gen-shimmer-line" style={{ width: '40%' }} />
            </div>
          )}
        </div>

        {/* Starter suggestions (empty state) */}
        {showStarters && (
          <div className="gen-suggestions-row">
            {STARTER_SUGGESTIONS.map(s => (
              <button key={s.label} className="gen-suggestion-chip" onMouseDown={() => applySuggestion(s.text)}>
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Contextual suggestions (while typing) */}
        {showContextual && (
          <div className="gen-contextual">
            <span className="gen-contextual-label">💡 Add to make it stronger:</span>
            <div className="gen-contextual-list">
              {contextual.map(c => (
                <button
                  key={c}
                  className="gen-contextual-chip"
                  onMouseDown={() => applySuggestion(prompt.trim() + ' — ' + c.toLowerCase())}
                >
                  + {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Enhance with AI */}
        {prompt.trim().length >= 8 && (
          <button
            className={`gen-enhance-btn ${isEnhancing ? 'loading' : ''} ${enhancedFlag ? 'done' : ''}`}
            onClick={handleEnhance}
            disabled={isEnhancing}
          >
            {isEnhancing ? (
              <><span className="gen-enhance-spinner" /> Enhancing…</>
            ) : enhancedFlag ? (
              <>✨ Enhanced</>
            ) : (
              <>✨ Enhance with AI</>
            )}
          </button>
        )}

        {/* Attachment chips */}
        {attachments.length > 0 && (
          <div className="gen-attachment-chips">
            {attachments.map(a => <span key={a} className="gen-chip">{a}</span>)}
          </div>
        )}

        {/* Action buttons */}
        <div className="gen-actions-row">
          <button className={`gen-action-btn ${activePanel === 'audio' ? 'active' : ''}`} onClick={() => togglePanel('audio')}>
            🎤 <span>Audio</span>
          </button>
          <button className={`gen-action-btn ${activePanel === 'link' ? 'active' : ''}`} onClick={() => togglePanel('link')}>
            🔗 <span>Link</span>
          </button>
          <button className={`gen-action-btn ${activePanel === 'trend' ? 'active' : ''}`} onClick={() => togglePanel('trend')}>
            🔥 <span>Trend</span>
          </button>
        </div>

        {/* Inline panels */}
        {activePanel === 'audio' && (
          <div className="gen-panel">
            {!isRecording && !recordingDone && (
              <>
                <p className="gen-panel-hint">Record a voice note to guide the tone</p>
                <button className="gen-record-btn" onClick={startRecording}>
                  <span className="gen-record-dot" /> Record
                </button>
              </>
            )}
            {isRecording && (
              <div className="gen-recording-active">
                <div className="gen-waveform">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="gen-wave-bar" style={{ animationDelay: `${i * 0.08}s` }} />
                  ))}
                </div>
                <span className="gen-recording-label">Recording…</span>
                <button className="gen-stop-btn" onClick={resetRecording}>Stop</button>
              </div>
            )}
            {recordingDone && (
              <div className="gen-recording-done">
                <span>🎤 Audio note added</span>
                <button className="gen-text-btn" onClick={resetRecording}>Remove</button>
              </div>
            )}
          </div>
        )}
        {activePanel === 'link' && (
          <div className="gen-panel">
            <p className="gen-panel-hint">Paste a reference or inspiration link</p>
            <input className="gen-link-input" placeholder="https://…" value={linkValue} onChange={e => setLinkValue(e.target.value)} />
          </div>
        )}
        {activePanel === 'trend' && (
          <div className="gen-panel">
            <p className="gen-panel-hint">Pick a trending format</p>
            <div className="gen-trend-grid">
              {TRENDS.map(t => (
                <button key={t} className={`gen-trend-chip ${selectedTrend === t ? 'active' : ''}`}
                  onClick={() => { setSelectedTrend(t); setActivePanel(null) }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Format */}
      <div className="gen-section">
        <div className="gen-label">Format</div>
        <div className="gen-format-row">
          {FORMATS.map(f => (
            <button key={f.id} className={`gen-format-pill ${format === f.id ? 'active' : ''}`} onClick={() => setFormat(f.id)}>
              <span className="gen-format-name">{f.label}</span>
              <span className="gen-format-hint">{f.hint}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Variations */}
      <div className="gen-section">
        <div className="gen-label">Variations</div>
        <div className="gen-var-row">
          <button className={`gen-var-btn ${variations === 1 ? 'active' : ''}`} onClick={() => setVariations(1)}>
            1 video
          </button>
          <button className={`gen-var-btn ${variations === 3 ? 'active' : ''}`} onClick={() => setVariations(3)}>
            2–3 videos <span className="gen-var-tag">A/B</span>
          </button>
        </div>
      </div>

      {/* Generate button */}
      <button className={`gen-btn ${!prompt.trim() ? 'disabled' : ''}`} onClick={handleGenerate} disabled={!prompt.trim()}>
        Generate video →
      </button>

    </div>
  )
}
