import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";
import { Lang } from "../lib/i18n";

interface Props {
  lang: Lang;
}

export default function SocialProofToast({ lang }: Props) {
  const [toast, setToast] = useState<{
    guest_name: string;
    city: string;
    time_text: string;
  } | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const showToast = async () => {
      try {
        const data = await api.getSocialProof();
        if (data.recent_bookings?.length > 0) {
          const random = data.recent_bookings[Math.floor(Math.random() * data.recent_bookings.length)];
          setToast(random);
          setTimeout(() => setToast(null), 5000);
        }
      } catch {
        // Silently fail
      }
      timer = setTimeout(showToast, 15000 + Math.random() * 15000);
    };

    timer = setTimeout(showToast, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          className="fixed bottom-20 left-4 z-50 bg-white rounded-xl shadow-xl border border-amber-100 p-3 max-w-xs"
        >
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-green-600 text-sm">&#10003;</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {toast.guest_name}
                <span className="text-gray-500 font-normal"> de {toast.city}</span>
              </p>
              <p className="text-xs text-gray-500">{lang === "fr" ? "a reserve" : "booked"} - {toast.time_text}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
