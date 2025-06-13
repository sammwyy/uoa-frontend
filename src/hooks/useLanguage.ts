import { AVAILABLE_LANGS } from "@/i18n/i18n";
import { useTranslation } from "react-i18next";

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("uoa:lang", lng);
  };

  const getCurrentLanguage = () => {
    return i18n.language || localStorage.getItem("uoa:lang") || "es";
  };

  return {
    currentLanguage: getCurrentLanguage(),
    changeLanguage,
    availableLanguages: AVAILABLE_LANGS,
  };
};
