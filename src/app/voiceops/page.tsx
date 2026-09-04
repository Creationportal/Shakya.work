import { redirect } from "next/navigation";

// Voice Ops moved into the AI Lab — the studio UI now lives on /ailab
// (AI R&D · Live modules). This route only redirects old links.
export default function VoiceOpsPage() {
  redirect("/ailab");
}
