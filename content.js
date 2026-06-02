// ============================================================
//  SITE CONTENT — edit all your copy here
// ============================================================

const CONTENT = {

  // ── Meta ────────────────────────────────────────────────
  meta: {
    title: "AGcoding — Native Mobile App Studio",
    email: "agcodinglp@gmail.com",
  },

  // ── Nav ─────────────────────────────────────────────────
  nav: {
    cta: "Get in touch →",
  },

  // ── Hero ────────────────────────────────────────────────
  hero: {
    pill: "Native mobile app studio",
    heading: ["Native apps built", "with <span class='grad'>precision</span>", "and craft."],
    sub: "AGcoding is a lean, senior team delivering native Android and iOS apps — from first concept through to store launch. No cross-platform shortcuts. Just software built to last.",
    cta_primary: "Start a project →",
    cta_ghost: "See our work",
    tech_label: "Built with:",
    tech: ["Kotlin", "Swift", "Jetpack Compose", "SwiftUI"],
  },

  // ── Metrics ─────────────────────────────────────────────
  metrics: [
    { number: "2+",  label: "Apps live on store" },
    { number: "100%", label: "Native development" },
    { number: "E2E",  label: "Full project delivery" },
    { number: "2×",   label: "Platforms supported" },
  ],

  // ── Services ────────────────────────────────────────────
  services: {
    eyebrow: "Services",
    heading: "Two ways to work with us",
    sub: "However you engage, the work is the same: reliable, well-architected native apps, shipped by people who have done it before — and who stay close to the detail.",
    cards: [
      {
        tag: "01 / Service",
        title: "Full project development",
        desc: "You bring the idea — we build the app. We turn a validated concept into a finished native product: scoping, architecture, development, and launch on both stores. Built for founders who want one team owning the outcome.",
        features: [
          "Scoping & product thinking",
          "Native Android & iOS development",
          "Google Play & App Store submission",
          "Post-launch support & iteration",
        ],
      },
      {
        tag: "02 / Service",
        title: "Embedded collaboration",
        desc: "Already have a team? We plug in as dedicated Android or iOS engineers — to hit a deadline, ship a hard feature, or cover a skills gap. Senior capacity on demand, without the cost and lead time of a full-time hire.",
        features: [
          "Dedicated Android or iOS hours",
          "Seamless integration with your team",
          "Flexible, scalable engagement",
          "Code you'd be happy to inherit",
        ],
      },
    ],
  },

  // ── Process ─────────────────────────────────────────────
  process: {
    eyebrow: "Process",
    heading: "How a project actually goes",
    steps: [
      { n: "01", title: "Discover",            desc: "We pressure-test the idea, scope the build, and agree on what "done" looks like before a line of code is written." },
      { n: "02", title: "Design & architect",  desc: "Screens, flows, and a technical foundation built to scale — so the app stays fast as it grows." },
      { n: "03", title: "Build",               desc: "Native Kotlin and Swift, shipped in tight, reviewable increments you can see and steer." },
      { n: "04", title: "Launch & support",    desc: "Store submission, release, and the unglamorous work of keeping it stable and improving." },
    ],
  },

  // ── Work / Projects ─────────────────────────────────────
  work: {
    eyebrow: "Selected work",
    heading: "Apps we've <span class='grad'>shipped</span>",
    projects: [
      {
        idx: "01",
        status: "live",
        status_label: "Live on Google Play",
        title: "Honestli",
        desc: "A digital verification app built to fight misinformation. We engineered tamper-proof Digital Originals with C2PA metadata and blockchain anchoring — proof that an image is real, baked in at the moment of capture.",
        chips: ["Android", "Verification", "Blockchain", "C2PA"],
        platform: "Android",
        status_text: "Live",
        link: { label: "Play Store →", url: "https://play.google.com/store/apps/details?id=net.honestli.androidapp" },
      },
      {
        idx: "02",
        status: "soon",
        status_label: "Coming soon",
        title: "Cariboo",
        desc: "A car-management app for tracking fuel, expenses, and the true running cost of a vehicle — wrapped in an interactive statistics dashboard with AI-assisted logging that makes record-keeping almost effortless.",
        chips: ["Android", "Productivity", "AI-assisted", "Dashboard"],
        platform: "Android",
        status_text: "In dev",
        link: null,
      },
    ],
  },

  // ── Tech ────────────────────────────────────────────────
  tech: {
    eyebrow: "Our toolkit",
    heading: "Built with modern <span class='grad'>native tooling</span>",
    pills: ["Kotlin", "Jetpack Compose", "Swift", "SwiftUI", "Coroutines", "C2PA", "Blockchain anchoring", "REST & GraphQL", "CI / CD", "Firebase"],
  },

  // ── Contact ─────────────────────────────────────────────
  contact: {
    eyebrow: "Contact",
    heading: "Have something in mind?<br><span class='grad'>Let's build it.</span>",
    sub: "Tell us what you want to make. We can take the whole thing off your plate, or slot into the team you already have. Either way, you'll talk to the people doing the work.",
    card_head: "What you can expect",
    card_rows: [
      { label: "Approach",   value: "Native only",          accent: true },
      { label: "Delivery",   value: "Concept → store",      accent: false },
      { label: "Engagement", value: "Project or embedded",  accent: false },
      { label: "Platforms",  value: "Android & iOS",        accent: false },
    ],
  },

  // ── Footer ──────────────────────────────────────────────
  footer: {
    tagline: "A small, senior native mobile team. Android & iOS, from concept to store submission.",
    copy: "© 2026 AGcoding. All rights reserved.",
    sub: "Native Android & iOS · Greece",
  },

};
