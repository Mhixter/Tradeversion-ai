import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@workspace/replit-auth-web";
import NotFound from "@/pages/not-found";
import { LoginGate } from "@/pages/LoginGate";
import { useCompanyRole } from "@/hooks/useCompanyRole";
import { RoleGate } from "@/components/RoleGate";


import Dashboard from "@/pages/Dashboard";
import StrategyBuilder from "@/pages/StrategyBuilder";
import BotManager from "@/pages/BotManager";
import AIMarketplace from "@/pages/AIMarketplace";
import Backtesting from "@/pages/Backtesting";
import CopyTrading from "@/pages/CopyTrading";
import Portfolio from "@/pages/Portfolio";
import RiskCenter from "@/pages/RiskCenter";
import Notifications from "@/pages/Notifications";
import Settings from "@/pages/Settings";
import Account from "@/pages/Account";
import CompanyManagement from "@/pages/CompanyManagement";
import KYC from "@/pages/KYC";
import Billing from "@/pages/Billing";
import Landing from "@/pages/Landing";
import Signup from "@/pages/Signup";
import CompanyAdminPortal from "@/pages/CompanyAdminPortal";
import FAQPage from "@/pages/FAQ";
import BlogPage from "@/pages/Blog";
import ContactPage from "@/pages/Contact";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

/* Public marketing routes — no auth required */
const PUBLIC_PATHS = ["/landing", "/faq", "/blog", "/contact", "/signup"];
function isPublicPath(path: string) {
  return PUBLIC_PATHS.some(p => path === p || path.startsWith(p + "/"));
}

/* Billing — owner only */
function BillingGated() {
  const { role, isLoading, inCompany } = useCompanyRole();
  if (!inCompany) return <Billing />;
  return (
    <RoleGate allowed={["owner"]} currentRole={role} isLoading={isLoading} pageName="Billing">
      <Billing />
    </RoleGate>
  );
}

/* Risk Center — owner/admin/manager */
function RiskCenterGated() {
  const { role, isLoading, inCompany } = useCompanyRole();
  if (!inCompany) return <RiskCenter />;
  return (
    <RoleGate allowed={["owner", "admin", "manager"]} currentRole={role} isLoading={isLoading} pageName="Risk Center">
      <RiskCenter />
    </RoleGate>
  );
}

/* Strategy Builder — not viewer */
function StrategyBuilderGated() {
  const { role, isLoading, inCompany } = useCompanyRole();
  if (!inCompany) return <StrategyBuilder />;
  return (
    <RoleGate allowed={["owner", "admin", "manager", "trader"]} currentRole={role} isLoading={isLoading} pageName="Strategy Builder">
      <StrategyBuilder />
    </RoleGate>
  );
}

/* Bot Manager — not viewer */
function BotManagerGated() {
  const { role, isLoading, inCompany } = useCompanyRole();
  if (!inCompany) return <BotManager />;
  return (
    <RoleGate allowed={["owner", "admin", "manager", "trader"]} currentRole={role} isLoading={isLoading} pageName="Bot Manager">
      <BotManager />
    </RoleGate>
  );
}

function AuthedRouter() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/strategy-builder" component={StrategyBuilderGated} />
      <Route path="/bot-manager" component={BotManagerGated} />
      <Route path="/ai-marketplace" component={AIMarketplace} />
      <Route path="/backtesting" component={Backtesting} />
      <Route path="/copy-trading" component={CopyTrading} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/risk-center" component={RiskCenterGated} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/settings" component={Settings} />
      <Route path="/account" component={Account} />
      <Route path="/company" component={CompanyManagement} />
      <Route path="/kyc" component={KYC} />
      <Route path="/billing" component={BillingGated} />
      {/* Public pages also accessible when logged in */}
      <Route path="/landing">{() => <Landing />}</Route>
      <Route path="/faq" component={FAQPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/signup" component={Signup} />
      <Route component={NotFound} />
    </Switch>
  );
}

function PublicRouter({ login }: { login: () => void }) {
  return (
    <Switch>
      <Route path="/landing">{() => <Landing onLogin={login} />}</Route>
      <Route path="/faq" component={FAQPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/signup" component={Signup} />
      {/* Default: show login gate for all protected routes */}
      <Route>{() => <LoginGate onLogin={login} />}</Route>
    </Switch>
  );
}

function AuthedApp() {
  const { isLoading, isAuthenticated, login } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
          <p className="text-sm text-muted-foreground">Loading TradeVision AI…</p>
        </div>
      </div>
    );
  }

  /* Always show public pages regardless of auth state */
  if (isPublicPath(location)) {
    if (!isAuthenticated) return <PublicRouter login={login} />;
    return <AuthedRouter />;
  }

  if (!isAuthenticated) {
    return <PublicRouter login={login} />;
  }

  return <AuthedRouter />;
}

/* Dispatch to company admin portal without requiring Replit auth */
function AppRouter() {
  const [location] = useLocation();

  if (location === "/company-admin" || location.startsWith("/company-admin/")) {
    return <CompanyAdminPortal />;
  }

  return <AuthedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRouter />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
