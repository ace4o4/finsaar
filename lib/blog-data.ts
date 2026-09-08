export interface BlogPost {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  authorRole: string;
  authorEmail?: string;
  authorBio?: string;
  authorImage?: string;
  date: string;
  readTime: string;
  featured?: boolean;
  published?: boolean;
  tags: string[];
  image?: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "fractional-cfo-vs-full-time-cfo",
    title: "Fractional CFO vs Full-Time CFO: Which is Right for Your Startup?",
    excerpt:
      "As your startup scales, the financial complexity grows exponentially. Here's how to decide between hiring a full-time CFO or partnering with a fractional one.",
    content: `
As your startup scales beyond ₹1 Crore in revenue, financial complexity grows exponentially. Suddenly, bookkeeping isn't enough. You need cash flow forecasting, margin analysis, investor-ready data rooms, and compliance systems that don't break at scale.

## The Full-Time CFO Dilemma

A full-time CFO in India commands a salary of ₹30–80 Lakhs annually, plus benefits, equity, and operational overhead. For a startup burning through runway, this is a massive fixed cost that may not be justified until you've crossed ₹50 Crore in revenue.

### What a Full-Time CFO Brings:
- **Dedicated attention** to your business 40+ hours/week
- **Deep institutional knowledge** built over months
- **Physical presence** in leadership meetings
- **Direct team management** of finance staff

### The Hidden Costs:
- Recruitment fees (20-25% of annual salary)
- 3-6 month ramp-up period before full productivity
- Benefits, bonuses, and equity dilution
- Risk of a bad hire derailing your financial operations

## The Fractional CFO Alternative

A fractional CFO gives you C-suite financial expertise at 65-82% lower cost. You get strategic advisory, real-time dashboards, compliance management, and capital strategy — all without the overhead of a full-time hire.

### When Fractional Makes Sense:
- **Revenue between ₹1Cr and ₹50Cr** — you need strategy but not full-time bandwidth
- **Fundraising cycles** — investor data rooms, financial models, term sheet analysis
- **Scaling operations** — systemizing finances from spreadsheets to real infrastructure
- **Cost consciousness** — every rupee of burn rate matters

### When Full-Time Makes Sense:
- **Revenue above ₹100Cr** with complex multi-entity structures
- **Preparing for IPO** with daily regulatory requirements
- **Large finance teams** (10+ people) requiring direct management

## The Finsaar Approach

At Finsaar, we operate as your embedded finance team. You get a dedicated CA-qualified analyst for day-to-day operations and a senior CFO advisor for strategic decisions. It's the best of both worlds — enterprise-grade financial infrastructure at startup-friendly pricing.

**The bottom line:** Don't hire for the role. Hire for the outcome. If you need financial clarity, compliance peace of mind, and strategic growth advisory — a fractional CFO delivers all of that at a fraction of the cost.
    `,
    category: "Strategy",
    author: "Rajesh Mehta",
    authorRole: "Co-Founder, Finsaar",
    date: "2026-07-28",
    readTime: "8 min",
    featured: true,
    tags: ["CFO", "Startup Finance", "Cost Optimization"],
    image: "/blog_cfo.png",
  },
  {
    slug: "gst-compliance-calendar-2026",
    title: "The Complete GST Compliance Calendar for Indian Startups (2026-27)",
    excerpt:
      "Missing a GST deadline blocks your input tax credits and creates vendor friction. Here's every deadline you need to know for FY 2026-27.",
    content: `
For Indian startups and SMEs, GST compliance isn't optional — it's survival. Missing a single filing deadline can block your input tax credits, trigger penalties, and create severe friction with vendors and customers alike.

## Why This Calendar Matters

The Indian GST regime requires monthly, quarterly, and annual filings depending on your turnover and registration type. A missed GSTR-3B filing attracts a late fee of ₹50/day (₹20/day for nil returns), and more critically, blocks your ability to claim input tax credits until the return is filed.

## Monthly Filing Deadlines

### GSTR-1 (Outward Supplies)
- **Due Date:** 11th of the following month
- **What:** Details of all outward supplies (sales invoices)
- **Penalty:** ₹50/day late fee (₹20 for nil)

### GSTR-3B (Summary Return)
- **Due Date:** 20th of the following month
- **What:** Summary of outward and inward supplies with tax payment
- **Penalty:** ₹50/day + interest at 18% p.a. on outstanding tax

### Key Quarterly Deadlines

| Quarter | GSTR-1 (Quarterly) | GSTR-3B Payment |
|---------|-------------------|-----------------|
| Q1 (Apr-Jun) | July 13 | Apr 20, May 20, Jun 20 |
| Q2 (Jul-Sep) | Oct 13 | Jul 20, Aug 20, Sep 20 |
| Q3 (Oct-Dec) | Jan 13 | Oct 20, Nov 20, Dec 20 |
| Q4 (Jan-Mar) | Apr 13 | Jan 20, Feb 20, Mar 20 |

## TDS Payment Deadlines
- **Due Date:** 7th of the following month
- **Q4 Exception:** March TDS due by April 30th

## Advance Tax Installments
| Installment | Due Date | Cumulative % |
|------------|----------|--------------|
| 1st | June 15 | 15% |
| 2nd | September 15 | 45% |
| 3rd | December 15 | 75% |
| 4th | March 15 | 100% |

## ROC Filing Deadlines
- **Annual Return (MGT-7):** Within 60 days of AGM
- **Financial Statements (AOC-4):** Within 30 days of AGM
- **AGM Deadline:** Within 6 months of financial year end (September 30)

## How Finsaar Helps

Our compliance team tracks every single deadline for you. We send proactive alerts 7 days before each due date, prepare all returns, and file them well before the deadline. With Finsaar, you'll never pay a late fee or lose input tax credits again.

**Pro tip:** Set up a compliance calendar in your project management tool and assign each deadline to your Finsaar team. We'll handle the rest.
    `,
    category: "Compliance",
    author: "Priya Krishnamurthy",
    authorRole: "Co-Founder, Finsaar",
    date: "2026-07-15",
    readTime: "12 min",
    featured: true,
    tags: ["GST", "Tax Compliance", "Indian Regulations"],
    image: "/blog_gst.png",
  },
  {
    slug: "cashflow-forecasting-for-startups",
    title: "The 13-Week Cash Flow Forecast: A Survival Tool for Scaling Startups",
    excerpt:
      "Revenue is vanity, profit is sanity, but cash is king. Learn how to build a rolling 13-week cash flow forecast that keeps your startup alive.",
    content: `
"Revenue is vanity, profit is sanity, but cash is king." This old adage has never been more relevant than for Indian startups navigating the challenging scaling journey from ₹1Cr to ₹10Cr in revenue.

## Why 13 Weeks?

A 13-week (roughly quarterly) rolling forecast hits the sweet spot between accuracy and actionability. It's short enough to be reasonably accurate, but long enough to spot cash crunches before they become emergencies.

## Building Your 13-Week Forecast

### Step 1: Map Your Cash Inflows
- **Confirmed receivables** — invoices already sent with expected payment dates
- **Projected sales** — based on your pipeline and historical conversion rates
- **Other income** — interest, refunds, grants, or investment tranches

### Step 2: Map Your Cash Outflows
- **Fixed costs** — rent, salaries, SaaS subscriptions, insurance
- **Variable costs** — COGS, commissions, shipping, marketing spend
- **One-time costs** — equipment purchases, legal fees, regulatory filings
- **Tax obligations** — GST, TDS, advance tax installments

### Step 3: Calculate Weekly Net Cash Position
For each of the 13 weeks, subtract total outflows from total inflows. This gives you your weekly net cash position. Plot it on a graph — you'll immediately see any danger zones.

## Red Flags to Watch

- **Negative cash position in any week** — you need bridge financing or need to accelerate collections
- **Declining trend over 4+ weeks** — your burn rate is outpacing revenue growth
- **Large concentration risk** — if 50%+ of your cash inflow depends on 1-2 clients

## The Finsaar Advantage

Our CFO advisory team builds and maintains rolling 13-week forecasts for every client. We update them weekly with actual data, compare forecast vs. actuals, and proactively flag any potential cash crunches 30+ days in advance.

This gives founders the financial visibility to make confident decisions about hiring, marketing spend, and growth investments — without the anxiety of wondering "can we make payroll next month?"
    `,
    category: "Finance",
    author: "Amit Srinivasan",
    authorRole: "Co-Founder, Finsaar",
    date: "2026-07-08",
    readTime: "10 min",
    tags: ["Cash Flow", "Forecasting", "Financial Planning"],
    image: "/blog_cashflow.png",
  },
  {
    slug: "startup-fundraising-data-room",
    title: "Building an Investor-Ready Data Room: The Definitive Checklist",
    excerpt:
      "A messy data room kills deals. Here's exactly what VCs and PE firms expect to see when they open your virtual data room during due diligence.",
    content: `
When a VC or PE firm decides to invest, the due diligence process begins — and the first thing they'll ask for is access to your data room. A poorly organized or incomplete data room doesn't just slow down the process; it actively signals operational immaturity and can kill the deal entirely.

## What is a Data Room?

A data room is a secure, organized virtual repository containing all the financial, legal, and operational documents a potential investor needs to evaluate your business. Think of it as a comprehensive X-ray of your company.

## The Essential Data Room Checklist

### 1. Corporate Structure
- Certificate of Incorporation
- Memorandum & Articles of Association
- Board resolutions and shareholder agreements
- Cap table (fully diluted, including ESOPs)
- Organizational chart

### 2. Financial Statements
- Audited financials for last 3 years
- Monthly P&L statements (last 12 months)
- Balance sheets
- Cash flow statements
- Tax returns (income tax + GST)

### 3. Revenue & Metrics
- Monthly revenue breakdown by product/segment
- Customer acquisition cost (CAC) and lifetime value (LTV)
- Churn rate and retention metrics
- Unit economics analysis
- Revenue projections (3-year model)

### 4. Legal & Compliance
- All material contracts (customer, vendor, partnership)
- Intellectual property registrations
- Regulatory licenses and permits
- Pending or threatened litigation
- Insurance policies

### 5. Operations
- Key employee contracts and compensation details
- Technology architecture overview
- Data privacy and security policies
- Vendor agreements and dependencies

## How Finsaar Prepares Your Data Room

Our Capital Advisory team has built data rooms for 20+ fundraising rounds. We:
1. **Audit your existing documentation** for gaps and red flags
2. **Clean your financial statements** to investor-grade standards
3. **Build financial models** that tell your growth story with data
4. **Organize everything** in a logical, VC-friendly structure
5. **Prepare management presentation** and key metrics dashboard

The result: investors spend less time digging and more time getting excited about your business.
    `,
    category: "Fundraising",
    author: "Amit Srinivasan",
    authorRole: "Co-Founder, Finsaar",
    date: "2026-06-25",
    readTime: "11 min",
    tags: ["Fundraising", "Data Room", "Investor Relations"],
    image: "/blog_dataroom.png",
  },
  {
    slug: "mis-reporting-for-founders",
    title: "MIS Reporting Demystified: What Every Founder Should Track Monthly",
    excerpt:
      "Management Information Systems (MIS) reports aren't just for large corporates. Here's how to build a lean MIS dashboard that drives better decisions.",
    content: `
Most founders think MIS (Management Information Systems) reporting is something only large corporations need. That's a dangerous misconception. If you're running a ₹1Cr+ business without monthly MIS reports, you're essentially flying blind.

## What is MIS Reporting?

MIS reporting is the systematic process of collecting, processing, and presenting financial and operational data to help management make informed decisions. It transforms raw transactional data into actionable insights.

## The 5 Reports Every Founder Needs

### 1. Monthly P&L (Profit & Loss)
- Revenue breakdown by product/segment
- Gross margin analysis
- Operating expenses by category
- EBITDA and net profit margins
- Month-over-month and year-over-year comparisons

### 2. Cash Flow Dashboard
- Current bank balances across all accounts
- Accounts receivable aging (30/60/90 days)
- Accounts payable schedule
- 13-week cash flow forecast
- Burn rate and runway calculation

### 3. Revenue Analytics
- MRR/ARR trends
- Customer acquisition metrics
- Revenue concentration analysis
- Pipeline and conversion rates
- Cohort-based retention analysis

### 4. Expense Analytics
- Spend by department/category
- Budget vs. actual variance
- Per-employee cost trends
- Vendor spend analysis
- Unusual or one-time expenses flagged

### 5. KPI Scorecard
- 5-7 key metrics that matter most to YOUR business
- Trend lines showing direction of travel
- Red/amber/green status indicators
- Commentary on significant variances

## The Finsaar MIS Approach

We don't believe in 50-page reports that nobody reads. Our MIS dashboards are:
- **One-page visual summaries** with drill-down capability
- **Delivered by the 5th of every month** — consistently, without fail
- **Accompanied by a 15-minute video walkthrough** from your dedicated analyst
- **Connected to real-time data** from your Tally/Zoho/QuickBooks

**The result:** You spend 15 minutes per month getting total financial clarity, instead of 15 hours trying to understand messy spreadsheets.
    `,
    category: "Finance",
    author: "Rajesh Mehta",
    authorRole: "Co-Founder, Finsaar",
    date: "2026-06-18",
    readTime: "9 min",
    tags: ["MIS Reporting", "Dashboard", "Financial Visibility"],
    image: "/hero_dashboard.png",
  },
  {
    slug: "tds-compliance-mistakes",
    title: "5 TDS Compliance Mistakes That Cost Indian Startups Lakhs Every Year",
    excerpt:
      "TDS compliance seems simple until it isn't. These common mistakes can result in hefty penalties, interest charges, and even prosecution.",
    content: `
Tax Deducted at Source (TDS) compliance is one of those areas where Indian startups consistently stumble — not because the rules are impossibly complex, but because the consequences of small errors compound rapidly.

## Mistake #1: Late TDS Payment

TDS deducted from payments must be deposited to the government by the 7th of the following month. For March, the deadline extends to April 30th.

**The Cost:** Interest at 1.5% per month from the date of deduction to the date of payment. On a ₹10 Lakh TDS liability, just 3 months of delay costs you ₹45,000 in interest alone.

## Mistake #2: Wrong TDS Rates

Different payment types attract different TDS rates — and they change regularly. Professional fees (Section 194J) attract 10%, while contract payments (Section 194C) attract 1-2%.

**The Cost:** Deducting at the wrong rate means either:
- Short deduction → penalty equal to the shortfall + interest
- Over deduction → unhappy vendors who file complaints

## Mistake #3: Not Filing TDS Returns on Time

Quarterly TDS returns (Form 26Q/24Q) must be filed within specified deadlines. Late filing attracts a penalty of ₹200/day until filed, up to the total TDS amount.

**The Cost:** A single quarter's late filing can cost ₹10,000-₹50,000+ depending on delay duration.

## Mistake #4: PAN Errors in TDS Certificates

If you deduct TDS against an incorrect PAN, the deductee cannot claim credit for the tax deducted. This creates friction with vendors and employees.

**The Cost:** Relationship damage, potential legal disputes, and the administrative burden of corrections.

## Mistake #5: Ignoring Lower Deduction Certificates

Some vendors have lower/nil TDS deduction certificates under Section 197. Ignoring these and deducting at standard rates means you're unnecessarily locking up your vendors' cash.

**The Cost:** Vendor dissatisfaction and potential loss of preferred supplier relationships.

## How Finsaar Prevents All Five

Our compliance team maintains a comprehensive TDS calendar, verifies rates against current notifications, validates all PANs before processing, and files returns well before deadlines. Zero penalties, zero interest, zero friction.
    `,
    category: "Compliance",
    author: "Priya Krishnamurthy",
    authorRole: "Co-Founder, Finsaar",
    date: "2026-06-10",
    readTime: "7 min",
    tags: ["TDS", "Tax Compliance", "Indian Regulations"],
    image: "/blog_gst.png",
  },
];

export const blogCategories = [
  "All",
  "Strategy",
  "Finance",
  "Compliance",
  "Fundraising",
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getFeaturedPosts(): BlogPost[] {
  return blogPosts.filter((post) => post.featured);
}
