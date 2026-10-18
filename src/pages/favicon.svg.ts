import type { APIRoute } from 'astro';
import { resolvedTheme } from '../lib/themes';

export const prerender = true;

/**
 * Favicon — the open-book brand mark on paper, tracking the illuminated-
 * worksheet identity (docs/DESIGN.md): warm canvas, hairline border, and
 * the book in the repo's own icon stroke language. No text, no extra
 * motif: letterforms depend on viewer fonts and every extra element costs
 * legibility at 16px.
 */
export const GET: APIRoute = () => {
  const { primary } = resolvedTheme();
  const body =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
    `<rect x="0.5" y="0.5" width="31" height="31" rx="7" fill="#FAF7F0" stroke="#E4DCCD"/>` +
    `<g transform="translate(3.2 3.2) scale(1.28)" fill="none" stroke="${primary}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="M3 4.5A1.5 1.5 0 0 1 4.5 3H9a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4.5A1.5 1.5 0 0 1 3 13.5z"/>` +
    `<path d="M17 4.5A1.5 1.5 0 0 0 15.5 3H11a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h4.5a1.5 1.5 0 0 0 1.5-1.5z"/>` +
    `</g>` +
    `</svg>`;
  return new Response(body, {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  });
};
