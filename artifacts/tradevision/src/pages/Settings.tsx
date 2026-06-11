import React, { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Settings as SettingsIcon, User, Shield, Sliders, TrendingUp, Bell,
  Key, Link as LinkIcon, Database, CreditCard, Copy, Trash2, Plus,
  Eye, EyeOff, CheckCircle2, AlertTriangle, ChevronRight, Wifi, WifiOff,
} from "lucide-react";

type Section =
  | "General"
  | "Account & Profile"
  | "Security"
  | "Preferences"
  | "Trading"
  | "Notifications"
  | "API Management"
  | "Connections"
  | "Data & Feeds"
  | "Billing & Plan";

const SECTIONS: { name: Section; icon: React.ElementType }[] = [
  { name: "General", icon: SettingsIcon },
  { name: "Account & Profile", icon: User },
  { name: "Security", icon: Shield },
  { name: "Preferences", icon: Sliders },
  { name: "Trading", icon: TrendingUp },
  { name: "Notifications", icon: Bell },
  { name: "API Management", icon: Key },
  { name: "Connections", icon: LinkIcon },
  { name: "Data & Feeds", icon: Database },
  { name: "Billing & Plan", icon: CreditCard },
];

function SectionLabel({ label }: { label: string }) {
  return <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{label}</p>;
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border/40 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SelectField({ value, options }: { value: string; options: string[] }) {
  return (
    <select defaultValue={value} className="bg-accent border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[160px]">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ─── Section Content Components ───────────────────────────────────────────────

function GeneralSection({ onSave }: { onSave: () => void }) {
  const [theme, setTheme] = useState<"Light" | "Dark" | "System">("Dark");
  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader className="py-4 border-b border-border/50"><CardTitle className="text-sm">General Settings</CardTitle></CardHeader>
        <CardContent className="p-5 space-y-4">
          <SectionLabel label="Regional" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Platform Timezone</label>
              <SelectField value="UTC+0 London, Dublin" options={["UTC-5 New York", "UTC+0 London, Dublin", "UTC+1 Paris, Berlin", "UTC+8 Singapore", "UTC+9 Tokyo"]} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Date Format</label>
              <SelectField value="YYYY-MM-DD" options={["YYYY-MM-DD", "MM/DD/YYYY", "DD/MM/YYYY"]} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Number Format</label>
              <SelectField value="1,234.56 (Default)" options={["1,234.56 (Default)", "1.234,56 (EU)", "1 234.56 (Space)"]} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Language</label>
              <SelectField value="English" options={["English", "Spanish", "French", "German", "Japanese", "Chinese"]} />
            </div>
          </div>

          <div className="pt-4 border-t border-border/50 space-y-3">
            <SectionLabel label="Appearance" />
            <div className="flex gap-3">
              {(["Light", "Dark", "System"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  data-testid={`button-theme-${t.toLowerCase()}`}
                  className={`flex-1 border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${theme === t ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                >
                  <div className={`w-10 h-10 rounded-full border ${t === "Light" ? "bg-white border-gray-200" : t === "Dark" ? "bg-[#0B1020] border-gray-800" : "bg-gradient-to-r from-white to-[#0B1020] border-border"}`} />
                  <span className={`text-sm font-medium ${theme === t ? "text-foreground" : "text-muted-foreground"}`}>{t}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border/50 space-y-3">
            <SectionLabel label="Dashboard" />
            <SettingRow label="Auto Refresh" description="Automatically refresh dashboard data every 30s">
              <Switch defaultChecked data-testid="switch-auto-refresh" />
            </SettingRow>
            <SettingRow label="Compact Mode" description="Show more data with reduced padding">
              <Switch data-testid="switch-compact-mode" />
            </SettingRow>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={onSave} className="bg-primary hover:bg-primary/90" data-testid="button-save-general">Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AccountProfileSection({ onSave }: { onSave: () => void }) {
  return (
    <div className="space-y-5">
      <Card className="border-border bg-card">
        <CardHeader className="py-4 border-b border-border/50"><CardTitle className="text-sm">Profile Information</CardTitle></CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-border/50">
            <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" className="w-16 h-16 rounded-full object-cover" alt="avatar" />
            <div>
              <Button variant="outline" size="sm" data-testid="button-change-avatar">Change Photo</Button>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 2MB</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full Name</label>
              <Input defaultValue="John Trader" data-testid="input-full-name" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Username</label>
              <Input defaultValue="johntrader_pro" data-testid="input-username" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email Address</label>
              <div className="relative">
                <Input defaultValue="john@tradevision.com" data-testid="input-email" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-success font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Verified</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone Number</label>
              <Input defaultValue="+1 (555) 123-4567" data-testid="input-phone" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Country</label>
              <SelectField value="United States" options={["United States", "United Kingdom", "Germany", "Singapore", "Australia"]} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Preferred Currency</label>
              <SelectField value="USD ($)" options={["USD ($)", "EUR (€)", "GBP (£)", "JPY (¥)", "SGD (S$)"]} />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={onSave} className="bg-primary hover:bg-primary/90" data-testid="button-save-profile">Save Profile</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SecuritySection({ onSave }: { onSave: () => void }) {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  return (
    <div className="space-y-5">
      <Card className="border-border bg-card">
        <CardHeader className="py-4 border-b border-border/50"><CardTitle className="text-sm">Change Password</CardTitle></CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Current Password</label>
            <div className="relative">
              <Input type={showOld ? "text" : "password"} placeholder="Enter current password" data-testid="input-current-password" />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowOld(!showOld)}>
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">New Password</label>
            <div className="relative">
              <Input type={showNew ? "text" : "password"} placeholder="Enter new password" data-testid="input-new-password" />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowNew(!showNew)}>
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Confirm New Password</label>
            <Input type="password" placeholder="Confirm new password" data-testid="input-confirm-password" />
          </div>
          <Button onClick={onSave} className="bg-primary hover:bg-primary/90" data-testid="button-change-password">Update Password</Button>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="py-4 border-b border-border/50"><CardTitle className="text-sm">Two-Factor Authentication (2FA)</CardTitle></CardHeader>
        <CardContent className="p-5 space-y-4">
          <SettingRow label="Authenticator App" description="Google Authenticator, Authy or similar">
            <div className="flex items-center gap-2">
              <Badge className="bg-success/20 text-success border-success/30">Enabled</Badge>
              <Button variant="outline" size="sm" data-testid="button-manage-2fa">Manage</Button>
            </div>
          </SettingRow>
          <SettingRow label="SMS Authentication" description="Receive codes via text message">
            <Switch data-testid="switch-sms-2fa" />
          </SettingRow>
          <SettingRow label="Login Notifications" description="Email alert on every new login">
            <Switch defaultChecked data-testid="switch-login-notif" />
          </SettingRow>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="py-4 border-b border-border/50"><CardTitle className="text-sm">Active Sessions</CardTitle></CardHeader>
        <CardContent className="p-5 space-y-3">
          {[
            { device: "Chrome on Windows 11", location: "New York, US", time: "Current session", current: true },
            { device: "Safari on iPhone 15", location: "New York, US", time: "2 hours ago", current: false },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
              <div>
                <p className="text-sm font-medium">{s.device} {s.current && <Badge className="ml-2 bg-success/20 text-success border-success/30 text-[10px]">Current</Badge>}</p>
                <p className="text-xs text-muted-foreground">{s.location} · {s.time}</p>
              </div>
              {!s.current && <Button variant="outline" size="sm" className="text-destructive border-destructive/50 hover:bg-destructive hover:text-white" data-testid={`button-revoke-session-${i}`}>Revoke</Button>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function PreferencesSection({ onSave }: { onSave: () => void }) {
  return (
    <div className="space-y-5">
      <Card className="border-border bg-card">
        <CardHeader className="py-4 border-b border-border/50"><CardTitle className="text-sm">Display Preferences</CardTitle></CardHeader>
        <CardContent className="p-5 space-y-1">
          <SettingRow label="Show P&L in Percentage" description="Display profit/loss as percentage instead of absolute">
            <Switch defaultChecked data-testid="switch-pnl-percent" />
          </SettingRow>
          <SettingRow label="Show Unrealized P&L" description="Include open position P&L in totals">
            <Switch defaultChecked data-testid="switch-unrealized-pnl" />
          </SettingRow>
          <SettingRow label="Chart Candlestick Colors" description="Default color scheme for candles">
            <SelectField value="Green/Red" options={["Green/Red", "Blue/Orange", "Monochrome"]} />
          </SettingRow>
          <SettingRow label="Default Chart Type" description="Chart type used on strategy and portfolio pages">
            <SelectField value="Area" options={["Area", "Candlestick", "Line", "Bar"]} />
          </SettingRow>
          <SettingRow label="Data Density" description="Amount of information shown per screen">
            <SelectField value="Standard" options={["Compact", "Standard", "Comfortable"]} />
          </SettingRow>
        </CardContent>
      </Card>
      <Card className="border-border bg-card">
        <CardHeader className="py-4 border-b border-border/50"><CardTitle className="text-sm">Sound & Alerts</CardTitle></CardHeader>
        <CardContent className="p-5 space-y-1">
          <SettingRow label="Sound Effects" description="Play sounds for trade executions and alerts">
            <Switch data-testid="switch-sound-effects" />
          </SettingRow>
          <SettingRow label="Alert Volume" description="Volume level for audio alerts">
            <SelectField value="Medium" options={["Low", "Medium", "High"]} />
          </SettingRow>
          <SettingRow label="Desktop Notifications" description="Show browser push notifications">
            <Switch defaultChecked data-testid="switch-desktop-notif" />
          </SettingRow>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={onSave} className="bg-primary hover:bg-primary/90" data-testid="button-save-prefs">Save Preferences</Button>
      </div>
    </div>
  );
}

function TradingSection({ onSave }: { onSave: () => void }) {
  return (
    <div className="space-y-5">
      <Card className="border-border bg-card">
        <CardHeader className="py-4 border-b border-border/50"><CardTitle className="text-sm">Default Trading Parameters</CardTitle></CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Default Lot Size</label>
              <Input defaultValue="0.10" type="number" data-testid="input-lot-size" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Default Leverage</label>
              <SelectField value="1:100" options={["1:10", "1:50", "1:100", "1:200", "1:500"]} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Default Stop Loss (Pips)</label>
              <Input defaultValue="25" type="number" data-testid="input-default-sl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Default Take Profit (Pips)</label>
              <Input defaultValue="50" type="number" data-testid="input-default-tp" />
            </div>
          </div>
          <SettingRow label="Confirm Before Placing Orders" description="Show confirmation dialog before each order">
            <Switch defaultChecked data-testid="switch-confirm-orders" />
          </SettingRow>
          <SettingRow label="Allow Hedging" description="Allow simultaneous buy and sell on same instrument">
            <Switch data-testid="switch-allow-hedging" />
          </SettingRow>
          <SettingRow label="Auto-close on Margin Call" description="Automatically close positions on margin call">
            <Switch defaultChecked data-testid="switch-margin-call" />
          </SettingRow>
        </CardContent>
      </Card>
      <Card className="border-border bg-card">
        <CardHeader className="py-4 border-b border-border/50"><CardTitle className="text-sm">Risk Defaults</CardTitle></CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Max Risk Per Trade (%)</label>
              <Input defaultValue="2" type="number" data-testid="input-max-risk" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Daily Loss Limit (%)</label>
              <Input defaultValue="5" type="number" data-testid="input-daily-loss" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Max Open Positions</label>
              <Input defaultValue="10" type="number" data-testid="input-max-positions" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Max Daily Trades</label>
              <Input defaultValue="50" type="number" data-testid="input-max-trades" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={onSave} className="bg-primary hover:bg-primary/90" data-testid="button-save-trading">Save Trading Settings</Button>
      </div>
    </div>
  );
}

function NotificationsSection({ onSave }: { onSave: () => void }) {
  const prefs = [
    { label: "Risk Alerts", description: "High drawdown, exposure and margin warnings", key: "risk" },
    { label: "Bot Updates", description: "Bot started, stopped, paused and error events", key: "bot" },
    { label: "Trade Confirmations", description: "Executed, closed and cancelled orders", key: "trade" },
    { label: "Price Alerts", description: "Symbol price triggers you have set", key: "price" },
    { label: "Marketplace Updates", description: "New strategies, subscriptions and updates", key: "marketplace" },
    { label: "Copy Trading", description: "Follower activity and copied trade events", key: "copy" },
    { label: "Account & Billing", description: "Deposits, withdrawals and subscription changes", key: "account" },
    { label: "Security Alerts", description: "Login attempts and API key usage", key: "security" },
    { label: "System Maintenance", description: "Planned downtime and platform updates", key: "system" },
  ];
  return (
    <div className="space-y-5">
      <Card className="border-border bg-card">
        <CardHeader className="py-4 border-b border-border/50"><CardTitle className="text-sm">Notification Preferences</CardTitle></CardHeader>
        <CardContent className="p-5 space-y-1">
          {prefs.map(p => (
            <SettingRow key={p.key} label={p.label} description={p.description}>
              <Switch defaultChecked={["risk", "trade", "security", "bot"].includes(p.key)} data-testid={`switch-notif-${p.key}`} />
            </SettingRow>
          ))}
        </CardContent>
      </Card>
      <Card className="border-border bg-card">
        <CardHeader className="py-4 border-b border-border/50"><CardTitle className="text-sm">Notification Channels</CardTitle></CardHeader>
        <CardContent className="p-5 space-y-1">
          <SettingRow label="In-App Notifications" description="Show alerts inside the platform">
            <Switch defaultChecked data-testid="switch-channel-inapp" />
          </SettingRow>
          <SettingRow label="Email Notifications" description="Send alerts to john@tradevision.com">
            <Switch defaultChecked data-testid="switch-channel-email" />
          </SettingRow>
          <SettingRow label="Push Notifications" description="Browser push notifications">
            <Switch defaultChecked data-testid="switch-channel-push" />
          </SettingRow>
          <SettingRow label="SMS Notifications" description="Text message alerts for critical events only">
            <Switch data-testid="switch-channel-sms" />
          </SettingRow>
          <SettingRow label="Telegram Bot" description="Receive notifications via Telegram">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Not connected</span>
              <Button variant="outline" size="sm" data-testid="button-connect-telegram">Connect</Button>
            </div>
          </SettingRow>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={onSave} className="bg-primary hover:bg-primary/90" data-testid="button-save-notifications">Save Notification Settings</Button>
      </div>
    </div>
  );
}

function APIManagementSection() {
  const [keys] = useState([
    { name: "Trading Bot Key", prefix: "tv_live_xxxx...7f3a", created: "Jan 5, 2024", lastUsed: "Today", permissions: ["Read", "Trade"], active: true },
    { name: "Dashboard Read Key", prefix: "tv_live_xxxx...2c9b", created: "Feb 12, 2024", lastUsed: "2 hours ago", permissions: ["Read"], active: true },
    { name: "Analytics Key", prefix: "tv_live_xxxx...8e1d", created: "Mar 1, 2024", lastUsed: "3 days ago", permissions: ["Read"], active: false },
  ]);
  return (
    <div className="space-y-5">
      <Card className="border-border bg-card">
        <CardHeader className="py-4 border-b border-border/50 flex-row items-center justify-between">
          <CardTitle className="text-sm">API Keys</CardTitle>
          <Button size="sm" className="bg-primary hover:bg-primary/90 h-8" data-testid="button-create-api-key">
            <Plus className="w-3.5 h-3.5 mr-1.5" />Create New Key
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {keys.map((k, i) => (
            <div key={i} className="p-4 border-b border-border/40 last:border-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{k.name}</p>
                    <Badge className={k.active ? "bg-success/20 text-success border-success/30 text-[10px]" : "bg-muted text-muted-foreground text-[10px]"}>
                      {k.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground mb-2">{k.prefix}</p>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>Created {k.created}</span>
                    <span>·</span>
                    <span>Last used {k.lastUsed}</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {k.permissions.map(p => (
                      <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0" data-testid={`button-copy-key-${i}`}><Copy className="w-3 h-3" /></Button>
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-destructive border-destructive/50 hover:bg-destructive hover:text-white" data-testid={`button-delete-key-${i}`}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="border-border bg-card">
        <CardHeader className="py-4 border-b border-border/50"><CardTitle className="text-sm">API Documentation</CardTitle></CardHeader>
        <CardContent className="p-5 space-y-3">
          <p className="text-sm text-muted-foreground">Access our REST API to build custom integrations, automated workflows, and third-party connections.</p>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" data-testid="button-view-api-docs">View API Docs</Button>
            <Button variant="outline" size="sm" data-testid="button-api-playground">API Playground</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ConnectionsSection() {
  const connections = [
    { name: "MT5 IC Markets", type: "MT5 Broker", status: "Connected", account: "#12345678", equity: "$82,540" },
    { name: "MT5 Exness", type: "MT5 Broker", status: "Connected", account: "#87654321", equity: "$65,430" },
    { name: "MT4 Deriv", type: "MT4 Broker", status: "Connected", account: "#11223344", equity: "$34,680" },
    { name: "Binance (Spot)", type: "Crypto Exchange", status: "Connected", account: "#44332211", equity: "$24,970" },
    { name: "Interactive Brokers", type: "Stock Broker", status: "Connected", account: "#99887766", equity: "$8,301" },
    { name: "Bybit", type: "Crypto Exchange", status: "Not Connected", account: "—", equity: "—" },
  ];
  return (
    <div className="space-y-5">
      <Card className="border-border bg-card">
        <CardHeader className="py-4 border-b border-border/50 flex-row items-center justify-between">
          <CardTitle className="text-sm">Broker & Exchange Connections</CardTitle>
          <Button size="sm" className="bg-primary hover:bg-primary/90 h-8" data-testid="button-add-connection">
            <Plus className="w-3.5 h-3.5 mr-1.5" />Add Connection
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {connections.map((c, i) => (
            <div key={i} className="flex items-center justify-between gap-4 p-4 border-b border-border/40 last:border-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${c.status === "Connected" ? "bg-success" : "bg-muted-foreground"}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.type} · {c.account}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {c.equity !== "—" && <span className="text-sm font-medium hidden sm:block">{c.equity}</span>}
                {c.status === "Connected" ? (
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" className="h-7 text-xs" data-testid={`button-manage-conn-${i}`}>Manage</Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs text-destructive border-destructive/50 hover:bg-destructive hover:text-white" data-testid={`button-disconnect-${i}`}>Disconnect</Button>
                  </div>
                ) : (
                  <Button size="sm" className="h-7 text-xs bg-primary hover:bg-primary/90" data-testid={`button-connect-${i}`}>
                    <Wifi className="w-3 h-3 mr-1" />Connect
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function DataFeedsSection({ onSave }: { onSave: () => void }) {
  return (
    <div className="space-y-5">
      <Card className="border-border bg-card">
        <CardHeader className="py-4 border-b border-border/50"><CardTitle className="text-sm">Market Data Settings</CardTitle></CardHeader>
        <CardContent className="p-5 space-y-4">
          <SettingRow label="Data Update Frequency" description="How often market data is refreshed">
            <SelectField value="Real-time" options={["Real-time", "1 Second", "5 Seconds", "10 Seconds", "30 Seconds"]} />
          </SettingRow>
          <SettingRow label="Cache Market Data" description="Cache data locally for faster loads">
            <Switch defaultChecked data-testid="switch-cache-data" />
          </SettingRow>
          <SettingRow label="Historical Data Depth" description="Years of historical data to store locally">
            <SelectField value="5 Years" options={["1 Year", "2 Years", "5 Years", "10 Years"]} />
          </SettingRow>
          <SettingRow label="Tick Data" description="Store every tick for ultra-precise backtests">
            <Switch data-testid="switch-tick-data" />
          </SettingRow>
          <div className="pt-4 flex justify-between items-center border-t border-border/50">
            <div>
              <p className="text-sm font-medium">Clear Local Cache</p>
              <p className="text-xs text-muted-foreground">Remove all cached market data (243 MB)</p>
            </div>
            <Button variant="outline" size="sm" className="text-destructive border-destructive/50 hover:bg-destructive hover:text-white" data-testid="button-clear-cache">Clear Cache</Button>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border bg-card">
        <CardHeader className="py-4 border-b border-border/50"><CardTitle className="text-sm">Data Providers</CardTitle></CardHeader>
        <CardContent className="p-5 space-y-1">
          {[
            { name: "Forex (MT5 Feed)", status: "Active", latency: "12ms", quality: "99.9%" },
            { name: "Crypto (Binance Feed)", status: "Active", latency: "8ms", quality: "99.7%" },
            { name: "Stocks (IB Feed)", status: "Active", latency: "18ms", quality: "99.5%" },
          ].map((d, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                <p className="text-sm font-medium">{d.name}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Latency: {d.latency}</span>
                <span>Quality: <span className="text-success font-medium">{d.quality}</span></span>
                <Badge className="bg-success/20 text-success border-success/30 text-[10px]">{d.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={onSave} className="bg-primary hover:bg-primary/90" data-testid="button-save-data">Save Data Settings</Button>
      </div>
    </div>
  );
}

function BillingSection() {
  const features = ["Up to 20 Active Bots", "All AI Strategies", "Copy Trading", "Unlimited Backtests", "API Access", "Priority Support", "Advanced Risk Center"];
  return (
    <div className="space-y-5">
      <Card className="border-border bg-card">
        <CardHeader className="py-4 border-b border-border/50"><CardTitle className="text-sm">Current Plan</CardTitle></CardHeader>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold">Pro Trader</h3>
                <Badge className="bg-primary/20 text-primary border-primary/30">Current Plan</Badge>
              </div>
              <p className="text-3xl font-bold text-foreground mt-1">$99<span className="text-base font-normal text-muted-foreground">/month</span></p>
              <p className="text-xs text-muted-foreground mt-1">Renewal on June 14, 2026</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90" data-testid="button-upgrade-plan">Upgrade Plan</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {features.map(f => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="py-4 border-b border-border/50"><CardTitle className="text-sm">Payment Method</CardTitle></CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between p-3 bg-accent rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 bg-gradient-to-r from-blue-600 to-blue-400 rounded text-white text-[10px] flex items-center justify-center font-bold">VISA</div>
              <div>
                <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/2027</p>
              </div>
            </div>
            <Button variant="outline" size="sm" data-testid="button-change-card">Change</Button>
          </div>
          <Button variant="outline" size="sm" data-testid="button-add-payment"><Plus className="w-3.5 h-3.5 mr-1.5" />Add Payment Method</Button>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="py-4 border-b border-border/50"><CardTitle className="text-sm">Billing History</CardTitle></CardHeader>
        <CardContent className="p-0">
          {[
            { date: "May 14, 2026", amount: "$99.00", status: "Paid", invoice: "#INV-2026-05" },
            { date: "Apr 14, 2026", amount: "$99.00", status: "Paid", invoice: "#INV-2026-04" },
            { date: "Mar 14, 2026", amount: "$99.00", status: "Paid", invoice: "#INV-2026-03" },
          ].map((b, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3 border-b border-border/40 last:border-0">
              <div>
                <p className="text-sm font-medium">{b.date}</p>
                <p className="text-xs text-muted-foreground">{b.invoice}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{b.amount}</span>
                <Badge className="bg-success/20 text-success border-success/30 text-[10px]">{b.status}</Badge>
                <Button variant="ghost" size="sm" className="h-6 text-xs" data-testid={`button-download-invoice-${i}`}>Download</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Settings Component ──────────────────────────────────────────────────

export default function Settings() {
  const [activeSection, setActiveSection] = useState<Section>("General");
  const { toast } = useToast();

  const handleSave = () => {
    toast({ title: "Settings saved", description: "Your changes have been applied." });
  };

  const renderSection = () => {
    switch (activeSection) {
      case "General": return <GeneralSection onSave={handleSave} />;
      case "Account & Profile": return <AccountProfileSection onSave={handleSave} />;
      case "Security": return <SecuritySection onSave={handleSave} />;
      case "Preferences": return <PreferencesSection onSave={handleSave} />;
      case "Trading": return <TradingSection onSave={handleSave} />;
      case "Notifications": return <NotificationsSection onSave={handleSave} />;
      case "API Management": return <APIManagementSection />;
      case "Connections": return <ConnectionsSection />;
      case "Data & Feeds": return <DataFeedsSection onSave={handleSave} />;
      case "Billing & Plan": return <BillingSection />;
    }
  };

  return (
    <Layout title="Settings" subtitle="Manage your platform preferences and connections">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full">

        {/* Left Nav */}
        <div className="lg:w-56 shrink-0">
          {/* Mobile: 2×5 icon grid */}
          <div className="lg:hidden grid grid-cols-5 gap-1.5">
            {SECTIONS.map(({ name, icon: Icon }) => (
              <button
                key={name}
                onClick={() => setActiveSection(name)}
                data-testid={`tab-settings-${name.toLowerCase().replace(/[\s&]+/g, "-")}`}
                title={name}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border transition-colors ${activeSection === name ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-primary/50 bg-card"}`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[9px] font-medium leading-tight text-center line-clamp-1">
                  {name.replace(" & ", "/").replace(" Management", "").replace(" & Feeds", "")}
                </span>
              </button>
            ))}
          </div>
          {/* Mobile: active section label */}
          <div className="lg:hidden mt-2 px-1">
            <p className="text-xs text-muted-foreground">
              <span className="text-foreground font-semibold">{activeSection}</span>
            </p>
          </div>

          {/* Desktop: vertical list */}
          <div className="hidden lg:flex flex-col gap-0.5">
            {SECTIONS.map(({ name, icon: Icon }) => (
              <button
                key={name}
                onClick={() => setActiveSection(name)}
                data-testid={`nav-settings-${name.toLowerCase().replace(/[\s&]+/g, "-")}`}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium text-left transition-colors w-full ${activeSection === name ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col lg:flex-row gap-4 lg:gap-6">
          <div className="flex-1 min-w-0">{renderSection()}</div>

          {/* Right sidebar — security overview + danger zone, desktop only */}
          <div className="hidden lg:flex lg:w-72 shrink-0 flex-col gap-4">
            <Card className="border-border bg-card">
              <CardHeader className="py-3 border-b border-border/50"><CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Security Overview</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">2FA Status</span>
                  <span className="text-success font-medium flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Enabled</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Password</span>
                  <span className="font-medium">Changed 30 days ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">API Keys</span>
                  <span className="font-medium">3 Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Active Sessions</span>
                  <span className="font-medium">2 Devices</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-1"
                  onClick={() => setActiveSection("Security")}
                  data-testid="button-go-security"
                >
                  Manage Security <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader className="py-3 border-b border-destructive/20"><CardTitle className="text-xs text-destructive uppercase tracking-wider">Danger Zone</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-destructive border-destructive/50 hover:bg-destructive hover:text-white text-xs"
                  data-testid="button-disconnect-all-sessions"
                  onClick={() => toast({ title: "Sessions disconnected", description: "All other sessions have been terminated." })}
                >
                  Disconnect All Sessions
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-destructive border-destructive/50 hover:bg-destructive hover:text-white text-xs"
                  data-testid="button-delete-account"
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
