import type { APIRoute } from 'astro';
import { courseConfig } from '../config/course';
import { resolvedTheme } from '../lib/themes';

export const prerender = true;

/**
 * Favicon — the course monogram on paper, tracking the illuminated-
 * worksheet identity (docs/DESIGN.md): warm canvas, hairline border, and
 * the monogram in primary. A new topic reuses this template by changing
 * `logo` in src/config/course.ts and the header mark + this favicon
 * follow — tests/output/build-output.test.ts enforces this.
 */
export const GET: APIRoute = () => {
  const monogram = courseConfig.logo?.monogram ?? 'س';
  const { primary } = resolvedTheme();
  const safe = monogram.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const size = safe.length > 1 ? 13 : 16;
  const body =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
    `<rect x="0.5" y="0.5" width="31" height="31" rx="7" fill="#FAF7F0" stroke="#E4DCCD"/>` +
    `<text x="16" y="23" font-family="Tahoma, system-ui, sans-serif" font-size="${size}" font-weight="bold" fill="${primary}" text-anchor="middle" direction="rtl">${safe}</text>` +
    `</svg>`;
  return new Response(body, {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  });
};
