import type { ImageMetadata } from "astro";

const services = [
  {
    title: "Full Project Development",
    features: [
      "We take on your mobile app project from scratch, end-to-end.",
      "From requirements and design to development and store submission on Google Play and the App Store.",
      "Ideal for businesses and startups that need a complete mobile solution.",
    ],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" stroke-width="1.5" fill="currentColor" class="w-6 h-6"><path d="M256 0c17.7 0 32 14.3 32 32V42.4c93.7 13.9 167.7 88 181.6 181.6H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H469.6c-13.9 93.7-88 167.7-181.6 181.6V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V469.6C130.3 455.7 56.3 381.7 42.4 288H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H42.4C56.3 130.3 130.3 56.3 224 42.4V32c0-17.7 14.3-32 32-32zM107.4 288c12.5 58.3 58.4 104.1 116.6 116.6V384c0-17.7 14.3-32 32-32s32 14.3 32 32v20.6c58.3-12.5 104.1-58.4 116.6-116.6H384c-17.7 0-32-14.3-32-32s14.3-32 32-32h20.6C392.1 165.7 346.3 119.9 288 107.4V128c0 17.7-14.3 32-32 32s-32-14.3-32-32V107.4C165.7 119.9 119.9 165.7 107.4 224H128c17.7 0 32 14.3 32 32s-14.3 32-32 32H107.4zM256 224a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>`,
  },
  {
    title: "Part-time Development Collaboration",
    features: [
      "We integrate with your existing team, providing dedicated Android or iOS development hours.",
      "Ideal for companies that need extra mobile development capacity without hiring full-time.",
    ],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" stroke-width="1.5" fill="currentColor" class="w-6 h-6"><path d="M0 80v48c0 17.7 14.3 32 32 32H48 96V80c0-26.5-21.5-48-48-48S0 53.5 0 80zM112 32c10 13.4 16 30 16 48V384c0 35.3 28.7 64 64 64s64-28.7 64-64v-5.3c0-32.4 26.3-58.7 58.7-58.7H480V128c0-53-43-96-96-96H112zM464 480c61.9 0 112-50.1 112-112c0-8.8-7.2-16-16-16H314.7c-14.7 0-26.7 11.9-26.7 26.7V384c0 53-43 96-96 96H368h96z"/></svg>`,
  },
];

const projects = [
  {
    name: "Honestli - Digital Verification App",
    description:
      "A digital verification application designed to combat misinformation.",
    highlights: [
      "Implemented tamper-proof Digital Originals with C2PA metadata and blockchain anchoring.",
      "Platform: Android",
      "Status: Live on Google Play",
    ],
    link: "https://play.google.com/store/apps/details?id=net.honestli.androidapp",
  },
  {
    name: "Cariboo - Car Management & Tracking App",
    description:
      "A feature-rich car management app for tracking fuel, expenses, and vehicle-related costs.",
    highlights: [
      "Built with an interactive statistics dashboard and AI-assisted workflows.",
      "Platform: Android",
      "Status: Coming Soon",
    ],
    link: "",
  },
];

const solutions: {
  title: string;
  painPoint: string;
  agitatepainPoint: string;
  solution: string;
  img: ImageMetadata;
}[] = [];
const faqs: { question: string; answer: string }[] = [];

export { services, projects, solutions, faqs };
