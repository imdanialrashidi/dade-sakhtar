/**
 * Course configuration for the template.
 *
 * When a new course is created from this template, the course author edits this
 * single file to configure title, description, sections, difficulty, tags, and
 * theming. All UI, layout, and interactive components read from this config.
 *
 * DO NOT add university-specific, professor-specific, or institutional branding.
 * The only permanent identity is Danial Rashidi.
 */

import type { CourseConfig } from '../lib/types';

export const courseConfig: CourseConfig = {
  // --- Identity (course-specific) ---
  title: 'ساختمان داده‌ها و الگوریتم‌ها',
  tagline: 'از تعریف الگوریتم تا تحلیل مرتبه — قدم‌به‌قدم فارسی',
  description:
    'درس‌نامهٔ آزاد و قدم‌به‌قدم ساختمان داده‌ها و الگوریتم‌ها: هر ایده با مثال حل‌شده، هر فرمول با اثبات و هر عدد با اجرای کد.',
  shortDescription: 'درس‌نامهٔ قدم‌به‌قدم ساختمان داده‌ها و الگوریتم‌ها',
  locale: 'fa',
  direction: 'rtl',

  // --- Brand (per-topic logo) ---
  // When this template powers a site on another subject, change these two
  // values and the header mark + SVG favicon follow — no component edits
  // needed. Then regenerate the raster favicons from the new mark:
  // npm run build && node scripts/make-favicons.mjs && npm run build
  logo: {
    monogram: 'س',
    icon: 'layers',
  },

  // --- Course metadata ---
  difficulty: 'beginner',
  estimatedDuration: 'خودآموز',
  difficultyLevel: 3, // 1–5 scale
  tags: ['ساختمان داده', 'الگوریتم', 'تحلیل الگوریتم', 'بازگشت'],
  category: 'آموزشی',

  // --- Sections (navigation groups) ---
  sections: [
    {
      id: 'foundations',
      title: 'مبانی و تحلیل الگوریتم',
      description: 'تعریف الگوریتم و ساختمان داده، مقایسه الگوریتم‌ها و تحلیل مرتبه',
      order: 1,
    },
  ],

  // --- Course-specific theming ---
  // `themePreset` selects a shared preset from `src/lib/themes.ts`; inline
  // `theme.colors` still wins when both are set, so a course can start from a
  // preset and adjust one role. Never fork `src/styles/theme.css` per course.
  themePreset: 'programming',
  theme: {
    name: 'programming',
    // Roles come from the `programming` preset in src/lib/themes.ts (the
    // documented green/brown palette). Override a single role here only
    // when the course genuinely needs it — never fork theme.css.
    colors: {},
    typography: 'traditional',
    motif: 'geometric',
  },

  // --- Feature flags ---
  // Every capability defaults to enabled when omitted. Turn a flag off to
  // hide its UI (nav item, island, section) without editing components.
  features: {
    search: true,
    commandPalette: true,
    formulas: true,
    glossary: true,
    practice: true,
    progress: true,
    simulations: true,
    toc: true,
    related: true,
    courseMap: true,
  },
};
