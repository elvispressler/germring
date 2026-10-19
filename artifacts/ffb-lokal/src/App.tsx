import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout/Layout";
import { Home } from "@/pages/Home";
import { CategoryPage } from "@/pages/Category";
import { ArticleDetailPage } from "@/pages/ArticleDetail";
import { Newsletter } from "@/pages/Newsletter";
import { NewsletterConfirm } from "@/pages/NewsletterConfirm";
import { KlimadatenPage } from "@/pages/Klimadaten";
import { PvRechnerPage } from "@/pages/PvRechner";
import { EnergieatlasPage } from "@/pages/Energieatlas";
import { FoerderungPage } from "@/pages/Foerderung";
import { SolarkatasterPage } from "@/pages/Solarkataster";
import { AdminPage } from "@/pages/Admin";
import { AdminWochePage } from "@/pages/AdminWoche";
import { AdminFoerderungPage } from "@/pages/AdminFoerderung";
import { AdminBilderPage } from "@/pages/AdminBilder";
import { AdminGate } from "@/components/AdminGate";
import { LadesaeulenPage } from "@/pages/Ladesaeulen";
import { PartnerPage } from "@/pages/Partner";
import { ImpressumPage } from "@/pages/Impressum";
import { MitmachenPage } from "@/pages/Mitmachen";
import { DatenschutzPage } from "@/pages/Datenschutz";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/kategorie/:slug" component={CategoryPage} />
        <Route path="/artikel/:id" component={ArticleDetailPage} />
        <Route path="/newsletter" component={Newsletter} />
        <Route path="/newsletter/confirm" component={NewsletterConfirm} />
        <Route path="/klima" component={KlimadatenPage} />
        <Route path="/pv-rechner" component={PvRechnerPage} />
        <Route path="/energieatlas" component={EnergieatlasPage} />
        <Route path="/foerderung" component={FoerderungPage} />
        <Route path="/ladesaeulen" component={LadesaeulenPage} />
        <Route path="/solarkataster" component={SolarkatasterPage} />
        <Route path="/partner" component={PartnerPage} />
        <Route path="/mitmachen" component={MitmachenPage} />
        <Route path="/impressum" component={ImpressumPage} />
        <Route path="/datenschutz" component={DatenschutzPage} />
        <Route path="/admin">
          <AdminGate><AdminPage /></AdminGate>
        </Route>
        <Route path="/admin/woche">
          <AdminGate><AdminWochePage /></AdminGate>
        </Route>
        <Route path="/admin/foerderung">
          <AdminGate><AdminFoerderungPage /></AdminGate>
        </Route>
        <Route path="/admin/bilder">
          <AdminGate><AdminBilderPage /></AdminGate>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  useEffect(() => {
    const loader = document.getElementById("initial-loader");
    if (!loader) return;

    loader.dataset.dismissed = "true";
    const timer = window.setTimeout(() => loader.remove(), 240);
    return () => window.clearTimeout(timer);
  }, []);

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
