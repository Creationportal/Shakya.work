import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AccessForm from "@/components/AccessForm";
import RequestAccess from "@/components/RequestAccess";
import { getLang, translate } from "@/lib/i18n/server";

export async function generateMetadata() {
  const lang = await getLang();
  return {
    title: lang === "zh" ? "灵感资源库" : "Ideas Vault",
    // Gate page: never index or follow from search engines.
    robots: { index: false, follow: false },
  };
}

export default async function VaultPage() {
  const cookieStore = await cookies();
  const granted = cookieStore.get("portal_access")?.value === "granted";
  const lang = await getLang();
  const t = (k: string) => translate(k, lang);

  // The vault is an entry gate: a valid passcode (handled client-side by
  // AccessForm) redirects to /cv. If already granted, send them straight there.
  if (granted) {
    redirect("/cv");
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-16 sm:pt-20">
      <p className="text-sm font-medium uppercase tracking-widest text-accent">
        {t("vault.title")}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {t("vault.publicTitle")}
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        {t("vault.publicBody")}
      </p>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">
            {t("vault.haveCodeTitle")}
          </h2>
          <div className="mt-4">
            <AccessForm />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">
            {t("vault.requestTitle")}
          </h2>
          <p className="mt-2 text-sm text-muted">{t("vault.requestBody")}</p>
          <div className="mt-4">
            <RequestAccess />
          </div>
        </div>
      </div>
    </div>
  );
}
