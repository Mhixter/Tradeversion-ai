import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

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

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/strategy-builder" component={StrategyBuilder} />
      <Route path="/bot-manager" component={BotManager} />
      <Route path="/ai-marketplace" component={AIMarketplace} />
      <Route path="/backtesting" component={Backtesting} />
      <Route path="/copy-trading" component={CopyTrading} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/risk-center" component={RiskCenter} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/settings" component={Settings} />
      <Route path="/account" component={Account} />
      <Route path="/company" component={CompanyManagement} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;