import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, CheckCircle2, Clock, AlertTriangle, ChevronRight,
  ChevronLeft, User, MapPin, FileText, Briefcase, Globe,
  Upload, Lock, BadgeCheck, RefreshCw,
} from "lucide-react";

/* ─── Country list (ISO 3166-1 alpha-3) ─────────────────────────────────── */
const COUNTRIES = [
  { code: "USA", name: "United States" }, { code: "GBR", name: "United Kingdom" },
  { code: "DEU", name: "Germany" }, { code: "FRA", name: "France" },
  { code: "CHE", name: "Switzerland" }, { code: "SGP", name: "Singapore" },
  { code: "HKG", name: "Hong Kong" }, { code: "JPN", name: "Japan" },
  { code: "AUS", name: "Australia" }, { code: "CAN", name: "Canada" },
  { code: "NLD", name: "Netherlands" }, { code: "SWE", name: "Sweden" },
  { code: "NOR", name: "Norway" }, { code: "DNK", name: "Denmark" },
  { code: "FIN", name: "Finland" }, { code: "ARE", name: "United Arab Emirates" },
  { code: "QAT", name: "Qatar" }, { code: "SAU", name: "Saudi Arabia" },
  { code: "KOR", name: "South Korea" }, { code: "NZL", name: "New Zealand" },
  { code: "BRA", name: "Brazil" }, { code: "MEX", name: "Mexico" },
  { code: "IND", name: "India" }, { code: "ZAF", name: "South Africa" },
  { code: "TUR", name: "Turkey" }, { code: "POL", name: "Poland" },
  { code: "CZE", name: "Czech Republic" }, { code: "AUT", name: "Austria" },
  { code: "BEL", name: "Belgium" }, { code: "PRT", name: "Portugal" },
  { code: "ESP", name: "Spain" }, { code: "ITA", name: "Italy" },
  { code: "ISR", name: "Israel" }, { code: "MYS", name: "Malaysia" },
  { code: "THA", name: "Thailand" }, { code: "IDN", name: "Indonesia" },
  { code: "PHL", name: "Philippines" }, { code: "VNM", name: "Vietnam" },
  { code: "CHL", name: "Chile" }, { code: "COL", name: "Colombia" },
  { code: "ARG", name: "Argentina" }, { code: "PER", name: "Peru" },
  { code: "EGY", name: "Egypt" }, { code: "NGA", name: "Nigeria" },
  { code: "KEN", name: "Kenya" }, { code: "GHA", name: "Ghana" },
  { code: "MAR", name: "Morocco" }, { code: "PAK", name: "Pakistan" },
  { code: "BGD", name: "Bangladesh" }, { code: "CHN", name: "China" },
  { code: "TWN", name: "Taiwan" }, { code: "HUN", name: "Hungary" },
  { code: "ROU", name: "Romania" }, { code: "HRV", name: "Croatia" },
  { code: "SVK", name: "Slovakia" }, { code: "BGR", name: "Bulgaria" },
  { code: "GRC", name: "Greece" }, { code: "CYP", name: "Cyprus" },
  { code: "MLT", name: "Malta" }, { code: "LUX", name: "Luxembourg" },
  { code: "LIE", name: "Liechtenstein" }, { code: "MCO", name: "Monaco" },
  { code: "AND", name: "Andorra" }, { code: "ISL", name: "Iceland" },
  { code: "JOR", name: "Jordan" }, { code: "KWT", name: "Kuwait" },
  { code: "BHR", name: "Bahrain" }, { code: "OMN", name: "Oman" },
  { code: "LBN", name: "Lebanon" }, { code: "UKR", name: "Ukraine" },
  { code: "SVN", name: "Slovenia" }, { code: "EST", name: "Estonia" },
].sort((a, b) => a.name.localeCompare(b.name));

const STEPS = [
  { id: 1, label: "Personal Info",  icon: User      },
  { id: 2, label: "Address",        icon: MapPin    },
  { id: 3, label: "Identity Doc",   icon: FileText  },
  { id: 4, label: "Financial",      icon: Briefcase },
  { id: 5, label: "Review",         icon: Shield    },
];

type KycStatusType = "not_started" | "pending" | "under_review" | "approved" | "rejected" | "requires_resubmission";

interface FormData {
  firstName: string; lastName: string; middleName: string; dateOfBirth: string;
  nationality: string; countryOfResidence: string; taxId: string;
  addressLine1: string; addressLine2: string; city: string;
  state: string; postalCode: string; country: string;
  docType: string; docNumber: string; docIssuingCountry: string; docExpiryDate: string;
  isPep: string; isUsCitizen: string;
  sourceOfFunds: string; employmentStatus: string; annualIncome: string;
  addressDocType: string;
}

const INITIAL: FormData = {
  firstName: "", lastName: "", middleName: "", dateOfBirth: "",
  nationality: "", countryOfResidence: "", taxId: "",
  addressLine1: "", addressLine2: "", city: "",
  state: "", postalCode: "", country: "",
  docType: "passport", docNumber: "", docIssuingCountry: "", docExpiryDate: "",
  isPep: "no", isUsCitizen: "no",
  sourceOfFunds: "", employmentStatus: "", annualIncome: "",
  addressDocType: "utility_bill",
};

function StatusBanner({ status }: { status: KycStatusType }) {
  const cfg: Record<KycStatusType, { icon: React.ElementType; color: string; title: string; desc: string }> = {
    not_started:           { icon: Shield,       color: "border-primary/30 bg-primary/5",       title: "Identity Verification Required", desc: "Complete KYC to access live trading, withdrawals, and full platform features." },
    pending:               { icon: Clock,        color: "border-amber-500/30 bg-amber-500/5",   title: "Verification Under Review",      desc: "Your documents have been submitted and are being reviewed. This typically takes 1–2 business days." },
    under_review:          { icon: Clock,        color: "border-blue-500/30 bg-blue-500/5",     title: "Under Manual Review",            desc: "A compliance officer is reviewing your documents. We'll notify you by email." },
    approved:              { icon: BadgeCheck,   color: "border-emerald-500/30 bg-emerald-500/5", title: "Verification Approved",         desc: "Your identity has been successfully verified. You have full access to all platform features." },
    rejected:              { icon: AlertTriangle, color: "border-destructive/30 bg-destructive/5", title: "Verification Rejected",        desc: "Your submission was rejected. Please review the reason below and resubmit." },
    requires_resubmission: { icon: RefreshCw,   color: "border-orange-500/30 bg-orange-500/5", title: "Resubmission Required",          desc: "Some documents need to be resubmitted. Please update and try again." },
  };
  const c = cfg[status];
  const Icon = c.icon;
  return (
    <div className={`border rounded-xl p-4 flex items-start gap-3 ${c.color}`}>
      <Icon className="w-5 h-5 mt-0.5 shrink-0 text-foreground/70" />
      <div>
        <p className="font-semibold text-foreground">{c.title}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{c.desc}</p>
      </div>
    </div>
  );
}

function FieldGroup({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function CountrySelect({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="">{placeholder || "Select country…"}</option>
      {COUNTRIES.map(c => (
        <option key={c.code} value={c.code}>{c.name}</option>
      ))}
    </select>
  );
}

export default function KYC() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [status, setStatus] = useState<KycStatusType>("not_started");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/kyc/status", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setStatus(d.status || "not_started"); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const set = (k: keyof FormData, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/kyc/submit", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setStatus("pending");
      toast({ title: "KYC Submitted", description: "Your documents are under review. We'll email you within 1–2 business days." });
    } catch (e: any) {
      toast({ title: "Submission Failed", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    </Layout>
  );

  const canEdit = status === "not_started" || status === "rejected" || status === "requires_resubmission";

  return (
    <Layout>
      <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Identity Verification (KYC)</h1>
            <p className="text-sm text-muted-foreground">Required for live trading and withdrawals · AML/CFT compliant</p>
          </div>
        </div>

        <StatusBanner status={status} />

        {/* Trust badges */}
        <div className="flex flex-wrap gap-3">
          {[
            { icon: Lock, label: "256-bit Encrypted" },
            { icon: Globe, label: "180+ Countries Supported" },
            { icon: BadgeCheck, label: "GDPR Compliant" },
            { icon: Shield, label: "AML/KYC Compliant" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border">
              <Icon className="w-3 h-3" />
              {label}
            </div>
          ))}
        </div>

        {canEdit && (
          <>
            {/* Step indicator */}
            <div className="flex items-center gap-1">
              {STEPS.map((s, i) => (
                <React.Fragment key={s.id}>
                  <button
                    onClick={() => s.id < step && setStep(s.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      step === s.id
                        ? "bg-primary text-primary-foreground"
                        : s.id < step
                        ? "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s.id < step ? <CheckCircle2 className="w-3 h-3" /> : <s.icon className="w-3 h-3" />}
                    <span className="hidden sm:block">{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${s.id < step ? "bg-primary/40" : "bg-border"}`} />}
                </React.Fragment>
              ))}
            </div>

            {/* Step 1: Personal Info */}
            {step === 1 && (
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4 text-primary" />Personal Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FieldGroup label="First Name" required><Input value={form.firstName} onChange={e => set("firstName", e.target.value)} placeholder="John" /></FieldGroup>
                    <FieldGroup label="Last Name" required><Input value={form.lastName} onChange={e => set("lastName", e.target.value)} placeholder="Doe" /></FieldGroup>
                  </div>
                  <FieldGroup label="Middle Name (optional)"><Input value={form.middleName} onChange={e => set("middleName", e.target.value)} placeholder="Optional" /></FieldGroup>
                  <FieldGroup label="Date of Birth" required><Input type="date" value={form.dateOfBirth} onChange={e => set("dateOfBirth", e.target.value)} /></FieldGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <FieldGroup label="Nationality" required><CountrySelect value={form.nationality} onChange={v => set("nationality", v)} placeholder="Select nationality…" /></FieldGroup>
                    <FieldGroup label="Country of Residence" required><CountrySelect value={form.countryOfResidence} onChange={v => set("countryOfResidence", v)} placeholder="Select country…" /></FieldGroup>
                  </div>
                  <FieldGroup label="Tax ID / TIN (optional)">
                    <Input value={form.taxId} onChange={e => set("taxId", e.target.value)} placeholder="Your tax identification number" />
                  </FieldGroup>
                  <div className="flex justify-end">
                    <Button onClick={() => setStep(2)} disabled={!form.firstName || !form.lastName || !form.dateOfBirth || !form.nationality || !form.countryOfResidence}>
                      Next: Address <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Address */}
            {step === 2 && (
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />Residential Address</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FieldGroup label="Address Line 1" required><Input value={form.addressLine1} onChange={e => set("addressLine1", e.target.value)} placeholder="Street address, P.O. box" /></FieldGroup>
                  <FieldGroup label="Address Line 2"><Input value={form.addressLine2} onChange={e => set("addressLine2", e.target.value)} placeholder="Apartment, suite, unit, building" /></FieldGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <FieldGroup label="City" required><Input value={form.city} onChange={e => set("city", e.target.value)} placeholder="City" /></FieldGroup>
                    <FieldGroup label="State / Province"><Input value={form.state} onChange={e => set("state", e.target.value)} placeholder="State or province" /></FieldGroup>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FieldGroup label="Postal Code"><Input value={form.postalCode} onChange={e => set("postalCode", e.target.value)} placeholder="ZIP / Postal code" /></FieldGroup>
                    <FieldGroup label="Country" required><CountrySelect value={form.country} onChange={v => set("country", v)} /></FieldGroup>
                  </div>
                  <FieldGroup label="Proof of Address Document" required>
                    <select value={form.addressDocType} onChange={e => set("addressDocType", e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="utility_bill">Utility Bill (gas, electric, water)</option>
                      <option value="bank_statement">Bank Statement</option>
                      <option value="government_letter">Government Letter</option>
                    </select>
                  </FieldGroup>
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">Upload Proof of Address</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG, or PDF · Max 10MB · Issued within 3 months</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Upload className="w-3 h-3 mr-1" /> Choose File
                    </Button>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setStep(1)}><ChevronLeft className="w-4 h-4 mr-1" />Back</Button>
                    <Button onClick={() => setStep(3)} disabled={!form.addressLine1 || !form.city || !form.country}>
                      Next: Identity Doc <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Identity Document */}
            {step === 3 && (
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />Identity Document</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FieldGroup label="Document Type" required>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { value: "passport", label: "Passport" },
                        { value: "national_id", label: "National ID" },
                        { value: "drivers_license", label: "Driver's License" },
                        { value: "residence_permit", label: "Residence Permit" },
                      ].map(d => (
                        <button key={d.value} onClick={() => set("docType", d.value)}
                          className={`p-2 rounded-lg border text-xs font-medium transition-all ${form.docType === d.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </FieldGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <FieldGroup label="Document Number" required><Input value={form.docNumber} onChange={e => set("docNumber", e.target.value)} placeholder="Document number" /></FieldGroup>
                    <FieldGroup label="Issuing Country" required><CountrySelect value={form.docIssuingCountry} onChange={v => set("docIssuingCountry", v)} /></FieldGroup>
                  </div>
                  <FieldGroup label="Expiry Date" required><Input type="date" value={form.docExpiryDate} onChange={e => set("docExpiryDate", e.target.value)} /></FieldGroup>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Front of Document", desc: "Clear photo of the front" },
                      { label: "Back of Document", desc: "Clear photo of the back" },
                      { label: "Selfie with Document", desc: "Hold next to your face" },
                    ].map(d => (
                      <div key={d.label} className="border-2 border-dashed border-border rounded-xl p-4 text-center space-y-1.5">
                        <Upload className="w-6 h-6 mx-auto text-muted-foreground" />
                        <p className="text-xs font-medium text-foreground">{d.label}</p>
                        <p className="text-[11px] text-muted-foreground">{d.desc}</p>
                        <Button variant="outline" size="sm" className="text-xs h-7 mt-1">Upload</Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setStep(2)}><ChevronLeft className="w-4 h-4 mr-1" />Back</Button>
                    <Button onClick={() => setStep(4)} disabled={!form.docNumber || !form.docIssuingCountry || !form.docExpiryDate}>
                      Next: Financial <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Financial */}
            {step === 4 && (
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary" />Financial Profile & Declarations</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FieldGroup label="Source of Funds" required>
                    <select value={form.sourceOfFunds} onChange={e => set("sourceOfFunds", e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">Select source…</option>
                      <option value="employment">Employment / Salary</option>
                      <option value="business">Business Income</option>
                      <option value="investment">Investment Returns</option>
                      <option value="inheritance">Inheritance</option>
                      <option value="savings">Personal Savings</option>
                      <option value="pension">Pension / Retirement</option>
                      <option value="gift">Gift</option>
                      <option value="other">Other</option>
                    </select>
                  </FieldGroup>
                  <FieldGroup label="Employment Status" required>
                    <select value={form.employmentStatus} onChange={e => set("employmentStatus", e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">Select status…</option>
                      <option value="employed">Employed (full-time)</option>
                      <option value="employed_part">Employed (part-time)</option>
                      <option value="self_employed">Self-Employed</option>
                      <option value="business_owner">Business Owner</option>
                      <option value="retired">Retired</option>
                      <option value="student">Student</option>
                      <option value="unemployed">Unemployed</option>
                      <option value="other">Other</option>
                    </select>
                  </FieldGroup>
                  <FieldGroup label="Annual Income (USD equivalent)" required>
                    <select value={form.annualIncome} onChange={e => set("annualIncome", e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">Select range…</option>
                      <option value="under_25k">Under $25,000</option>
                      <option value="25k_50k">$25,000 – $50,000</option>
                      <option value="50k_100k">$50,000 – $100,000</option>
                      <option value="100k_250k">$100,000 – $250,000</option>
                      <option value="250k_500k">$250,000 – $500,000</option>
                      <option value="500k_1m">$500,000 – $1,000,000</option>
                      <option value="over_1m">Over $1,000,000</option>
                    </select>
                  </FieldGroup>

                  <div className="space-y-3 pt-2 border-t border-border">
                    <p className="text-sm font-semibold text-foreground">Regulatory Declarations</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
                        <div>
                          <p className="text-sm font-medium text-foreground">Politically Exposed Person (PEP)</p>
                          <p className="text-xs text-muted-foreground">Are you or a family member a current or former government official, head of state, or senior political figure?</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button onClick={() => set("isPep", "yes")} className={`px-3 py-1 text-xs rounded-md border font-medium ${form.isPep === "yes" ? "bg-destructive text-white border-destructive" : "border-border text-muted-foreground hover:border-primary/50"}`}>Yes</button>
                          <button onClick={() => set("isPep", "no")} className={`px-3 py-1 text-xs rounded-md border font-medium ${form.isPep === "no" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>No</button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
                        <div>
                          <p className="text-sm font-medium text-foreground">US Person (FATCA)</p>
                          <p className="text-xs text-muted-foreground">Are you a US citizen, US resident alien, or do you have a US tax obligation?</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button onClick={() => set("isUsCitizen", "yes")} className={`px-3 py-1 text-xs rounded-md border font-medium ${form.isUsCitizen === "yes" ? "bg-amber-500 text-white border-amber-500" : "border-border text-muted-foreground hover:border-primary/50"}`}>Yes</button>
                          <button onClick={() => set("isUsCitizen", "no")} className={`px-3 py-1 text-xs rounded-md border font-medium ${form.isUsCitizen === "no" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>No</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setStep(3)}><ChevronLeft className="w-4 h-4 mr-1" />Back</Button>
                    <Button onClick={() => setStep(5)} disabled={!form.sourceOfFunds || !form.employmentStatus || !form.annualIncome}>
                      Review & Submit <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />Review & Submit</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: "Personal", items: [["Name", `${form.firstName} ${form.middleName} ${form.lastName}`.trim()], ["Date of Birth", form.dateOfBirth], ["Nationality", form.nationality], ["Country of Residence", form.countryOfResidence]] },
                    { title: "Address", items: [["Address", `${form.addressLine1}${form.addressLine2 ? `, ${form.addressLine2}` : ""}`], ["City", form.city], ["Country", form.country], ["Proof", form.addressDocType.replace("_", " ")]] },
                    { title: "Identity Document", items: [["Type", form.docType.replace("_", " ")], ["Number", form.docNumber], ["Issuing Country", form.docIssuingCountry], ["Expiry", form.docExpiryDate]] },
                    { title: "Financial", items: [["Source of Funds", form.sourceOfFunds.replace("_", " ")], ["Employment", form.employmentStatus.replace("_", " ")], ["Annual Income", form.annualIncome.replace(/_/g, " ")], ["PEP", form.isPep.toUpperCase()], ["US Person", form.isUsCitizen.toUpperCase()]] },
                  ].map(section => (
                    <div key={section.title} className="rounded-lg border border-border overflow-hidden">
                      <div className="bg-muted/40 px-4 py-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground uppercase tracking-wide">{section.title}</span>
                        <button onClick={() => setStep(section.title === "Personal" ? 1 : section.title === "Address" ? 2 : section.title === "Identity Document" ? 3 : 4)} className="text-xs text-primary hover:underline">Edit</button>
                      </div>
                      <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                        {section.items.map(([k, v]) => (
                          <div key={k} className="flex justify-between col-span-1">
                            <span className="text-xs text-muted-foreground">{k}</span>
                            <span className="text-xs font-medium text-foreground capitalize">{v || "—"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground leading-relaxed">
                    By submitting, I confirm that all information provided is accurate and complete. I consent to the processing of my personal data for identity verification purposes under applicable data protection laws, including GDPR. I understand that providing false information may result in account termination and legal action.
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setStep(4)}><ChevronLeft className="w-4 h-4 mr-1" />Back</Button>
                    <Button onClick={handleSubmit} disabled={submitting} className="min-w-[140px]">
                      {submitting ? (
                        <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />Submitting…</>
                      ) : (
                        <><Shield className="w-4 h-4 mr-1" />Submit Verification</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Approved state */}
        {status === "approved" && (
          <Card>
            <CardContent className="py-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                <BadgeCheck className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Fully Verified</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">Your identity has been verified. You have full access to live trading, withdrawals, and all platform features.</p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {["Live Trading", "Withdrawals", "Copy Trading", "High Leverage"].map(f => (
                  <span key={f} className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />{f}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
