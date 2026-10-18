import type { APIRoute } from 'astro';
import { courseConfig } from '../config/course';
import { resolvedTheme } from '../lib/themes';
import { ICON_PATHS } from '../components/ui/icon-paths';
import type { IconName } from '../components/ui/icon-names';

export const prerender = true;

/**
 * Favicon — the header lockup at icon size: the course `icon` on a
 * primary-wash tile with a primary ring, tracking the illuminated-
 * worksheet identity (docs/DESIGN.md). Both halves of `logo` feed it:
 * the mark is drawn from `ICON_PATHS[logo.icon]` (same table as the
 * header `Icon`), so a new topic changing `icon` gets a new mark with
 * no component edits; the `monogram` rides as the SVG `<title>` for
 * assistive tech, which also keeps the logo contract enforced by
 * tests/output/build-output.test.ts. No text glyphs are rendered:
 * letterforms depend on viewer fonts and collapse at 16px, while the
 * geometry stays crisp at every size.
 */
export const GET: APIRoute = () => {
  const icon = (courseConfig.logo?.icon ?? 'layers') as IconName;
  const monogram = courseConfig.logo?.monogram ?? 'س';
  const { primary, primaryDeep, primaryWash } = resolvedTheme();
  const safe = monogram.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const mark = ICON_PATHS[icon] ?? ICON_PATHS.layers;
  const body =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
    `<title>${safe}</title>` +
    `<rect x="1" y="1" width="30" height="30" rx="7" fill="${primaryWash}" stroke="${primary}" stroke-width="1.5"/>` +
    `<g transform="translate(4.5 4.5) scale(1.15)" fill="none" stroke="${primaryDeep}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${mark}</g>` +
    `</svg>`;
  return new Response(body, {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  });
};
