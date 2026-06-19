import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import {
  homeMessages,
  supportedHomeLocales,
  type SupportedHomeLocale,
} from "./homeMessages";
import { HOME_LOCALE_COOKIE } from "./constants";
const DEFAULT_LOCALE: SupportedHomeLocale = "en";

const isSupportedLocale = (value: string | undefined): value is SupportedHomeLocale =>
  !!value && (supportedHomeLocales as readonly string[]).includes(value);

export default getRequestConfig(async ({ locale, requestLocale }) => {
  const requestLocaleValue = await requestLocale;
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(HOME_LOCALE_COOKIE)?.value;

  const resolvedLocale =
    (isSupportedLocale(locale) && locale) ||
    (isSupportedLocale(requestLocaleValue) && requestLocaleValue) ||
    (isSupportedLocale(cookieLocale) && cookieLocale) ||
    DEFAULT_LOCALE;

  return {
    locale: resolvedLocale,
    messages: homeMessages[resolvedLocale],
  };
});
