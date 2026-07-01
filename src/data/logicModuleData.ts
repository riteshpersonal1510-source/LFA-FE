export const LEAD_SCORE_WEIGHTS = {
  seo: { label: "SEO Score", weight: 0.15, max: 100, maxPoints: 100 },
  uiux: { label: "UI/UX Score", weight: 0.15, max: 100, maxPoints: 100 },
  responsive: { label: "Responsive Score", weight: 0.15, max: 100, maxPoints: 100 },
  trust: { label: "Trust Score", weight: 0.15, max: 100, maxPoints: 100 },
  social: { label: "Social Presence", weight: 0.10, max: 100, maxPoints: 100 },
  quality: { label: "Website Quality", weight: 0.10, max: 100, maxPoints: 100 },
  freshness: { label: "Content Freshness", weight: 0.05, max: 100, maxPoints: 100 },
  contact: { label: "Contact Availability", weight: 0.05, max: 100, maxPoints: 100 },
  activity: { label: "Business Activity", weight: 0.10, max: 100, maxPoints: 100 },
} as const;

export const LEAD_QUALIFICATION = {
  high: { label: "High Potential", minScore: 85, color: "#15803D", description: "Strong lead with high conversion probability" },
  medium: { label: "Medium Potential", minScore: 60, color: "#D97706", description: "Good lead requiring further nurturing" },
  low: { label: "Low Potential", minScore: 0, color: "#DC2626", description: "Low priority lead needing re-evaluation" },
} as const;

export const SEO_SCORE_COMPONENTS = [
  { name: "Title Tag", maxPoints: 20, color: "#3B82F6", criteria: "30-60 chars with primary keyword" },
  { name: "Meta Description", maxPoints: 20, color: "#8B5CF6", criteria: "120-160 chars with description" },
  { name: "H1 Heading", maxPoints: 15, color: "#10B981", criteria: "Single H1 with target keyword" },
  { name: "Image Alt Tags", maxPoints: 15, color: "#F59E0B", criteria: "All images have alt text" },
  { name: "Internal Links", maxPoints: 10, color: "#EC4899", criteria: "5+ internal links" },
  { name: "Mobile Friendliness", maxPoints: 10, color: "#06B6D4", criteria: "Viewport + responsive" },
  { name: "SSL Certificate", maxPoints: 10, color: "#F97316", criteria: "HTTPS + valid cert" },
] as const;

export const SEO_GRADE_SCALE = [
  { grade: "Excellent", range: "90-100", color: "#15803D", assessment: "Top-tier SEO optimization" },
  { grade: "Good", range: "70-89", color: "#16A34A", assessment: "Solid SEO fundamentals" },
  { grade: "Average", range: "50-69", color: "#D97706", assessment: "Needs improvement" },
  { grade: "Poor", range: "30-49", color: "#DC2626", assessment: "Major gaps detected" },
  { grade: "Critical", range: "0-29", color: "#991B1B", assessment: "Requires immediate action" },
] as const;

export const RESPONSIVE_DEDUCTIONS = [
  { name: "No Viewport Meta", deduction: 15, category: "Responsive" },
  { name: "No Media Queries", deduction: 20, category: "Responsive" },
  { name: "Fixed Width Layout", deduction: 15, category: "Responsive" },
  { name: "Small Font Sizes", deduction: 10, category: "UX" },
  { name: "Touch Target Issues", deduction: 10, category: "UX" },
  { name: "Horizontal Overflow", deduction: 10, category: "Responsive" },
  { name: "No Scaling", deduction: 10, category: "Responsive" },
  { name: "Slow Mobile Load", deduction: 10, category: "UX" },
] as const;

export const RESPONSIVE_SCORE_LEVELS = [
  { label: "Excellent", minScore: 90, color: "#15803D" },
  { label: "Good", minScore: 70, color: "#16A34A" },
  { label: "Average", minScore: 50, color: "#D97706" },
  { label: "Poor", minScore: 30, color: "#DC2626" },
  { label: "Critical", minScore: 0, color: "#991B1B" },
] as const;

export const TRUST_SCORE_FACTORS = [
  { name: "SSL Certificate", points: 25, type: "bonus" },
  { name: "Contact Page", points: 20, type: "bonus" },
  { name: "About Us Page", points: 15, type: "bonus" },
  { name: "Privacy Policy", points: 10, type: "bonus" },
  { name: "Terms of Service", points: 10, type: "bonus" },
  { name: "Social Media Links", points: 10, type: "bonus" },
  { name: "Customer Reviews", points: 10, type: "bonus" },
] as const;

export const TRUST_LEVELS = [
  { label: "High Trust", minScore: 80, color: "#15803D" },
  { label: "Medium Trust", minScore: 50, color: "#D97706" },
  { label: "Low Trust", minScore: 0, color: "#DC2626" },
] as const;

export const OPPORTUNITY_DETECTION_FACTORS = [
  { condition: "Poor SEO Score", points: 15 },
  { condition: "Outdated UI/UX", points: 20 },
  { condition: "Not Mobile Friendly", points: 15 },
  { condition: "Weak Social Presence", points: 10 },
  { condition: "No SSL Certificate", points: 10 },
  { condition: "No Contact Form", points: 10 },
  { condition: "Old Copyright Year", points: 10 },
  { condition: "Low Trust Score", points: 15 },
  { condition: "Low Website Quality", points: 15 },
  { condition: "Very Outdated Design", points: 20 },
  { condition: "Needs Content Refresh", points: 10 },
] as const;

export const OPPORTUNITY_LEVELS = [
  { label: "High Opportunity", minScore: 60, color: "#16A34A" },
  { label: "Medium Opportunity", minScore: 30, color: "#D97706" },
  { label: "Low Opportunity", minScore: 0, color: "#6B7280" },
] as const;

export const WEBSITE_QUALITY_WEIGHTS = [
  { name: "SEO Quality", weight: 0.2, color: "#3B82F6" },
  { name: "Responsiveness", weight: 0.2, color: "#10B981" },
  { name: "UI/UX Design", weight: 0.2, color: "#8B5CF6" },
  { name: "Trust Signals", weight: 0.15, color: "#F59E0B" },
  { name: "Performance", weight: 0.15, color: "#EC4899" },
  { name: "Social Proof", weight: 0.1, color: "#06B6D4" },
] as const;

export const WEBSITE_STATUS = [
  { label: "Active", minScore: 80, color: "#15803D", checks: "Live, accessible, SSL valid" },
  { label: "Inactive", minScore: 0, color: "#DC2626", checks: "Not accessible" },
  { label: "Invalid", minScore: 0, color: "#6B7280", checks: "URL is invalid" },
  { label: "Unknown", minScore: 0, color: "#D97706", checks: "Could not determine" },
] as const;

export const REDESIGN_POTENTIAL_FACTORS = [
  { condition: "Outdated Design", points: 20 },
  { condition: "Poor Responsiveness", points: 15 },
  { condition: "Slow Load Speed", points: 15 },
  { condition: "Weak Branding", points: 10 },
  { condition: "No Clear CTA", points: 10 },
  { condition: "Poor Navigation", points: 10 },
  { condition: "Missing Key Content", points: 10 },
  { condition: "No Social Integration", points: 10 },
] as const;

export const REDESIGN_LEVELS = [
  { label: "High Potential", minScore: 60, color: "#16A34A" },
  { label: "Medium Potential", minScore: 30, color: "#D97706" },
  { label: "Low Potential", minScore: 0, color: "#6B7280" },
] as const;

export const AI_SALES_COMPONENTS = [
  { name: "Redesign Opportunity", color: "#8B5CF6" },
  { name: "SEO Opportunity", color: "#3B82F6" },
  { name: "Conversion Probability", color: "#10B981" },
  { name: "Revenue Potential", color: "#F59E0B" },
  { name: "Sales Priority", color: "#EC4899" },
  { name: "AI Recommendations", color: "#06B6D4" },
] as const;

export const SCRAPING_SOURCES = [
  { name: "Google Maps", color: "#8B5CF6" },
  { name: "Justdial", color: "#3B82F6" },
  { name: "IndiaMART", color: "#10B981" },
  { name: "Clutch", color: "#F59E0B" },
  { name: "LinkedIn", color: "#06B6D4" },
] as const;

export const CRM_STAGES = [
  { name: "New Lead", color: "#3B82F6" },
  { name: "Contacted", color: "#8B5CF6" },
  { name: "Interested", color: "#16A34A" },
  { name: "Follow-Up", color: "#D97706" },
  { name: "Proposal Sent", color: "#F59E0B" },
  { name: "Converted", color: "#06B6D4" },
  { name: "Closed", color: "#6B7280" },
] as const;

export const OUTREACH_FLOW = [
  { stage: "Initial Contact", description: "First touch via Email" },
  { stage: "First Follow-up", description: "Second email follow-up" },
  { stage: "Second Follow-up", description: "Email or Phone call" },
  { stage: "Third Follow-up", description: "Direct phone outreach" },
  { stage: "Final Attempt", description: "Last outreach attempt" },
] as const;

export const FOLLOWUP_SEQUENCE = [
  { stage: 1, name: "Initial Email", delay: "0 days", type: "automated" },
  { stage: 2, name: "Follow-up Email", delay: "3 days", type: "automated" },
  { stage: 3, name: "Phone Call", delay: "7 days", type: "manual" },
  { stage: 4, name: "LinkedIn Message", delay: "10 days", type: "manual" },
  { stage: 5, name: "Final Email", delay: "14 days", type: "automated" },
  { stage: 6, name: "Final Phone Call", delay: "21 days", type: "manual" },
] as const;

export const AUTOMATION_FLOW = [
  { name: "Scrape Leads", description: "Extract leads from sources" },
  { name: "Validate Data", description: "Remove duplicates & verify" },
  { name: "Enrich Contacts", description: "Find emails & social profiles" },
  { name: "Score & Qualify", description: "AI-powered lead scoring" },
  { name: "Route to CRM", description: "Push qualified leads" },
  { name: "Engage & Nurture", description: "Automated outreach" },
] as const;

export const ARCHITECTURE_LAYERS = [
  { layer: "Presentation Layer", tech: "Next.js 15 + React 19 + Tailwind CSS + ShadCN UI", items: ["Client Components", "Server Components", "Layout System", "API Proxy"], color: "#3B82F6" },
  { layer: "API Gateway", tech: "Express.js + TypeScript + REST + Socket.IO", items: ["REST Endpoints", "WebSocket", "Middleware", "Auth Guard"], color: "#8B5CF6" },
  { layer: "Service Layer", tech: "Microservices + Scrapers + AI Pipeline", items: ["Scraping Engine", "AI Analysis", "Lead Scoring", "Outreach Engine"], color: "#16A34A" },
  { layer: "Data Layer", tech: "MongoDB + Mongoose + MongoDB Atlas", items: ["Lead Schema", "Session Store", "Cache Layer", "Analytics"], color: "#D97706" },
  { layer: "Infrastructure", tech: "Docker + Netlify + Render + ngrok", items: ["CI/CD Pipeline", "Monitoring", "Logging", "Backup"], color: "#6B7280" },
] as const;

export const PROJECT_FLOW_STAGES = [
  { name: "Target Definition", description: "Define industries, locations, and business types to target", color: "#6366F1", order: 1 },
  { name: "Lead Discovery", description: "Scrape Google Maps, Justdial, IndiaMART for potential leads", color: "#1D4ED8", order: 2 },
  { name: "Data Enrichment", description: "Extract contacts, emails, phones, and social profiles", color: "#3B82F6", order: 3 },
  { name: "AI Analysis", description: "Score leads, detect opportunities, qualify prospects", color: "#10B981", order: 4 },
  { name: "CRM Pipeline", description: "Route qualified leads through sales pipeline stages", color: "#06B6D4", order: 5 },
  { name: "AI Outreach", description: "Generate personalized outreach sequences", color: "#F59E0B", order: 6 },
  { name: "Report & Analytics", description: "Track performance, conversion, and ROI", color: "#F97316", order: 7 },
] as const;

export const PROJECT_FLOW_DETAILS = {
  scraping: {
    title: "Scraping Engine",
    sources: ["Google Maps", "Justdial", "IndiaMART", "Clutch"],
    fields: ["Company Name", "Website", "Phone", "Email", "Address", "Rating", "Reviews", "Category", "Business Status", "Working Hours", "Coordinates", "Pincode", "Owner", "Source URL"],
    tech: "Playwright + Puppeteer + Cheerio",
  },
  analysis: {
    title: "AI Analysis Engine",
    dimensions: [
      { name: "Lead Scoring", description: "AI-powered predictive scoring", weight: "25%" },
      { name: "Opportunity Detection", description: "Identify high-potential leads", weight: "20%" },
      { name: "Qualification Grading", description: "Auto-qualify leads", weight: "15%" },
      { name: "Trust Assessment", description: "Evaluate website trust signals", weight: "15%" },
      { name: "SEO Analysis", description: "Search optimization score", weight: "15%" },
      { name: "Content Analysis", description: "Website content quality", weight: "10%" },
    ],
  },
  scoring: {
    title: "Lead Scoring Engine",
    baseScore: "30",
    bonuses: [
      { name: "Has Website", points: "20" },
      { name: "Has Phone", points: "15" },
      { name: "Has Email", points: "15" },
      { name: "High Rating (4.5+)", points: "10" },
      { name: "Many Reviews (50+)", points: "5" },
    ],
    tiers: [
      { name: "High Potential", range: "85-100", color: "#15803D" },
      { name: "Medium Potential", range: "60-84", color: "#D97706" },
      { name: "Low Potential", range: "0-59", color: "#DC2626" },
    ],
  },
  crm: {
    title: "CRM Pipeline",
    stages: ["New Lead", "Contacted", "Interested", "Follow-Up", "Meeting", "Proposal", "Negotiation", "Closed Won", "Closed Lost"],
    outreach: ["Email", "WhatsApp", "Phone", "LinkedIn"],
  },
};
