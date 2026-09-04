import { redirect } from "next/navigation";

// ASR+ moved into the AI Lab — the studio UI now lives on /ailab
// (AI R&D · Live modules). This route only redirects old links.
export default function AsrPage() {
  redirect("/ailab");
}
