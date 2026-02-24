import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import WhatsAppFAB from "./components/WhatsAppFAB";
import SocialProofToast from "./components/SocialProofToast";
import HomePage from "./pages/HomePage";
import HotelsPage from "./pages/HotelsPage";
import HotelDetailPage from "./pages/HotelDetailPage";
import BookingPage from "./pages/BookingPage";
import AdminDashboard from "./pages/AdminDashboard";
import { useLang } from "./hooks/useLang";

function AppContent() {
  const { lang, setLang } = useLang();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${lang === "ar" ? "font-arabic" : ""}`} dir={lang === "ar" ? "rtl" : "ltr"}>
      <Header lang={lang} setLang={setLang} />
      <Routes>
        <Route path="/" element={<HomePage lang={lang} />} />
        <Route path="/hotels" element={<HotelsPage lang={lang} />} />
        <Route path="/hotels/:slug" element={<HotelDetailPage lang={lang} />} />
        <Route path="/booking/:slug" element={<BookingPage lang={lang} />} />
      </Routes>
      <WhatsAppFAB />
      <SocialProofToast lang={lang} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
