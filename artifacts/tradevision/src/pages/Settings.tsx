import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const sections = ["General", "Account & Profile", "Security", "Preferences", "Trading", "Notifications", "API Management", "Connections", "Data & Feeds", "Billing & Plan"];

  return (
    <Layout title="Settings" subtitle="Manage your platform preferences and connections">
      <div className="flex gap-6 h-full">
        
        {/* Left Nav */}
        <div className="w-64 shrink-0 flex flex-col gap-1">
          {sections.map((s, i) => (
            <div key={s} className={`px-4 py-2.5 text-sm font-medium rounded-md cursor-pointer ${i === 0 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}>
              {s}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">
          <Card className="border-border bg-card">
            <CardHeader className="py-4 border-b border-border/50">
              <CardTitle className="text-base">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Platform Timezone</label>
                  <select className="w-full bg-accent border border-border rounded-md p-2.5 text-sm">
                    <option>UTC+0 London, Dublin</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Format</label>
                  <select className="w-full bg-accent border border-border rounded-md p-2.5 text-sm">
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Number Format</label>
                  <select className="w-full bg-accent border border-border rounded-md p-2.5 text-sm">
                    <option>1,234.56 (Default)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <select className="w-full bg-accent border border-border rounded-md p-2.5 text-sm">
                    <option>English</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-border/50">
                <h3 className="text-sm font-semibold mb-4">Appearance</h3>
                <div className="flex gap-4">
                  <div className="flex-1 border border-border rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary">
                    <div className="w-12 h-12 bg-white rounded-full border border-gray-200"></div>
                    <span className="text-sm font-medium text-muted-foreground">Light</span>
                  </div>
                  <div className="flex-1 border-2 border-primary rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-accent/20">
                    <div className="w-12 h-12 bg-[#0B1020] rounded-full border border-gray-800"></div>
                    <span className="text-sm font-medium">Dark</span>
                  </div>
                  <div className="flex-1 border border-border rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary">
                    <div className="w-12 h-12 bg-gradient-to-r from-white to-[#0B1020] rounded-full border border-border"></div>
                    <span className="text-sm font-medium text-muted-foreground">System</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 shrink-0 flex flex-col gap-6">
          <Card className="border-border bg-card">
            <CardHeader className="py-4 border-b border-border/50">
              <CardTitle className="text-sm">Security Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-sm">
               <div className="flex justify-between items-center">
                 <span className="text-muted-foreground">2FA Status</span>
                 <span className="text-success font-medium">Enabled</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-muted-foreground">Password</span>
                 <span className="font-medium">Changed 30 days ago</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-muted-foreground">API Keys</span>
                 <span className="font-medium">3 Active</span>
               </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader className="py-4 border-b border-destructive/20">
              <CardTitle className="text-sm text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
               <Button variant="outline" className="w-full text-destructive border-destructive hover:bg-destructive hover:text-white">Disconnect All Sessions</Button>
               <Button variant="outline" className="w-full text-destructive border-destructive hover:bg-destructive hover:text-white">Delete Account</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}