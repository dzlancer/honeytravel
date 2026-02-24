import { useState, useCallback } from "react";
import { Lang } from "../lib/i18n";

export function useLang() {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("honey_lang");
    return (saved as Lang) || "fr";
  });

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("honey_lang", newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  }, []);

  return { lang, setLang };
}
