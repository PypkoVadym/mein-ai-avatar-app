export default function OnboardingQuestion({
  questionNum,
  totalQuestions,
  question,
  options,
  multiSelect,
  selected,
  onSelect,
  onContinue,
  onBack,
}) {
  const hasSelection = multiSelect
    ? Array.isArray(selected) && selected.length > 0
    : selected !== null && selected !== undefined

  const isSelected = (opt) => {
    if (multiSelect) return Array.isArray(selected) && selected.includes(opt)
    return selected === opt
  }

  return (
    <div className="screen question-screen">
      {/* Nav */}
      <div className="nav-bar">
        <button className="back-btn" onClick={onBack}>←</button>
      </div>

      {/* Scrollable content */}
      <div className="question-scrollable">
        <div className="q-step-chip">
          {questionNum} of {totalQuestions}
        </div>

        <div className="q-text">{question}</div>

        <div className="options-list">
          {options.map(opt => (
            <button
              key={opt}
              className={`option-chip ${isSelected(opt) ? 'selected' : ''}`}
              onClick={() => onSelect(opt)}
            >
              {opt}
            </button>
          ))}
        </div>

        {multiSelect && (
          <p style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            marginTop: 12,
            lineHeight: 1.5
          }}>
            Select all that apply
          </p>
        )}
      </div>

      {/* Continue button */}
      <div className="question-bottom">
        <button
          className="btn-primary"
          disabled={!hasSelection}
          onClick={onContinue}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
