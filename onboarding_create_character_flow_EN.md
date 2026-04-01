# TWIN — Onboarding & Create Character: Flow and UX Decisions

> Document compiled after working session (March 31, 2026)
> Status: current, agreed

---

## Overall Flow Structure

All screens must be standard iPhone 16 dimensions.

Onboarding progress bar should be shown for the entire flow


```
Signup
  └─→ Onboarding (5 questions)
        └─→ Character format choice
              ├─→ Path A: Face scan / video → consent before submit
              └─→ Path B: Seed image selection
                    ↓ (both paths merge)
              Voice selection (single shared screen)
                    └─→ Avatar generation (progress + push opt-in)
                          └─→ Library
```

---

## 1. Onboarding

### Decision
Onboarding is embedded at the start of the character creation flow. 5 short questions, one per screen, tap-only — no text input. 5 steps feel fast when there are no text fields.

**Gender question — not a separate screen.** Determined by a toggle on the voice selection screen.

### 5 Questions

| # | Question | Options | Purpose |
|---|----------|---------|---------|
| 1 | What will you use it for? | Social media content / Education / Business communication / Personal blog / Other | Default content templates, recommendations |
| 2 | How often do you plan to post? | Every day / A few times a week / Occasionally | Subscription plan recommendation, batching hints |
| 3 | Experience with AI content? | Yes, actively / Tried before / No, I'm new | Beginners get tutorial and tips. Experienced users go straight to product |
| 4 | Platform | TikTok / YouTube / LinkedIn / Instagram / Other (multi-select) | Default video format and aspect ratio |
| 5 | Niche / content topic | Business & Finance / Education / Lifestyle / Technology / Other (multi-select) | Personalizes example scripts and starter templates in Library |

### How Answers Are Used Later
- **Q1 (purpose) + Q4 (platform)** → pre-fill the recommended voice preset
- **Q3 (experience)** → controls the number of UI hints and tooltips
- **Q5 (niche)** → personalizes the voice recording prompt + first recommendation in Library

---

## 2. Character Format Choice

**Screen:** "Create your character"

- Path A (That's me) — **pre-selected**, personal avatar, higher LTV
- Path B (Choose a look) — quick start without biometrics

**UX nuance:** can show a personalized path recommendation based on Q3 (experience). Gently recommend Path B to beginners, Path A to experienced users.

---

## 3. Path A — Face Scan / Video

### Consent Approach (key change)
**Consent screen removed as a separate step.** GDPR/BIPA checkboxes appear directly before the Submit button on the scan screen.

**Why:** the user has already invested effort (completed the scan), so the psychological barrier to accepting consent is significantly lower. Consent at the start = high drop-off before the user sees any value.

### Scan Screen
- Single action only: face scan / 15-second video (turn head left → right)
- Visual instruction: three icons showing head turn directions
- Just face scan and record button
- After recording screen shows that record is good using green checkmark on video
- Then automatically appears next step (ONLY AFTER FINISHING PTHIS ONE)

#### Consent Before Submit
- Two checkboxes below the Submit button:
  1. Consent to process biometric data to create an AI avatar (Privacy Policy)
  2. Understanding that the avatar is for personal use only
- Submit button disabled until both checkboxes are checked
- **Log:** timestamp, user ID, IP, privacy policy version (GDPR Art.9 + BIPA)
- Source video **deleted from servers** after avatar generation

---

## 4. Path B — Seed Image Selection

### Personalization and Uniqueness
Key UX decision: the user must feel that the images were generated **just for them**.

**Info panel (dark banner at the top of the screen):**
> ✦ Generated just for you.

**Tag on each card:** `FOR YOU` (frosted glass badge in the top-left corner)

**Infobox below the grid:**
> 🔒 We'll create a unique character based on this look. The seed is never reused.

### Card Reveal Animation
Cards appear **one by one** with a staggered delay:
1. Each card starts as a skeleton shimmer (grey pulsing placeholder)
2. After ~300–1000ms from the previous card: shimmer fades, card "flies in" with `scale(0.88) → scale(1)` + `translateY(10px) → 0`, easing `cubic-bezier(0.34, 1.56, 0.64, 1)` (light bounce)
3. After reveal: the `FOR YOU` tag and character info appear (with a slight additional delay)

**Delays:** card 1 — 300–1000ms, card 2 — 600–2000ms, …, card 6 — 1800–6000ms from screen open

### Grid
- 3 columns × 2 rows = 6 images
- After selection: button updates to `Create based on [Name] →`

### Compliance
- Seed images are fictional AI characters — **not real people**. Document the absence of intentional resemblance to real individuals.
- Output-side likeness check is mandatory: the generator may accidentally produce resemblance to a real person.
- Path B **does not require biometric consent** — the user does not upload their own biometric data.

---

## 5. Voice Selection (Shared Screen for Both Paths)

### Screen Structure

**Gender toggle** (at the top, above presets):
- Default: **Female**
- Options: Female / Male
- Switching instantly replaces the full set of 4 presets
- Label below toggle: "Showing female / male voices"

**Presets (2×2 grid):**

| Male | Female |
|------|--------|
| Neutral — clear, universal | Soft — warm, trustworthy |
| Energetic — lively, dynamic | Clear — articulate, professional |
| Calm — gentle, thoughtful | Vibrant — energetic, engaging |
| Expert — authoritative, business | Firm — confident, professional |

- First card in grid = `For You` (recommendation based on Q1 + Q4)
- Each card: ▶ play button, waveform visualisation, animation on playback
- Playback auto-stops after 3 seconds

**"Or record your own" section** (below a divider):
- Read-aloud prompt — **dynamically generated by niche (Q5)**:

| Niche | Recording prompt |
|-------|-----------------|
| Technology | "Today we'll look at how neural networks work — simply and clearly." |
| Business / Finance | "Let me share three things that changed how I think about money." |
| Education | "I'll explain this topic so it makes sense in under two minutes." |
| Lifestyle | "Sharing what actually works in my life — no filters." |
| Other | "Hi! I create content about what matters and interests me." |

- Large record button (64px circle), waveform animation during recording
- After recording: player with progress bar, "Record again" button
- **Continue button** activates on any selection (preset or own recording)
- Recording or selecting happens on one screen

---

## 6. Avatar Generation

- Step list with progress (spinner + progress bar)
- Steps: Processing video → Analysing facial geometry → Generating avatar → Final processing → **Deleting source files**
- "Deleting source files" is the last step intentionally: the user sees the promise fulfilled (GDPR communication)
- Push opt-in card during the wait — the most relevant context for opt-in
- Caption: "You can close the app — we'll notify you when it's ready"

---

## Total Flow Length

| Path | Steps |
|------|-------|
| Path A (scan) | Signup → 5 questions → Path choice → Scan → Voice → Generation = **9 steps** |
| Path B (seed) | Signup → 5 questions → Path choice → Seed → Voice → Generation = **9 steps** |

---

## Open Questions

- [ ] How many seed images at launch? (currently 6 in prototype)
- [ ] Technical stack for voice generation from recording
- [ ] Should we verify that the face scan video contains only one face (detect other faces)?
- [ ] Minimum length for own voice recording (currently up to 10 sec in prototype)
