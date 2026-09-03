/**
 * ProjectEmptyCard — dashed placeholder for not-yet-built items. Mirrors the
 * "coming soon" cards on /ideas and /ailab so an empty project page still
 * follows the grid + card language until real cards are added.
 */
export default function ProjectEmptyCard({
  title,
  note,
}: {
  title?: string;
  note?: string;
}) {
  return (
    <div className="flex flex-col justify-center rounded-lg border border-dashed border-line bg-surface p-6 text-center text-sm text-muted">
      {title && <p className="font-medium text-ink">{title}</p>}
      {note && <p className="mt-2">{note}</p>}
    </div>
  );
}
