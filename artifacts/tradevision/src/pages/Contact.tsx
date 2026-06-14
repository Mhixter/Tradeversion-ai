import React, { useState } from "react";
import { Link } from "wouter";
import { LogoIcon } from "@/components/Logo";
import {
  Mail, MessageCircle, Phone, MapPin, Clock, CheckCircle2,
  Send, ArrowRight, Building2, HelpCircle, Bot, Briefcase, Zap,
  ChevronRight, Twitter, Linkedin, Youtube,
} from "lucide-react";

const SUPPORT_CHANNELS = [
  { icon: MessageCircle, label:"Live Chat",   desc:"Available 24/7 for Pro & Enterprise users",  badge:"Fastest",  badgeColor:"bg-success/15 text-success border-success/20", action:"Start Chat", href:"#" },
  { icon: Mail,          label:"Email Support",desc:"support@tradevision.ai — we reply within 4h",badge:"",         badgeColor:"",                                             action:"Send Email",  href:"mailto:support@tradevision.ai" },
  { icon: Phone,         label:"Phone / Call", desc:"Enterprise accounts: +1 (888) 840-2400",    badge:"Enterprise",badgeColor:"bg-primary/15 text-primary border-primary/20", action:"Book a Call", href:"#" },
];

const OFFICES = [
  { city:"London",       country:"United Kingdom", addr:"25 Finsbury Square, EC2A 1AF",         flag:"🇬🇧" },
  { city:"Singapore",    country:"Singapore",       addr:"1 Raffles Place, #44-02, 048616",      flag:"🇸🇬" },
  { city:"New York",     country:"United States",   addr:"140 Broadway, 46th Floor, NY 10005",   flag:"🇺🇸" },
];

const INQUIRY_TYPES = [
  { id:"general",   label:"General Inquiry",      icon: HelpCircle },
  { id:"sales",     label:"Sales / Pricing",      icon: Briefcase  },
  { id:"technical", label:"Technical Support",    icon: Bot        },
  { id:"enterprise",label:"Enterprise / Firms",   icon: Building2  },
  { id:"partner",   label:"Partnerships",         icon: Zap        },
];

function NavBar() {
  return (
    <header className="border-b border-border/50 bg-background/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/landing">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <LogoIcon size={28} />
            <span className="font-black text-sm">TradeVision AI</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
          <Link href="/landing" className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all">Get Started</Link>
        </div>
      </div>
    </header>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState({ name:"", email:"", company:"", type:"general", subject:"", message:"" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 1400);
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero */}
      <section className="py-16 sm:py-20 border-b border-border/40 bg-gradient-to-b from-primary/5 to-background text-center">
        <div className="max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/8 text-primary text-xs font-semibold mb-6">
            <MessageCircle className="w-3 h-3" />We typically reply in under 4 hours
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">Get in <span className="text-primary">Touch</span></h1>
          <p className="text-muted-foreground text-base max-w-lg mx-auto leading-relaxed">Have a question, want to book a demo, or need enterprise pricing? Our team is here to help.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">

        {/* Support channels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
          {SUPPORT_CHANNELS.map(ch => (
            <a key={ch.label} href={ch.href} className="group flex flex-col bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/30 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <ch.icon className="w-5 h-5 text-primary" />
                </div>
                {ch.badge && <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${ch.badgeColor}`}>{ch.badge}</span>}
              </div>
              <h3 className="font-black text-sm mb-1">{ch.label}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4">{ch.desc}</p>
              <span className="inline-flex items-center gap-1 text-primary text-xs font-semibold group-hover:gap-2 transition-all">
                {ch.action} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact form */}
          <div className="lg:col-span-7">
            <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8">
              <h2 className="text-xl font-black mb-1">Send Us a Message</h2>
              <p className="text-sm text-muted-foreground mb-6">Fill out the form and our team will get back to you promptly.</p>

              {sent ? (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-success/15 border border-success/30 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  </div>
                  <h3 className="text-xl font-black mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">Thank you, {form.name.split(" ")[0]}. We'll reply to <strong>{form.email}</strong> within 4 hours.</p>
                  <button onClick={() => { setSent(false); setForm({ name:"", email:"", company:"", type:"general", subject:"", message:"" }); }} className="text-primary text-sm font-semibold hover:underline">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Full Name *</label>
                      <input name="name" value={form.name} onChange={handleChange} required placeholder="John Trader" className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 placeholder:text-muted-foreground/50" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Email Address *</label>
                      <input name="email" value={form.email} onChange={handleChange} required type="email" placeholder="john@company.com" className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 placeholder:text-muted-foreground/50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Company / Firm</label>
                      <input name="company" value={form.company} onChange={handleChange} placeholder="Optional" className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 placeholder:text-muted-foreground/50" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Inquiry Type</label>
                      <select name="type" value={form.type} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 text-foreground">
                        {INQUIRY_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Subject *</label>
                    <input name="subject" value={form.subject} onChange={handleChange} placeholder="How can we help?" className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 placeholder:text-muted-foreground/50" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Message *</label>
                    <textarea name="message" value={form.message} onChange={handleChange} required rows={5} placeholder="Describe your question or situation in detail…" className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 resize-none placeholder:text-muted-foreground/50" />
                  </div>
                  <button type="submit" disabled={sending || !form.name || !form.email || !form.message} className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl text-sm shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100">
                    {sending ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending…</>
                    ) : (
                      <><Send className="w-4 h-4" />Send Message</>
                    )}
                  </button>
                  <p className="text-[11px] text-muted-foreground text-center">By submitting, you agree to our <a href="#" className="text-primary hover:underline">Privacy Policy</a>.</p>
                </form>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-5 space-y-6">
            {/* Response times */}
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h3 className="font-black text-sm mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />Response Times</h3>
              <div className="space-y-3">
                {[
                  { tier:"Enterprise",    time:"Within 1 hour",  color:"text-success" },
                  { tier:"Professional",  time:"Within 4 hours", color:"text-primary" },
                  { tier:"Starter / Free",time:"Within 24 hours",color:"text-muted-foreground" },
                ].map(r => (
                  <div key={r.tier} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                    <span className="text-sm font-semibold">{r.tier}</span>
                    <span className={`text-xs font-bold ${r.color}`}>{r.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Office locations */}
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h3 className="font-black text-sm mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />Global Offices</h3>
              <div className="space-y-4">
                {OFFICES.map(o => (
                  <div key={o.city} className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">{o.flag}</span>
                    <div>
                      <p className="text-sm font-bold">{o.city}, {o.country}</p>
                      <p className="text-xs text-muted-foreground">{o.addr}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h3 className="font-black text-sm mb-4">Quick Self-Service</h3>
              <div className="space-y-2">
                {[
                  { label:"Browse FAQ",           href:"/faq",     icon: HelpCircle },
                  { label:"Read Documentation",    href:"#",        icon: BookOpen   },
                  { label:"View System Status",    href:"#",        icon: Zap        },
                  { label:"Watch Tutorial Videos", href:"#",        icon: Bot        },
                ].map(l => (
                  <Link key={l.label} href={l.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors group">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <l.icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{l.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 ml-auto group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Social */}
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h3 className="font-black text-sm mb-4">Follow Us</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Twitter,        label:"Twitter / X",  href:"#", desc:"Updates & signals" },
                  { icon: Linkedin,       label:"LinkedIn",     href:"#", desc:"Company news" },
                  { icon: MessageCircle,  label:"Telegram",     href:"#", desc:"Community chat" },
                  { icon: Youtube,        label:"YouTube",      href:"#", desc:"Tutorials" },
                ].map(s => (
                  <a key={s.label} href={s.href} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-accent/50 transition-all">
                    <s.icon className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-semibold leading-tight">{s.label}</p>
                      <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LogoIcon size={24} />
            <span className="text-sm font-bold">TradeVision AI</span>
          </div>
          <div className="flex gap-4">
            <Link href="/landing" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link href="/faq" className="text-xs text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
            <Link href="/blog" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
          </div>
          <p className="text-[11px] text-muted-foreground">© 2026 TradeVision AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
