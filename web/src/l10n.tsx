import React, { Children, useEffect, useState, ReactNode } from 'react';

import { negotiateLanguages } from '@fluent/langneg';
import { FluentBundle, FluentResource } from '@fluent/bundle';
import { ReactLocalization, LocalizationProvider } from '@fluent/react';

const DEFAULT_LOCALE = 'en';
// We eventually want this to be more dynamic, preferably based on the
// availability of translation files, and maybe even not including locales
// before they have a certain amount of translated strings. See CV process
// for this.
const AVAILABLE_LOCALES = [DEFAULT_LOCALE];
const RTL_LOCALES: string[] = [];

async function fetchMessages(locale: string): Promise<[string, string]> {
  const response = await fetch(`/locales/${locale}/sentence-collector.ftl`);
  const messages = await response.text();
  return [locale, messages];
}

function* lazilyParsedBundles(fetchedMessages: Array<[string, string]>) {
  for (const [locale, messages] of fetchedMessages) {
    const resource = new FluentResource(messages);
    const bundle = new FluentBundle(locale);
    bundle.addResource(resource);
    yield bundle;
  }
}

interface AppLocalizationProviderProps {
  children: ReactNode;
  locale: string | undefined;
}

export function AppLocalizationProvider({ children, locale }: AppLocalizationProviderProps) {
  const [currentLocales, setCurrentLocales] = useState([DEFAULT_LOCALE]);
  const [l10n, setL10n] = useState<ReactLocalization | null>(null);

  useEffect(() => {
    const locales = [...navigator.languages];
    if (locale) {
      locales.unshift(locale);
    }
    changeLocales(locales);
  }, [locale]);

  useEffect(() => {
    const mainLocale = currentLocales[0];
    const { documentElement } = document;
    documentElement.setAttribute('lang', mainLocale);
    documentElement.setAttribute('dir', RTL_LOCALES.includes(mainLocale) ? 'rtl' : 'ltr');
  }, [currentLocales]);

  async function changeLocales(userLocales: Array<string>) {
    const negotiatedLocales = negotiateLanguages(userLocales, AVAILABLE_LOCALES, {
      defaultLocale: DEFAULT_LOCALE,
    });
    setCurrentLocales(negotiatedLocales);

    const fetchedMessages = await Promise.all(negotiatedLocales.map(fetchMessages));

    const bundles = lazilyParsedBundles(fetchedMessages);
    setL10n(new ReactLocalization(bundles));
  }

  if (l10n === null) {
    return <div>Loading…</div>;
  }

  return (
    <>
      <LocalizationProvider l10n={l10n}>{Children.only(children)}</LocalizationProvider>
    </>
  );
}
