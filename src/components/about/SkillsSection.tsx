import { SKILLS, type SkillItem } from "@/lib/skills-data";
import { getLang, translate } from "@/lib/i18n/server";

function letterAvatar(item: SkillItem) {
  return item.name.trim().charAt(0).toUpperCase();
}

function SkillChip({ item }: { item: SkillItem }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-ink">
      {item.icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/skills/${item.icon}`}
          alt=""
          aria-hidden="true"
          className="h-4 w-4 flex-none rounded-sm object-contain"
          width={16}
          height={16}
        />
      ) : (
        <span className="flex h-4 w-4 flex-none items-center justify-center rounded-sm bg-accent/10 text-[10px] font-bold leading-none text-accent">
          {letterAvatar(item)}
        </span>
      )}
      <span className="truncate">{item.name}</span>
    </div>
  );
}

export default async function SkillsSection() {
  const lang = await getLang();
  const t = (k: string) => translate(k, lang);

  return (
    <section className="mx-auto max-w-6xl px-5 pb-16">
      <div className="rounded-xl border border-line bg-surface/80 p-6 backdrop-blur-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          {t("about.skillsEyebrow")}
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
          {t("about.skillsTitle")}
        </h2>
        <p className="mt-3 text-sm text-muted">{t("about.skillsBody")}</p>

        <div className="mt-8 space-y-8">
          {SKILLS.map((cat) => (
            <div key={cat.key}>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                {t(`skills.${cat.key}`)}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {cat.items.map((item) => (
                  <SkillChip key={item.name} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
