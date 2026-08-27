import type { RadiusScale, ThemeFont } from "@/lib/settings/schema";

/**
 * Design system tokens.
 *
 * The provider writes `--*-var` custom properties on <html>. globals.css
 * aliases them onto the real tokens (`--accent`, `--radius-lg`, ...) inside
 * `:root` / `.dark`, so dark-mode switching keeps working purely via CSS.
 *
 * Both the client DesignSystemProvider and server inline styles call
 * applyDesignTokens() so the site always renders with current settings.
 */

const RADII: Record<RadiusScale, number> = {
  sm: 0.25,
  md: 0.375,
  lg: 0.5,
  xl: 0.75,
  full: 9999,
};

const FONTS: Record<ThemeFont, string> = {
  sans: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
  serif: "Georgia, 'Times New Roman', Cambria, serif",
  mono: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
};

export function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function glow(accent: string, opacity: number): string {
  const rgb = hexToRgb(accent);
  if (!rgb) return `rgba(124, 58, 237, ${opacity})`;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
}

export interface ApplyDesignInput {
  accent: string;
  accentInk: string;
  accentDark: string;
  accentInkDark: string;
  glowOpacity: number;
  radius: RadiusScale;
  font: ThemeFont;
}

export function applyDesignTokens(input: ApplyDesignInput): {
  root: Record<string, string>;
  dark: Record<string, string>;
} {
  const base = RADII[input.radius];
  const scale = (m: number) =>
    input.radius === "full" ? "9999px" : `${(base * m).toFixed(3)}rem`;

  return {
    root: {
      "--accent-var": input.accent,
      "--accent-var-ink": input.accentInk,
      "--glow-var": glow(input.accent, input.glowOpacity),
      "--font-base-var": FONTS[input.font],
      "--radius-sm-var": scale(0.5),
      "--radius-md-var": scale(0.75),
      "--radius-lg-var": scale(1),
      "--radius-xl-var": scale(1.5),
    },
    dark: {
      "--accent-var": input.accentDark,
      "--accent-var-ink": input.accentInkDark,
      "--glow-var": glow(input.accentDark, input.glowOpacity),
    },
  };
}

/** Apply tokens to a DOM element (documentElement in practice). */
export function applyDesignTokensToRoot(el: HTMLElement, input: ApplyDesignInput) {
  const { root, dark } = applyDesignTokens(input);
  Object.entries(root).forEach(([k, v]) => el.style.setProperty(k, v));
  // Dark values: globals.css picks them up only when .dark is present.
  Object.entries(dark).forEach(([k, v]) => {
    el.style.setProperty(`${k}-dark`, v);
  });
}
