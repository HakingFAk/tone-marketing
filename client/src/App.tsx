import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import Product from "@/pages/Product";
import Admin from "@/pages/Admin";
import AdminVideos from "@/pages/AdminVideos";
import AdminAmbient from "@/pages/AdminAmbient";
import AdminInsights from "@/pages/AdminInsights";
import Shipping from "@/pages/Shipping";
import Trust from "@/pages/Trust";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { SiteAmbient } from "@/components/SiteAmbient";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider, useLanguage } from "@/lib/i18n";
import { AmbientAudioProvider, useAmbientAudio } from "@/components/AmbientAudio";
import { CartDrawer, CartProvider } from "@/components/Cart";
import { trpc } from "@/lib/trpc";
import { getToneAnalyticsIdentity, TONE_ANALYTICS_EVENT, ToneAnalyticsPayload } from "@/lib/analytics";

function AnalyticsBridge({ location, enabled }: { location: string; enabled: boolean }) {
  const track = trpc.analytics.track.useMutation();
  useEffect(() => {
    if (!enabled) return;
    const submit = (payload: ToneAnalyticsPayload) => {
      const identity = getToneAnalyticsIdentity();
      track.mutate({ ...identity, ...payload, page: payload.page || location });
    };
    const listener = (event: Event) => submit((event as CustomEvent<ToneAnalyticsPayload>).detail);
    const onWhatsAppLink = (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest("a[href*='wa.me']");
      if (link) submit({ eventType: "whatsapp_contact", source: "quick_whatsapp_link" });
    };
    window.addEventListener(TONE_ANALYTICS_EVENT, listener);
    window.addEventListener("click", onWhatsAppLink);
    submit({ eventType: "page_view", page: location, source: "route" });
    return () => {
      window.removeEventListener(TONE_ANALYTICS_EVENT, listener);
      window.removeEventListener("click", onWhatsAppLink);
    };
  }, [enabled, location]);
  return null;
}

function Router() {
  const [location] = useLocation();
  const { language } = useLanguage();
  const { setToneContext, setTrackUrl } = useAmbientAudio();
  const ambientTracks = trpc.ambient.list.useQuery();
  const isAdmin = location.startsWith("/admin");
  useEffect(() => { if (location.startsWith("/envio-internacional")) setToneContext("acoustic"); else if (location.startsWith("/confianca")) setToneContext("effects"); else if (!location.startsWith("/produto/")) setToneContext("guitar"); }, [location, setToneContext]);
  useEffect(() => { ambientTracks.data?.forEach(track => setTrackUrl(track.context, track.url)); }, [ambientTracks.data, setTrackUrl]);
  return <><AnalyticsBridge location={location} enabled={!isAdmin}/><Switch>
    <Route path="/" component={Home} />
    <Route path="/produto/:slug" component={Product} />
    <Route path="/admin" component={Admin} />
    <Route path="/admin/videos" component={AdminVideos} />
    <Route path="/admin/ambient" component={AdminAmbient} />
    <Route path="/admin/insights" component={AdminInsights} />
    <Route path="/envio-internacional" component={Shipping} />
    <Route path="/confianca" component={Trust} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>{!isAdmin && <><SiteAmbient/><FloatingWhatsApp language={language}/><CartDrawer/></>}</>;
}

export default function App() {
  return <ErrorBoundary><LanguageProvider><ThemeProvider defaultTheme="dark"><CartProvider><AmbientAudioProvider><TooltipProvider><Toaster theme="dark"/><Router /></TooltipProvider></AmbientAudioProvider></CartProvider></ThemeProvider></LanguageProvider></ErrorBoundary>;
}
