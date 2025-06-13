import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import es from "./locales/es.json";

export const AVAILABLE_LANGS = ["en", "es"];

const customDetector = {
  name: "persistedLang",
  lookup() {
    return localStorage.getItem("uoa:lang");
  },
  cacheUserLanguage(lng: string) {
    localStorage.setItem("uoa:lang", lng);
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    detection: {
      order: ["persistedLang", "navigator", "htmlTag"],
      lookupLocalStorage: "uoa:lang",
      caches: ["persistedLang"],
    },

    resources: {
      en: {
        translation: en,
      },
      es: {
        translation: es,
      },
    },

    fallbackLng: "en",

    debug: import.meta.env.NODE_ENV === "development",

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

i18n.services.languageDetector.addDetector(customDetector);

export default i18n;
