import { getTranslations as getInterfaceTranslations } from "next-intl/server";
import { localeDirection } from "@/lib/locale";
import { getAppLocale } from "@/i18n/runtime";
import { LocaleRefresh } from "@/components/locale-refresh";
import { InstallBanner } from "@/components/pwa/install-banner";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { createApiClient } from "@/lib/api";

const api = createApiClient("ye-translate");
import {
  getThemeCSSVariables,
  getThemeMode,
  generateThemeStyle,
  generateSystemThemeScript,
} from "@/lib/theme";
import { TranslateHeader } from "@/components/layout/translate-header";
import { TranslateNavigation } from "@/components/layout/translate-navigation";
import { LaunchRequirementsBanner } from "@/components/launch-requirements-banner";

export async function generateMetadata(): Promise<Metadata> {
  const translateInterface = await getInterfaceTranslations("interface");
  const appName = process.env.APP_NAME || "Translate";
  return {
    title: appName,
    description: translateInterface("mf787b5f66b77"),
    icons: { icon: "/api/pwa/icon?size=32" },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: appName,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#8b5cf6",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession("ye-translate").catch(() => null);

  let headerConfig = null;
  let launchRequirements = null;
  if (session) {
    [headerConfig, launchRequirements] = await Promise.all([
      api.fetchHeaderConfig(session.userId),
      api.getLaunchRequirements(session.userId),
    ]);
  }

  const cssVariables = getThemeCSSVariables(headerConfig);
  const themeStyle = generateThemeStyle(cssVariables);
  const themeMode = getThemeMode(headerConfig);
  const isSystemTheme = themeMode === "system";
  const htmlClass = isSystemTheme ? "" : themeMode;

  const locale = await getAppLocale();
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} dir={localeDirection(locale)} className={htmlClass} suppressHydrationWarning>
      <head>
        {isSystemTheme && (
          <script dangerouslySetInnerHTML={{ __html: generateSystemThemeScript() }} />
        )}
        {themeStyle && (
          <style
            id="ye-theme"
            dangerouslySetInnerHTML={{ __html: themeStyle }}
          />
        )}
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LocaleRefresh locale={locale} endpoint="/api/locale" />
          {session && <TranslateHeader />}
          {session && <LaunchRequirementsBanner appName="Translate" requirements={launchRequirements} />}
          <div className={session ? "translation-app-layout" : undefined}>
            {session && <TranslateNavigation />}
            <main className="min-w-0">{children}</main>
          </div>
          <InstallBanner appName="Translate" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
