import React from "react";
import { Link, useLocation } from "wouter";
import { FileText } from "lucide-react";
import { LogoIcon } from "@/components/Logo";

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/landing" className="flex items-center gap-2">
          <LogoIcon size={28} />
          <span className="font-black text-sm">TradeVision AI</span>
        </Link>
        <Link href="/signup" className="text-sm px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">Start Free</Link>
      </div>
    </header>
  );
}

const LEGAL_LINKS = [
  { href: "/terms",           label: "Terms of Service" },
  { href: "/privacy",         label: "Privacy Policy" },
  { href: "/cookies",         label: "Cookie Policy" },
  { href: "/risk-disclosure", label: "Risk Disclosure" },
  { href: "/compliance",      label: "Compliance" },
];

const DOCS: Record<string, { title: string; updated: string; sections: { h: string; body: string }[] }> = {
  "/terms": {
    title: "Terms of Service",
    updated: "January 1, 2026",
    sections: [
      { h: "1. Acceptance of Terms", body: "By accessing or using TradeVision AI ('Service'), you agree to be bound by these Terms of Service ('Terms'). If you do not agree to these Terms, you may not access or use the Service. These Terms constitute a legally binding agreement between you and TradeVision AI ('Company', 'we', 'us', or 'our')." },
      { h: "2. Description of Service", body: "TradeVision AI provides an automated trading platform that allows users to create, backtest, deploy, and manage algorithmic trading bots across supported third-party broker accounts. The Service includes AI-powered signal generation, copy trading, risk management tools, portfolio analytics, and a marketplace for trading strategies. TradeVision AI is a technology provider only and is not a broker, investment advisor, or financial institution. We do not execute trades on your behalf, manage client funds, or provide personalised financial advice." },
      { h: "3. Account Registration", body: "You must register for an account to use the Service. You agree to provide accurate, current, and complete information during registration and to update such information as necessary. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately at security@tradevision.ai of any unauthorized use of your account." },
      { h: "4. Subscription Plans and Billing", body: "Access to certain features requires a paid subscription. Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable except as expressly stated in our Refund Policy. We reserve the right to change subscription fees upon 30 days' notice. Failure to pay fees may result in suspension or termination of your account." },
      { h: "5. Prohibited Uses", body: "You agree not to: (a) use the Service for any unlawful purpose; (b) attempt to gain unauthorized access to any portion of the Service; (c) engage in market manipulation or any activity that violates applicable securities laws; (d) reverse engineer, decompile, or disassemble any aspect of the Service; (e) use automated means to access the Service other than through our official API; (f) resell or sublicense the Service without our written consent." },
      { h: "6. Intellectual Property", body: "The Service and all content, features, and functionality are owned by TradeVision AI Ltd and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to use the Service solely for your personal or business trading activities." },
      { h: "7. Disclaimer of Warranties", body: "THE SERVICE IS PROVIDED 'AS IS' AND 'AS AVAILABLE' WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES. TRADING INVOLVES SUBSTANTIAL RISK AND TradeVision AI DOES NOT GUARANTEE ANY TRADING RESULTS. PAST PERFORMANCE DOES NOT GUARANTEE FUTURE RESULTS." },
      { h: "8. Limitation of Liability", body: "TO THE MAXIMUM EXTENT PERMITTED BY LAW, TradeVision AI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR TRADING CAPITAL, ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE FEES PAID BY YOU IN THE SIX MONTHS PRECEDING THE CLAIM." },
      { h: "9. Governing Law", body: "These Terms are governed by the laws of the jurisdiction in which the Company is registered. You agree to submit to the exclusive jurisdiction of the courts in that jurisdiction for any dispute arising out of or relating to these Terms or the Service, except where prohibited by applicable law in your country of residence." },
      { h: "10. Contact", body: "For questions about these Terms, contact our legal team at legal@tradevision.ai. We aim to respond to all legal enquiries within 5 business days." },
    ],
  },
  "/privacy": {
    title: "Privacy Policy",
    updated: "January 1, 2026",
    sections: [
      { h: "1. Data We Collect", body: "We collect information you provide directly (name, email, trading preferences), information generated by your use of the Service (trading activity, bot configurations, performance data), technical information (IP address, browser type, device identifiers), and information from connected broker accounts (account balances, trade history, positions — read-only where possible)." },
      { h: "2. How We Use Your Data", body: "We use your data to: provide and improve the Service; personalize your experience; generate AI trading signals relevant to your strategies; send service notifications and product updates; comply with legal obligations; prevent fraud and ensure security; and conduct analytics to improve platform performance." },
      { h: "3. Data Sharing", body: "We do not sell your personal data. We share data with: (a) connected brokers to execute your trading instructions; (b) service providers who process data on our behalf (cloud providers, analytics, payment processors); (c) law enforcement when required by law; (d) successors in the event of a merger or acquisition, with advance notice to users." },
      { h: "4. Data Retention", body: "We retain your account data for as long as your account is active plus 7 years for tax and legal compliance. Trading history is retained for 10 years as required by financial regulations. You may request deletion of non-required data at any time via privacy@tradevision.ai." },
      { h: "5. Your Rights (GDPR)", body: "If you are in the European Economic Area, you have the right to: access your personal data; correct inaccurate data; request erasure (where not prohibited by law); object to processing; data portability; and withdraw consent. Submit requests to privacy@tradevision.ai. We respond within 30 days." },
      { h: "6. Security", body: "We use AES-256 encryption for data at rest, TLS 1.3 for data in transit, SOC 2 Type II certified infrastructure, multi-factor authentication, and regular third-party security audits. Despite these measures, no system is completely secure and you transmit data at your own risk." },
      { h: "7. Cookies", body: "We use cookies and similar technologies. See our Cookie Policy for details." },
      { h: "8. Contact", body: "For all privacy-related enquiries and data subject requests, contact our Data Protection Officer at privacy@tradevision.ai. We respond to all requests within 30 days as required by applicable data protection law." },
    ],
  },
  "/cookies": {
    title: "Cookie Policy",
    updated: "January 1, 2026",
    sections: [
      { h: "What Are Cookies", body: "Cookies are small text files stored on your device when you visit a website. They help us remember your preferences, analyze usage, and deliver relevant content. We also use similar technologies like localStorage and sessionStorage." },
      { h: "Strictly Necessary Cookies", body: "These cookies are essential for the Service to function. They include session authentication tokens, CSRF protection tokens, and load balancer routing cookies. You cannot opt out of these without stopping use of the Service." },
      { h: "Analytics Cookies", body: "We use privacy-preserving analytics (no third-party tracking) to understand how users interact with the platform. Analytics data is aggregated and cannot identify individual users. You can opt out via your account settings." },
      { h: "Preference Cookies", body: "These remember your settings such as dashboard layout, chart preferences, notification settings, and language preference. Disabling them means you must re-set preferences each visit." },
      { h: "Marketing Cookies", body: "If you arrived via a marketing campaign, we may set a cookie to attribute the referral. We do not use third-party advertising cookies on the platform itself. Marketing cookies are used only on our public marketing pages." },
      { h: "Managing Cookies", body: "You can control cookies via your browser settings. Note that disabling necessary cookies will prevent login. You can also clear all cookies via Settings → Privacy in your TradeVision account." },
    ],
  },
  "/risk-disclosure": {
    title: "Risk Disclosure",
    updated: "January 1, 2026",
    sections: [
      { h: "Important Warning", body: "TRADING FINANCIAL INSTRUMENTS INVOLVES SIGNIFICANT RISK AND IS NOT SUITABLE FOR ALL INVESTORS. YOU COULD LOSE SOME OR ALL OF YOUR INVESTED CAPITAL. ONLY TRADE WITH MONEY YOU CAN AFFORD TO LOSE. THIS DISCLOSURE DOES NOT COVER ALL RISKS INVOLVED IN TRADING." },
      { h: "Market Risk", body: "Financial markets can move rapidly and against your positions. Price gaps, slippage, and volatile conditions can result in losses exceeding your initial investment, particularly when using leverage. AI signals are based on historical patterns and do not guarantee future performance." },
      { h: "Algorithmic Trading Risk", body: "Automated trading bots execute trades based on programmed rules. Technical failures, connectivity issues, data feed errors, or unexpected market conditions can cause bots to behave unexpectedly. You are solely responsible for monitoring your bots and the trades they execute." },
      { h: "Leverage Risk", body: "Many supported brokers offer leveraged products including forex, CFDs, and futures. Leverage magnifies both gains and losses. A small adverse price movement can result in the loss of your entire margin deposit. Ensure you fully understand leverage before trading leveraged products." },
      { h: "Technology Risk", body: "TradeVision AI provides technology services. System outages, internet connectivity failures, exchange or broker outages, or cybersecurity incidents could prevent the execution of intended trades or the management of open positions. We do not accept liability for losses arising from technology failures outside our direct control." },
      { h: "Regulatory Risk", body: "Financial regulations vary by jurisdiction and change over time. Services available to you depend on your country of residence and applicable regulations. You are responsible for ensuring your trading activities comply with the laws of your jurisdiction." },
      { h: "Past Performance", body: "Any trading results shown on the platform — including bot performance, copy trading returns, and strategy backtests — reflect past or simulated performance. Past performance is not indicative of future results. Backtested results are hypothetical and may not reflect actual trading conditions." },
      { h: "Counterparty Risk", body: "Your funds are held with your connected third-party broker, not TradeVision AI. Broker insolvency, fraud, or operational failure is outside our control. Ensure your broker is regulated by an appropriate authority in your jurisdiction." },
    ],
  },
  "/compliance": {
    title: "Compliance",
    updated: "January 1, 2026",
    sections: [
      { h: "Regulatory Status", body: "TradeVision AI is a technology company. We provide technology services only and are not authorised or regulated as a financial services provider by any financial authority. We do not provide investment advice, execute trades on our own account, or hold client funds. Users are responsible for ensuring their trading activities comply with the financial regulations of their own jurisdiction." },
      { h: "Supported Jurisdictions", body: "Our services are available in most countries. We do not onboard users from countries subject to comprehensive OFAC, EU, or UN sanctions. Users are responsible for ensuring their use of the Service complies with their local laws and regulations." },
      { h: "KYC & AML", body: "We conduct Know Your Customer (KYC) verification for certain account types and transaction thresholds in compliance with anti-money laundering (AML) regulations. Required documents may include government-issued ID, proof of address, and source of funds documentation." },
      { h: "Data Protection", body: "We comply with the UK General Data Protection Regulation (UK GDPR), the EU GDPR, and the California Consumer Privacy Act (CCPA) as applicable. Our Data Protection Officer can be reached at dpo@tradevision.ai." },
      { h: "GDPR", body: "For EU/EEA users, we process personal data under the legal bases of contract performance, legitimate interests, and consent as appropriate. Data is stored in EU-based servers (Ireland, Frankfurt) for EU users. Cross-border transfers comply with Standard Contractual Clauses." },
      { h: "MiFID II", body: "While TradeVision AI is not a MiFID II regulated firm, our enterprise API and institutional tools are designed to support clients who are regulated under MiFID II and need to demonstrate best execution, trade reporting, and audit trail capabilities." },
      { h: "Reporting Concerns", body: "To report compliance concerns, suspicious activity, or potential violations, contact compliance@tradevision.ai. We investigate all reports promptly and confidentially. Whistleblower protections apply." },
      { h: "Contact", body: "Compliance team: compliance@tradevision.ai. We investigate all compliance-related reports promptly and in strict confidence." },
    ],
  },
};

export default function Legal() {
  const [location] = useLocation();
  const doc = DOCS[location] ?? DOCS["/terms"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 flex flex-col md:flex-row gap-10">
        {/* Sidebar */}
        <aside className="md:w-56 shrink-0">
          <div className="md:sticky md:top-24 bg-card border border-border/50 rounded-2xl p-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-3">Legal Documents</p>
            <ul className="space-y-1">
              {LEGAL_LINKS.map(l => (
                <li key={l.href}>
                  <Link href={l.href}
                    className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors ${location === l.href ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}>
                    <FileText className="w-3.5 h-3.5 shrink-0" />{l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">Last updated: {doc.updated}</span>
            </div>
            <h1 className="text-3xl font-black">{doc.title}</h1>
          </div>

          <div className="space-y-8">
            {doc.sections.map(s => (
              <div key={s.h}>
                <h2 className="text-base font-black mb-3 text-foreground">{s.h}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-5 bg-accent/30 border border-border/50 rounded-2xl">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Questions?</strong> Contact our legal team at{" "}
              <a href="mailto:legal@tradevision.ai" className="text-primary hover:underline">legal@tradevision.ai</a>.
              This document was last reviewed by our legal counsel on {doc.updated}.
            </p>
          </div>
        </main>
      </div>

      <footer className="border-t border-border/40 py-8 text-center">
        <p className="text-xs text-muted-foreground">© 2026 TradeVision AI · <Link href="/terms" className="hover:text-foreground cursor-pointer">Terms</Link> · <Link href="/privacy" className="hover:text-foreground cursor-pointer">Privacy</Link> · <Link href="/contact" className="hover:text-foreground cursor-pointer">Contact</Link></p>
      </footer>
    </div>
  );
}
