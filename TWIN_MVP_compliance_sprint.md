
TWIN — MVP compliance sprint
Scope: 2-3 week runway. Test content commercially, validate unit economics, find segment.
1-2 people + agents. Built on top of Luvea's existing compliance baseline.
This document is the single source of truth for what ships and what doesn't.

Context from Rustam × Ihor sync (March 30, 2026)
Key decisions locked:

Short-term pivot: content-as-product (packaged lectures, stories, trend-driven content) while compliance for user-generated features gets mapped.
MVP = HeyGen-level consent (checkbox self-certification), NOT Synthesia-level (2-min video proof). Synthesia approach is aspirational target if "create your twin" shows marketing traction.
No biometrics in MVP. Character creation via presets + prompt. Biometric user input (photo/video upload for avatar) is a separate milestone gated by demand signal.
No distribution control in MVP. Download button only. No social posting, no embed links. We are not the distributor.
Content signal collection: features we can't execute yet (URL input, hashtag input, file upload) should still have UI touchpoints that log user intent as demand signal, without processing the input.
Luvea audit needed: new features have been added without legal review. Must check current state before August 2026 EU AI Act deadline.
Two incremental compliance layers identified: (1) user input for character = biometrics, (2) user input for content = asset moderation. MVP skips both, presets-only.
Risk profile is higher than Higgsfield/toys: TWIN is marketing-focused, content gets real reach. More eyeballs = higher probability someone who didn't consent sees their likeness, or content hits regulatory tripwires.
Competitive consent landscape (from Ihor's analysis)
Product    Consent approach    Compliance strength
Synthesia    2-minute video recording, dedicated commercial-use sign-off flow, C2PA founding member, metadata provenance    Strong. Likely EU-compliant. Insurance-backed.
HeyGen    Checkbox self-certification    Medium. Works for now, uncertain under GDPR for third-party likeness.
Higgsfield    Terms of service only, no visible consent flow    Weak. Perpetual discount banners, poor compliance posture. Expect enforcement issues.
TWIN MVP    Checkbox self-certification + preset-only characters (no biometrics)    Medium-safe. No biometric data collected = no BIPA/GDPR Art. 9 exposure. Weaker than Synthesia, stronger than Higgsfield.
The regulatory moment
August 2026 — EU AI Act Article 50 becomes mandatory. Disclosure of AI-generated content required. Every competitor will need to adapt. Ihor confirmed this also applies to platforms generating the content, not just hosting it.

US is fragmented. Trump admin pulled federal AI regulation back. Some states (New York) proceeding anyway with mandatory AI disclosure. Other states paused. No federal framework imminent, but state-by-state requirements accumulating.

FTC × Writer precedent is unresolved. FTC sued Writer (AI writing tool) for enabling fake testimonials and reviews under FTC Act. New administration withdrew the case. No resolution. This directly affects TWIN — our product generates marketing content, which is the exact use case Writer got targeted for. Ihor's recommendation: monitor this case, build in FTC endorsement guardrails preemptively.

Positioning opportunity: TWIN can be built for the post-August legal world from day one. Competitors will have to retrofit compliance, creating UX friction for their existing users. We start clean. As Rustam framed it: "We care about your account health. We won't let you post content that gets you banned."

What exists from Luvea (baseline, needs audit)
Luvea currently has:

Character creation via UI selection (25+ criteria, builds a prompt from selections, generates unique character)
Text content generation with LLM moderation
Photo generation with censorship controls
Recently added: NPC-style preset moves with pre-generated video, additional generation types
US legal entity established
Revenue generating, rebills accumulating
Audit needed (action: Ihor/Nastya team):

Have all new feature increments been reviewed for compliance?
Is generated content properly labeled/marked?
Are there risks that exist now but will materialize in August 2026?
Specifically: video generation outputs — are they watermarked? Is metadata embedded? Are we controlling what gets generated via both LLM-level and output-level moderation?
MVP features — what ships
Foundation layer
1. Terms of service + acceptable use policy
Owner    Agent drafts, human reviews
Why    Ship-blocker. Cannot test with real traffic without this live.
What the ToS must cover:

IP ownership clause: user owns their input (scripts, prompts). Platform gets a license to process. AI-generated output ownership = user, with platform retaining a license for service improvement. Human must decide: do you want training rights on user content? For MVP recommendation: do NOT train on user content. It eliminates a consent burden.
Acceptable use policy banning: realistic depictions of real people without consent, content depicting minors, regulated claims (medical, financial, legal advice), election misinformation, fraud, harassment.
AI-specific clauses: user acknowledges output is AI-generated, user responsible for verifying accuracy, platform not liable for AI hallucinations or errors, using output to deceive people is prohibited.
FTC endorsement clause: generated content that constitutes advertising, endorsements, or reviews must comply with FTC Endorsement Guides. User acknowledges this. Platform may insert disclosure requirements on content that appears commercial. (This directly addresses the Writer/FTC precedent.)
Limitation of liability, indemnification, dispute resolution, governing law. Human picks jurisdiction.
Consent mechanism: must be clickwrap (checkbox + sign-up button), NOT browsewrap. Log timestamp, IP address, and version of ToS accepted per user.
2. Privacy policy
Owner    Agent drafts, human reviews
Why    Legal requirement in every jurisdiction. GDPR fines without it.
What the privacy policy must cover:

Data collected: account info (email, name), scripts/prompts, generated videos, usage logs, demand signal data (failed input attempts — URLs, hashtags, file upload attempts that we logged but did not process).
Purpose per data type: service delivery, improvement, safety, product development (for demand signal data).
Lawful basis per processing activity: contract for core service, legitimate interest for analytics and product development, consent for marketing.
Data retention schedule: scripts/prompts deleted after 30 days unless user saves. Generated videos kept until user deletes. Account data kept until account deletion + 30-day grace period. Safety/moderation logs kept 12 months. Demand signal logs anonymized after 90 days.
User rights: access, deletion, portability, objection. Provide email contact. Commit to 30-day response SLA.
Cross-border transfers: if using US-based AI APIs, disclose this. Reference Standard Contractual Clauses if serving EU users.
Cookies: list exactly what you set (auth session token, nothing else for MVP). No third-party ad cookies.
Training disclosure: state clearly whether generated content is used for model training. MVP recommendation: state that you do NOT use content for training.
Demand signal data disclosure: state that user input attempts (URLs, hashtags, prompts for unsupported features) are logged for product improvement. Provide opt-out.
3. Age gate
Owner    Agent builds
Why    COPPA (US) + EU digital age of consent. One minor user = regulatory exposure.
Date of birth input at signup. Block all users under 18.
Do NOT store the actual date of birth. Store only is_age_verified: true and verification timestamp.
If user enters age under 18: show friendly message, do not create account, do not store any data entered. No "try again" path.
4. Cookie consent banner
Owner    Agent builds
Why    ePrivacy Directive (EU). Trivial to implement, expensive to skip.
Simple banner: "We use essential cookies to make the app work. No tracking cookies." with an Accept button.
For MVP: skip client-side analytics SDKs entirely. Use server-side event logging.
Content safety + output controls
5. Content moderation pipeline
Owner    Agent builds pipeline, human defines edge-case rules
Why    Single system for script checks, AI output screening, hate speech, CSAM, defamation, real-person detection, IP/trademark detection.
Input filter (runs on every script/prompt before processing):

Run through moderation API before any generation starts.
Block categories: CSAM (zero tolerance, instant block), explicit violence/gore, hate speech/incitement, real person impersonation, regulated professional advice (medical, financial, legal).
Real person + IP detection:

Blocklist of top ~1,000 public figures. Flag for review if script contains a match.
IP/trademark detection: blocklist of major brand names, fictional characters, franchises. This is critical because TWIN's trend engine will surface pop-culture trends (Spider-Man, etc.) that users will want to reference. The Sora problem — constant IP infringement in output — is what killed that product. Prevent this at input.
Output likeness check: explore models like Recoup that scan output for resemblance to known public figures. Even with preset characters, generation models can produce accidental likenesses. (Flagged by Ihor as important control.)
Output filter (runs on generated video):

For MVP: rely on generation model's built-in safety filters + human spot-check sampling (~5% of output).
Full automated output scanning is a v2 investment.
Prohibited content taxonomy:

Category    Action
CSAM    Zero tolerance. Instant block. Log for NCMEC reporting.
Terrorist content    Block + log.
Hate speech / incitement to violence    Block.
Realistic depictions of real people    Block unless user proves consent.
Copyrighted characters / IP    Block. Do not generate Spider-Man, Mickey Mouse, etc.
Adult sexual content    Block for MVP.
Health / medical claims    Flag + auto-insert disclaimer.
Financial advice / investment claims    Flag + auto-insert disclaimer.
Fake testimonials / reviews    Block. (Writer/FTC precedent.)
Political content (elections, candidates)    Flag + require user confirmation of disclosure compliance.
FTC endorsement safeguard (addresses Writer precedent directly):

If the AI-generated script or content appears to be a product endorsement, testimonial, or review: auto-flag and require user to confirm it complies with FTC Endorsement Guides.
If content is for paid ads: prompt user to add required disclosures per platform (Facebook Ads, Google Ads, etc.).
This is what differentiates TWIN from Writer. Writer enabled generation of fake reviews without guardrails. We gate commercial content with disclosure requirements.
User reporting:

"Report this video" button → email to abuse@ address. Satisfies EU DSA notice-and-action at MVP scale.
Response policy (flagged by Ihor as critical for our risk profile):

Account ban for repeat offenders.
Warning system for first-time violations.
DMCA takedown flow for IP infringement reports.
Document the response policy — we need it regardless of consent approach because our content gets real marketing reach.
Logging:

Log every moderation decision with timestamps, user IDs, content hashes.
6. AI disclosure + watermark on all output
Owner    Agent builds
Why    EU AI Act Article 50 (mandatory August 2026), 10+ US state deepfake laws, platform synthetic content policies. Build for the post-August world now.
Visible watermark:

Persistent "AI Generated" text overlay in corner of every output video. Semi-transparent, crop-resistant.
Metadata watermark:

Embed ai_generated: true in video file metadata (MP4 XMP/EXIF). Survives most re-uploads, platform scanners look for it.
C2PA content credentials:

Synthesia is a CAI founding member and pushes this hard. Implementing C2PA is a competitive positioning move, not just compliance.
If time allows for MVP, implement it. If not, metadata watermark is the minimum. C2PA should be high-priority for v2.
User-facing disclosure:

On download page: "This video was generated by AI. You are responsible for disclosing this when sharing."
User must acknowledge before download.
Positioning angle (from Rustam/Ihor discussion):

"We care about the health of your social media account. We won't let you publish content that gets you banned or fined."
Make compliance a product feature, not a restriction. Show users what happens to accounts that don't disclose AI content (screenshots, examples).
7. Download flow with terms acknowledgment
Owner    Agent builds, human reviews checkbox language
Why    Gates the moment content leaves the platform. We are NOT the distributor — this is the boundary.
Before download, user must check two boxes:

"I will not use this video to impersonate a real person, commit fraud, or deceive viewers into thinking this is real footage."
"I understand this video is AI-generated and I will disclose this when required by law or platform policy."
For content that appears commercial (detected by moderation pipeline):

Additional checkbox: "If this content is used for advertising, endorsements, or reviews, I will comply with FTC Endorsement Guides and platform advertising policies."
Logging:

Record every download: user ID, video ID, timestamp, IP address, checkboxes confirmed.
Format:

MP4 H.264. Metadata watermark embedded. Filename includes ai-generated slug.
License:

MVP: personal use license only. Commercial use = paid tier later.
Product features with compliance awareness
8. Character preset library
Owner    Human designs, agent assists
Why    Presets avoid biometrics entirely. This is the scope decision that buys us speed.
Design rules:

6-10 pre-designed characters. Diverse: age, ethnicity, gender, body type.
Each preset: unique name, unique appearance, unique voice pairing.
Do NOT name after real people. Do NOT design to resemble specific celebrities.
Output-side likeness check: even with presets, generation models can produce accidental resemblances. Run output through likeness detection (Recoup or similar) as a safety net.
Compliance review (human):

Celebrity resemblance check per character.
Diversity audit: avoid stereotypical pairings.
Document: "All character presets are entirely fictional with no intentional resemblance to real persons."
Future path (gated by demand signal):

If marketing shows traction for "create your twin / create yourself": invest in Synthesia-level consent flow (2-min video, explicit consent, biometric data handling).
Intermediate option (from Ihor brainstorm): something better than checkbox but lighter than video. E.g., email verification flow where user sends consent link to the person whose likeness they want to use.
For now: preset-only + "generate similar" from a seed character. Users can iterate on variations without uploading biometrics.
9. Tone of voice + preset voice selection
Owner    Human selects vendor, agent integrates
Why    Preset voices = licensed from vendor. No cloning = no voice biometric issues.
License from TTS provider. GET IN WRITING that their voices are properly licensed/consented.
Tone parameters (speed, pitch, emphasis, emotional tone) are style controls, not biometric data.
Document: "No voice biometrics are captured, processed, or stored."
Users CANNOT upload audio samples for voice cloning in MVP.
10. Script input + AI-generated variance + trend recommendations
Owner    Agent builds (compliance covered by moderation pipeline)
Why    Core feature. Script input runs through Day 2 pipeline. Trend engine adds recommendation layer.
Script input:

Freeform text, runs through moderation pipeline. No new compliance work.
AI-generated variants:

Label as "AI suggestion" in UI. User must approve before generation.
ToS covers: AI-generated script suggestions may not be copyrightable. User assumes risk.
UI note: "Review AI suggestions for accuracy. AI may generate inaccurate claims."
Trend recommendation layer:

Intel engine surfaces trending topics in user's niche.
IP/trademark risk: viral trends are often pop-culture-based. Trend recommendations must filter out trends that would require generating copyrighted characters or real-person likenesses.
When trend involves a public figure or IP: recommend the trend concept/format, NOT the specific person/character. E.g., recommend "reaction format" not "do the Spider-Man meme."
11. Demand signal collection (non-executing input capture)
Owner    Agent builds
Why    Features we can't execute yet should still capture user intent as product development signal.
What to collect:

URL input attempts: log the URL, do not scrape or process it. Show "Coming soon — we've noted your interest."
Hashtag input attempts: log the hashtag. Same response.
File upload attempts: log file type and size (NOT the file itself — do not accept the upload). Same response.
Prompt requests that exceed current capability: log the prompt text.
Privacy compliance for signal data:

Disclose in privacy policy: "We log feature interaction attempts for product development."
Anonymize after 90 days.
Provide opt-out if user requests.
Do NOT store uploaded files. Only metadata (type, size, timestamp).
Testing and iteration
12. Internal adversarial testing
Owner    Human
Why    Before external traffic, break your own content moderation.
Test:

Celebrity deepfakes: names + physical descriptions in scripts.
Copyrighted IP: Spider-Man, Mickey Mouse, brand slogans (the Sora problem).
Hate speech: creative rewording, coded language.
CSAM-adjacent content.
Fake testimonials/reviews (the Writer/FTC problem).
Medical/financial claims.
Political campaign content.
Document every bypass. Fix critical ones before external testing. Test full flow end-to-end.

13. Content testing on real platforms
Owner    Human (Rustam + team)
Why    Must validate that generated content survives platform review. This is the real compliance test.
What Rustam described:

Create AI influencer pages (own accounts).
Post generated content across TikTok, Instagram.
Test: does content get flagged? Does the account get restricted for non-disclosure?
If accounts get hit: that's the signal to make AI disclosure watermarks louder, more prominent, non-removable.
Test different content types: faceless accounts vs. avatar-based vs. preset characters.
What to document from these tests:

Which platforms flag AI content and how.
Which disclosure methods satisfy each platform.
What content types perform commercially despite AI disclosure.
Where the line is between "disclosed AI content that performs" and "undisclosed content that gets banned."
14. Marketing material compliance
Owner    Agent drafts guidelines, human reviews
Why    Your marketing must follow the same rules you enforce on users. Especially important given Writer/FTC precedent.
All demo videos watermarked as AI-generated.
Do not claim "unlimited" anything unless true.
Do not claim output is "indistinguishable from real video."
Do not use customer testimonials without written consent.
Do not make income claims ("make $10k/month with AI content") without substantiation. This is the exact territory that triggers FTC enforcement.
Funnels that promise "create your AI twin" or "create yourself" must not collect biometric data until that compliance layer is built. Sell the vision, deliver the preset version, upsell biometrics when ready.
Non-MVP features — do not build yet
Tier 1: Biometric user input (triggers BIPA/CUBI/GDPR Art. 9)
Target: ~1 month out, gated by marketing traction for "create yourself" messaging.

Feature    Legal blocker    Ihor's notes
Photo/selfie upload for avatar creation    BIPA consent, GDPR Art. 9, minor detection, right of publicity    Checkbox (HeyGen approach) probably insufficient under GDPR — you can't give consent on behalf of someone else without legal guardianship or power of attorney. Synthesia's 2-min video approach is strongest.
Video recording for avatar creation (Synthesia model)    Same biometric triggers, but consent is embedded in the action itself    Best approach: video recording serves as both biometric input AND consent proof. Also gives highest quality data for avatar generation.
Voice cloning from audio upload    Voice prints = biometric identifiers. BIPA, Tennessee ELVIS Act, performer consent.    Same consent infrastructure as photo upload. Build once, unlock both.
GDPR-specific problem Ihor flagged: under GDPR, you cannot give consent on behalf of another person. If User A uploads User B's photo and checks a box saying "I have consent," that checkbox is not User B's consent. This means the "upload anyone" flow requires either: (a) a verification mechanism where the person depicted confirms consent (email flow, similar to Synthesia's approach), or (b) restricting to self-only uploads where the video recording itself is the proof. For MVP, this is avoided entirely by using presets.

Tier 2: User asset input for content (triggers content moderation expansion)
Feature    Legal blocker
Upload product images / objects for video    Need to moderate uploaded assets: no weapons, drugs, counterfeit goods, copyrighted products without authorization. New moderation layer for images, not just text.
Upload brand kit (logos, fonts, colors)    Trademark misuse liability, font licensing compliance, asset ownership verification.
URL input for content reference    Copyright infringement from scraping, robots.txt compliance, PII in scraped content.
Tier 3: Distribution control (triggers per-platform legal work)
Feature    Legal blocker
Post to social media on behalf of user    Per-platform OAuth, API ToS, synthetic content labeling rules (different per platform), FTC disclosure automation.
Schedule video posting    Pre-publication re-verification, platform rate limits.
Analytics and tracking    GDPR consent management, ePrivacy, CCPA.
Tier 4: Marketplace / commercial (triggers financial/tax compliance)
Feature    Legal blocker
Marketplace for characters / templates    IP verification per listing, DMCA, seller tax (1099/W-8BEN), VAT.
Product catalog batch generation    FTC advertising compliance per product category. Every auto-generated product video is an advertisement.
Background music    Sync licensing, master licensing, ASCAP/BMI/SESAC. Slow.
Luvea audit checklist (immediate action for Ihor/Nastya)
Luvea has expanded functionality since last legal review. Before August 2026 and before any TWIN features are layered on top, verify:

 Is all generated content (photos, video, text) properly labeled as AI-generated?
 Is metadata watermarking in place on any downloadable/shareable content?
 Are the current moderation controls sufficient? (LLM-level for text, censorship for photos — but what about video? What about the new NPC-style generation?)
 Do current ToS cover all generation types that now exist?
 Are there any features that were added without terms/privacy policy updates?
 Is the privacy policy accurate for current data collection scope?
 Are cross-border transfer mechanisms in place for EU users?
 Is there any biometric data being processed that isn't covered by consent?
 Background images / scene generation: can users put copyrighted characters (Donald Trump, Mickey Mouse) in the background? Is this controlled?
Compliance infrastructure that scales
The MVP creates four reusable pieces that non-MVP features plug into:

ToS + AUP — every new feature just needs a clause added.
Content moderation pipeline — new content types (audio, images, URLs, product photos) run through the same classifier and review flow.
AI disclosure/watermark system — new output formats inherit the same provenance chain.
Download terms gate — new distribution methods use the same consent pattern.
Plus one new piece specific to TWIN's strategy:

Demand signal logging — every blocked or unsupported user action is captured as product intelligence. When signal for a deferred feature reaches threshold, that's the trigger to build the compliance layer for it.
Work split: agent vs human
Agent handles: drafting legal documents, building age gate and cookie banner, implementing moderation API integration, watermark embedding, download flow, content taxonomy, script input pipeline, demand signal capture, beta agreement drafts, marketing guidelines, Luvea audit document preparation.

Human handles: reviewing IP ownership clauses, picking jurisdiction, character design review for celebrity resemblance, diversity audit, vendor license verification, adversarial testing, platform content testing, marketing funnel compliance review, final legal review, decisions on biometric feature timing.

What "enough to start testing" means legally
You can run real traffic and test content commercially when you have:

 ToS live with clickwrap consent logging
 Privacy policy published and linked from signup (covers demand signal data collection)
 Age gate blocking under-18 at signup
 Cookie banner (essential cookies only)
 Content moderation running on all script/prompt input
 IP/trademark detection blocking copyrighted character generation
 FTC endorsement safeguard flagging commercial content
 AI-generated watermark on every output video (visible + metadata)
 Download gated behind acknowledgment checkboxes
 Download logging (user, video, timestamp, consent)
 Report button sending to abuse@ email
 Response policy documented (bans, warnings, DMCA flow)
 Character presets reviewed for celebrity resemblance
 Voice vendor license confirmation in writing
 Adversarial testing completed, critical bypasses fixed
 Luvea audit completed (existing product baseline verified)
Get a proper legal review before public launch. This checklist is sufficient for closed testing and initial marketing experiments.
