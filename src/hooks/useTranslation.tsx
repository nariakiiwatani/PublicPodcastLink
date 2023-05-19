import texts from "../i18n"
import { createContext, useContext, useState, useMemo } from 'react';

const LanguageContext = createContext(
	{ locale:'ja', changeLanguage:(l:string)=>{l} }
);

export const LanguageProvider = ({ children }:{children:any}) => {
  const [locale, setLocale] = useState(() => {
	const browser_setting = navigator.language.split('-')[0]
	return ['en','ja'].includes(browser_setting)?browser_setting:'ja'
  });

  const changeLanguage = (l:string) => {
    setLocale(l);
  };

  return (
	<LanguageContext.Provider value={{ locale, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (path?: string|string[]) => {
	const context = useContext(LanguageContext);

	if (!context) {
	  throw new Error('useTranslation must be used within a LanguageProvider');
	}
	const {locale, changeLanguage} = context

	const result = useMemo<{[key:string]:any}>(() => {
		// localeが一致するデータを再帰的にpick
		const cherryPick = (obj: {[key:string]:any}|any[], key:string):{}|[] => {
			if(Array.isArray(obj)) {
				return obj.map(o => cherryPick(o, key))
			}
			else if(typeof obj === 'object') {
				if(key in obj) return obj[key]
				return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, cherryPick(v, key)]))
			}
			return obj
		}
		let base = texts
		if(path) {
			base = (Array.isArray(path)?path:[path]).reduce((ret,p)=>ret[p], base as any)
		}
		return cherryPick(base, locale)
	}, [locale, path])

	return { locale, t:result, changeLanguage };
}