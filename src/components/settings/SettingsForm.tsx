"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import {
  DEFAULT_SETTINGS,
  type SiteSettings,
  type ThemeFont,
  type RadiusScale,
  type VoiceLang,
} from "@/lib/settings/schema";
import { applyDesignTokens } from "@/lib/design-system/tokens";

/* ------------------------------------------------------------------ */
/* Small field helpers                                                 */
/* ------------------------------------------------------------------ */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-surface p-6">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-accent">
        {title}
      </h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-muted">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent";

function TextInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      className={inputCls}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function TextArea({
  value,
  onChange,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      className={inputCls}
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function ColorInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#7c3aed"}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-12 cursor-pointer rounded border border-line bg-paper"
      />
      <input
        className={inputCls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function SelectInput<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      className={inputCls}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors ${
        checked ? "bg-accent" : "bg-line"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* The form                                                            */
/* ------------------------------------------------------------------ */

export default function SettingsForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [draft, setDraft] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const loadedRef = useRef(false);

  const set = useCallback(<K extends keyof SiteSettings>(
    key: K,
    patch: Partial<SiteSettings[K]>
  ) => {
    setDraft((d) => ({
      ...d,
      [key]: {
        ...d[key],
        ...patch,
      },
    }));
  }, []);

  const setText = useCallback(
    (
      section: "home" | "banner",
      field: keyof SiteSettings["home"] | keyof SiteSettings["banner"]
    ) =>
      (lang: "en" | "zh") =>
      (v: string) => {
        setDraft((d) => {
          const target = d[section] as unknown as Record<string, Record<string, string>>;
          return {
            ...d,
            [section]: { ...target, [field]: { ...target[field], [lang]: v } },
          };
        });
      },
    []
  );

  /* Load current settings once. */
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: SiteSettings) => setDraft(data))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  /* Live-preview design changes. */
  useEffect(() => {
    if (!loaded) return;
    const { root, dark } = applyDesignTokens(draft.design);
    const el = document.documentElement;
    Object.entries(root).forEach(([k, v]) => el.style.setProperty(k, v));
    Object.entries(dark).forEach(([k, v]) =>
      el.style.setProperty(`${k}-dark`, v)
    );
  }, [draft.design, loaded]);

  const save = useCallback(async () => {
    setStatus("saving");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error("save failed");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }, [draft]);

  const reset = useCallback(async () => {
    setDraft(DEFAULT_SETTINGS);
    setStatus("saving");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(DEFAULT_SETTINGS),
      });
      if (!res.ok) throw new Error("reset failed");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/settings/logout", { method: "POST" });
    router.refresh();
  }, [router]);

  if (!loaded) {
    return <p className="mt-6 text-sm text-muted">…</p>;
  }

  return (
    <div className="mt-10 space-y-6 pb-16">
      {/* Identity & SEO */}
      <Section title={t("settings.sectionGeneral")}>
        <Field label={t("settings.labelSiteName")}>
          <TextInput value={draft.site.name} onChange={(v) => set("site", { name: v })} />
        </Field>
        <Field label={t("settings.labelSiteNameZh")}>
          <TextInput value={draft.site.nameZh} onChange={(v) => set("site", { nameZh: v })} />
        </Field>
        <Field label={t("settings.labelTagline")}>
          <TextInput value={draft.site.tagline} onChange={(v) => set("site", { tagline: v })} />
        </Field>
        <Field label={t("settings.labelTaglineZh")}>
          <TextInput value={draft.site.taglineZh} onChange={(v) => set("site", { taglineZh: v })} />
        </Field>
        <Field label={t("settings.labelMetaTitle")}>
          <TextInput value={draft.site.metaTitle} onChange={(v) => set("site", { metaTitle: v })} />
        </Field>
        <Field label={t("settings.labelMetaDescription")} wide>
          <TextArea value={draft.site.metaDescription} onChange={(v) => set("site", { metaDescription: v })} />
        </Field>
      </Section>

      {/* Design system */}
      <Section title={t("settings.sectionDesign")}>
        <Field label={t("settings.labelAccent")}>
          <ColorInput value={draft.design.accent} onChange={(v) => set("design", { accent: v })} />
        </Field>
        <Field label={t("settings.labelAccentInk")}>
          <ColorInput value={draft.design.accentInk} onChange={(v) => set("design", { accentInk: v })} />
        </Field>
        <Field label={t("settings.labelAccentDark")}>
          <ColorInput value={draft.design.accentDark} onChange={(v) => set("design", { accentDark: v })} />
        </Field>
        <Field label={t("settings.labelAccentInkDark")}>
          <ColorInput value={draft.design.accentInkDark} onChange={(v) => set("design", { accentInkDark: v })} />
        </Field>
        <Field label={t("settings.labelGlow")}>
          <input
            type="range"
            min={0}
            max={0.5}
            step={0.01}
            value={draft.design.glowOpacity}
            onChange={(e) => set("design", { glowOpacity: Number(e.target.value) })}
            className="w-full accent-[var(--color-accent)]"
          />
          <span className="text-xs text-muted">{draft.design.glowOpacity.toFixed(2)}</span>
        </Field>
        <Field label={t("settings.labelRadius")}>
          <SelectInput<RadiusScale>
            value={draft.design.radius}
            onChange={(v) => set("design", { radius: v })}
            options={[
              { value: "sm", label: t("settings.radiusSm") },
              { value: "md", label: t("settings.radiusMd") },
              { value: "lg", label: t("settings.radiusLg") },
              { value: "xl", label: t("settings.radiusXl") },
              { value: "full", label: t("settings.radiusFull") },
            ]}
          />
        </Field>
        <Field label={t("settings.labelFont")}>
          <SelectInput<ThemeFont>
            value={draft.design.font}
            onChange={(v) => set("design", { font: v })}
            options={[
              { value: "sans", label: t("settings.fontSans") },
              { value: "serif", label: t("settings.fontSerif") },
              { value: "mono", label: t("settings.fontMono") },
            ]}
          />
        </Field>
        <Field label={t("settings.labelDarkDefault")}>
          <Toggle checked={draft.design.darkModeDefault} onChange={(v) => set("design", { darkModeDefault: v })} />
        </Field>
        <Field label={t("settings.labelScrollHint")}>
          <Toggle checked={draft.design.showScrollHint} onChange={(v) => set("design", { showScrollHint: v })} />
        </Field>
      </Section>

      {/* Home content */}
      <Section title={t("settings.sectionHome")}>
        <Field label={`${t("settings.labelHeroTitle")} · EN`}>
          <TextArea value={draft.home.heroTitle.en} onChange={setText("home", "heroTitle")("en")} rows={2} />
        </Field>
        <Field label={`${t("settings.labelHeroTitle")} · 中文`}>
          <TextArea value={draft.home.heroTitle.zh} onChange={setText("home", "heroTitle")("zh")} rows={2} />
        </Field>
        <Field label={`${t("settings.labelHeroBody")} · EN`} wide>
          <TextArea value={draft.home.heroBody.en} onChange={setText("home", "heroBody")("en")} rows={3} />
        </Field>
        <Field label={`${t("settings.labelHeroBody")} · 中文`} wide>
          <TextArea value={draft.home.heroBody.zh} onChange={setText("home", "heroBody")("zh")} rows={3} />
        </Field>
        <Field label={`${t("settings.labelSummaryTitle")} · EN`}>
          <TextArea value={draft.home.summaryTitle.en} onChange={setText("home", "summaryTitle")("en")} rows={2} />
        </Field>
        <Field label={`${t("settings.labelSummaryTitle")} · 中文`}>
          <TextArea value={draft.home.summaryTitle.zh} onChange={setText("home", "summaryTitle")("zh")} rows={2} />
        </Field>
        <Field label={`${t("settings.labelOrbLabel")} · EN`}>
          <TextInput value={draft.home.orbLabel.en} onChange={setText("home", "orbLabel")("en")} />
        </Field>
        <Field label={`${t("settings.labelOrbLabel")} · 中文`}>
          <TextInput value={draft.home.orbLabel.zh} onChange={setText("home", "orbLabel")("zh")} />
        </Field>
      </Section>

      {/* CV */}
      <Section title={t("settings.sectionCv")}>
        <Field label={t("settings.labelPdfPath")}>
          <TextInput value={draft.cv.pdfPath} onChange={(v) => set("cv", { pdfPath: v })} />
        </Field>
        <Field label={t("settings.labelPdfFilename")}>
          <TextInput value={draft.cv.pdfFilename} onChange={(v) => set("cv", { pdfFilename: v })} />
        </Field>
      </Section>

      {/* AI voice */}
      <Section title={t("settings.sectionVoice")}>
        <Field label={t("settings.labelVoiceLang")}>
          <SelectInput<VoiceLang>
            value={draft.voiceGuide.defaultLang}
            onChange={(v) => set("voiceGuide", { defaultLang: v })}
            options={[
              { value: "en", label: "English" },
              { value: "zh", label: "中文" },
              { value: "yue", label: "粤语" },
              { value: "es", label: "Español" },
              { value: "ne", label: "नेपाली" },
            ]}
          />
        </Field>
        <Field label={t("settings.labelNewsVoice")}>
          <TextInput value={draft.voiceGuide.defaultNewsVoice} onChange={(v) => set("voiceGuide", { defaultNewsVoice: v })} />
        </Field>
        <Field label={t("settings.labelSpeechRate")}>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.05}
            value={draft.voiceGuide.speechRate}
            onChange={(e) => set("voiceGuide", { speechRate: Number(e.target.value) })}
            className="w-full accent-[var(--color-accent)]"
          />
          <span className="text-xs text-muted">{draft.voiceGuide.speechRate.toFixed(2)}×</span>
        </Field>
        <Field label={t("settings.labelEnableNews")}>
          <Toggle checked={draft.voiceGuide.enableNews} onChange={(v) => set("voiceGuide", { enableNews: v })} />
        </Field>
      </Section>

      {/* Contact channels */}
      <Section title={t("settings.sectionContact")}>
        <Field label={t("settings.labelEmailPrimary")}>
          <TextInput value={draft.contact.emailPrimary} onChange={(v) => set("contact", { emailPrimary: v })} />
        </Field>
        <Field label={t("settings.labelEmailSecondary")}>
          <TextInput value={draft.contact.emailSecondary} onChange={(v) => set("contact", { emailSecondary: v })} />
        </Field>
        <Field label={t("settings.labelLinkedin")}>
          <TextInput value={draft.contact.linkedin} onChange={(v) => set("contact", { linkedin: v })} />
        </Field>
        <Field label={t("settings.labelPhone")}>
          <TextInput value={draft.contact.phone} onChange={(v) => set("contact", { phone: v })} />
        </Field>
        <Field label={t("settings.labelWechat")}>
          <TextInput value={draft.contact.wechat} onChange={(v) => set("contact", { wechat: v })} />
        </Field>
        <Field label={t("settings.labelGithub")}>
          <TextInput value={draft.contact.github} onChange={(v) => set("contact", { github: v })} />
        </Field>
      </Section>

      {/* Announcement banner */}
      <Section title={t("settings.sectionBanner")}>
        <Field label={t("settings.labelBannerEnabled")}>
          <Toggle checked={draft.banner.enabled} onChange={(v) => set("banner", { enabled: v })} />
        </Field>
        <Field label={`${t("settings.labelBannerText")} · EN`}>
          <TextInput value={draft.banner.text.en} onChange={setText("banner", "text")("en")} />
        </Field>
        <Field label={`${t("settings.labelBannerText")} · 中文`}>
          <TextInput value={draft.banner.text.zh} onChange={setText("banner", "text")("zh")} />
        </Field>
      </Section>

      {/* Robots */}
      <Section title={t("settings.sectionRobots")}>
        <Field label={t("settings.labelRobotsAllowAll")}>
          <Toggle checked={draft.robots.allowAll} onChange={(v) => set("robots", { allowAll: v })} />
        </Field>
      </Section>

      {/* Actions */}
      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface p-4 shadow-lg no-print">
        <button
          type="button"
          onClick={save}
          disabled={status === "saving"}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {status === "saving" ? t("settings.saving") : t("settings.save")}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-ink"
        >
          {t("settings.reset")}
        </button>
        <button
          type="button"
          onClick={logout}
          className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-ink"
        >
          {t("settings.logout")}
        </button>
        <span className="ml-auto text-sm">
          {status === "saved" && (
            <span className="text-emerald-500">{t("settings.saved")}</span>
          )}
          {status === "error" && (
            <span className="text-red-500">{t("settings.saveError")}</span>
          )}
        </span>
      </div>
    </div>
  );
}
