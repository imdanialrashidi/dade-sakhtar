# DSA Self-Study Course Contract — «ساختمان داده‌ها و الگوریتم‌ها»

Status: contract only (no content, config, or code written in this step)
Updated: 2026-10-17
Location: `docs/exec-plans/active/dsa-course-contract.md` (per `docs/exec-plans/README.md`; `docs/exec-plans/` contained only `README.md`, so no location was invented)

## Goal

Replace the template sample course with a complete, original Persian (RTL, `fa` locale) self-study site on Data Structures and Algorithms titled «ساختمان داده‌ها و الگوریتم‌ها», covering exactly the seed topics (Ch.1 foundations + analysis, Ch.2 recursion) in a first release, without rebuilding the UI. Every numeric result is author-original, cross-checked against standard textbooks (CLRS; Horowitz, Sahni & Anderson-Freed; Sedgewick & Wayne), and verified by executing code — never copied prose, figures, or exercises.

## Non-goals

- No new UI components, islands, or schema changes. If a seed topic cannot be expressed with existing components, flag it as a separately accepted slice instead of assuming it.
- No commits, pushes, deployment, or license selection (repo currently has no license; owner adds it separately).
- No weakening of the schema, validator, or tests to obtain green status.
- No roadmap chapters beyond Ch.1–Ch.2 in this release; no placeholder pages or empty sections.
- No reference to any university, instructor, department, handout, or student identity (per `docs/AI-CONTENT-PROMPT.md` §7).

## User / job

Undergraduate CS learner who reads Persian, knows basic C-style programming, and studies a first DSA course. Job: read one idea at a time on phone or laptop, see each formula worked, test understanding with instant quiz feedback, and track progress locally.

## Trigger and end state

- Trigger: owner accepts this contract and orders slice 1.
- End state (release): `src/config/course.ts` describes the DSA course; `src/content/` holds only DSA entries (lessons, concepts, formulas, examples, questions, glossary); `npm run check` + link validation + browser QA pass on the real build; every seed topic maps to shipped entries (mapping table below, zero orphans); roadmap recorded only as labeled, owner-confirmable text in this contract.

## In scope

- Course config edit (`src/config/course.ts` only: title, sections, `themePreset`, logo, tags) + content under `src/content/`.
- Mechanical update of hardcoded sample route lists in `scripts/visual-qa.mjs` (`ROUTES`) and `scripts/interaction-qa.mjs` (quiz/example/lesson URLs) to the new slugs, or documented `--route`/`--base` invocations proving the same coverage. These scripts hardcode calculus slugs today (`01-intro-to-calculus`, `chain-rule`, `practice-foundations`); without this the browser gate cannot run on the new course. This is a test-fixture update, not a UI/architecture change.
- Execution-based verification of every numeric claim (throwaway scripts, not permanent tests by default).

## Out of scope

- Layouts, components, styles, islands, registry, search engine, progress store, math pipeline.
- Server accounts, comments, forums, analytics, build-time content generation.
- Per-course design system or `theme.css` fork (course themes only via `themePreset` + `theme.colors`).

## Primary journeys

1. Land on homepage → read contents by section → open next unread lesson → finish and mark done; progress persists across reloads on the same device.
2. Search a term/formula (Persian or Arabic keyboard) → jump to its page → read definition, formula plate, worked example.
3. Study a lesson → reveal steps one at a time → attempt embedded quiz → get graded feedback with explanations → retry until mastery.
4. Revisit a formula or glossary term directly; follow prerequisites backward when confused (`<Confused>` retry path).

## Negative journeys

- Quiz submitted with unanswered items stays disabled; wrong answers show explanation + non-color marking; retry resets to unanswered.
- Search with no match shows an honest empty state with next action; clear restores idle state.
- Private-mode storage failure degrades to non-persistent state and says so instead of crashing.
- Broken reference, missing section, or LaTeX escaping mistake fails the build/validator with the file and rule named — never a silently broken page.

## State / data transitions

- Authoring: draft content → `npm run validate` (frontmatter, sections, refs, LaTeX) → `npm run build` (Zod + KaTeX pre-render) → `dist/` static output → deploy by serving `dist/` (rollback = revert + redeploy).
- Learning (browser only, `localStorage` key `dr-study-progress:v1`): unanswered → answered → graded (score %) → retry resets; unmarked → done (homepage readout reflects it); unbookmarked → bookmarked. Nothing uploads anywhere.

## Boundary validation and authorization

- Untrusted input: all MDX content validated by Zod (`src/content.config.ts`) + `scripts/validate-content.mjs` (duplicate ids, dangling/ambiguous refs, fragment targets, declared sections, LaTeX trap). KaTeX runs with `trust: false`; `assertTeXIntact` throws on stripped backslashes.
- No auth model: static site, no accounts, no privileged operations (per `docs/PRODUCT.md`). Progress is local-only.
- Content rules enforced mechanically: `section` must exist in `course.ts` (glossary exempt); `type` matches directory; slugs lowercase kebab-case, unique per collection; `latex` in MDX body uses the expression container with doubled backslashes; frontmatter `latex` follows existing files (doubled inside double quotes — see conflict note below); clean `/lessons/...` links in prose (build applies base); fragments match `<Formula id>` in target.

## UI states, content, responsiveness

Per `docs/DESIGN.md` (illuminated-worksheet thesis, unchanged): `dir="rtl"`, `lang="fa"`, one `<h1>` per page; Persian numerals for UI counting; KaTeX wrapped in an LTR isolate; code blocks LTR inside their own scroll container (never widen the page); light + dark required; 360/390/430/768/1024/1360 viewports; touch ≥44px targets, visible focus, meaning never by color alone; motion 120–180ms with `prefers-reduced-motion` fallback; quiz/reveal/search/progress islands expose `data-hydrated` for proof. Required states: loading (search index), empty (search no-match), error/retry (quiz wrong, search failure), success (quiz scored/completed), disabled (submit-before-answering, reveal-before-attempt), focus, permission/offline (storage failure notice).

## Compatibility / migration / rollback

- Static `dist/` served from GitHub Pages or Cloudflare Pages; `BASE_PATH`/`SITE_URL` are the only build inputs. All internal links go through `withBase()`; verify with `BASE_PATH=/<repo> npm run build && BASE_PATH=/<repo> npm run validate:links`.
- Migration: one course per repo. Slice 1 replaces the calculus sample (see owner decision D1). Section-id renames break refs by design — the validator catches them before merge.
- Rollback: version control revert + redeploy. Content changes are additive after slice 1; no data migration (no server state).

---

## 1. Topic-to-content map (every seed topic mapped, no orphan, no duplicate)

Seed numbering follows the prompt (Ch.1: T1.1–T1.7; Ch.2: T2.1–T2.5). Each seed maps to exactly one primary lesson; supporting entries are listed. Splits are explicit (T1.5 stays one lesson by design).

| Seed | Topic (short) | Primary lesson | Supporting concepts | Supporting formulas | Worked examples | Practice / glossary |
|---|---|---|---|---|---|---|
| T1.1 | Algorithm: definition, 5 properties (zero+ inputs, ≥1 output, definiteness, finiteness, effectiveness), 3 swap variants, algorithm vs program (OS loop) | `what-is-an-algorithm` | `algorithm`, `program-vs-algorithm` | — | `swap-two-variables` | lesson Quiz A1 (≥4 Qs); glossary: الگوریتم، ورودی، خروجی، قطعیت، پایان‌پذیری، انجام‌پذیری |
| T1.2 | Data structure: math model + storage/retrieval; tree linear(static array; dynamic linked list, stack, queue) vs non-linear (tree, graph); static vs dynamic data; algorithm + structure thesis; ADT note (stack/queue implementable in arrays or linked lists; "dynamic" = typical linked implementation) | `what-is-a-data-structure` | `data-structure`, `static-data`, `dynamic-data`, `linear-structure`, `nonlinear-structure`, `abstract-data-type` | — | — (classification diagram via `<InteractiveFigure>`) | lesson Quiz A2; glossary: ساختمان داده، ایستا، پویا، خطی، غیرخطی + array/linked-list/stack/queue/tree/graph (intro senses only) |
| T1.3 | Comparing algorithms: time + memory; raw wall-clock unfair (machine, OS, memory management); machine-independent time/space order; problem size; basic (main) operation | `comparing-algorithms` | `problem-size`, `basic-operation`, `time-order`, `space-order` | — | — | lesson Quiz A3; glossary: اندازه مسئله، عمل اصلی، مرتبه زمانی، مرتبه مکانی |
| T1.4 | Sequential search (basic op = comparison; best 1, worst n, average (n+1)/2 present-and-uniform ⇒ Θ(n), never `O((n+1)/2)`); bubble sort comparisons n(n−1)/2 | `search-and-sort-costs` | `best-worst-average-case` | `sequential-search-counts`, `bubble-sort-comparisons` | `sequential-search-trace`, `bubble-sort-count` | lesson Quiz A4 (numeric: counts for given n); glossary: — |
| T1.5 | Loop analysis: arithmetic-step loops; logarithmic loops; independent nested; dependent nested (inner bound depends on outer, total n(n+1)/2); consecutive (dominant wins); nested with log part (n log n); O(1) body via update rule (`i %= 2`); constants don't affect order; exact counts with floor/ceiling first | `analyzing-loops` | `dominant-term-rule` (introduced here, reused T1.6) | `arithmetic-loop-count`, `geometric-loop-count`, `dependent-loop-sum` | `loop-count-worked` (covers arithmetic, log, `i %= 2` trap, dependent sum at n=4) | lesson Quiz A5; glossary: — |
| T1.6 | Growth hierarchy 1 < log n < n < n log n < n² < n³ < … < 2ⁿ < 3ⁿ < … < n!; dominant-term rule (n! + 2ⁿ + 1000n¹⁰ is O(n!)) | `growth-rate-hierarchy` | `dominant-term-rule` | `growth-hierarchy` | — (read from hierarchy table + numeric spot check) | lesson Quiz A6; glossary: — |
| T1.7 | Asymptotic notation O/Ω/Θ with formal (c, n₀) definitions + graphical meaning; proofs (n²+10n ∈ O(n²) c=2 n₀=10; ∈ Ω(n²) c=1 n₀=0); Θ = O ∩ Ω; T(n)=n(n−1)/2 ∈ Θ(n²) | `asymptotic-notation` | `big-o`, `big-omega`, `big-theta` | `big-o-definition`, `big-omega-definition`, `big-theta-definition`, `bubble-sort-theta` | `asymptotic-proof-worked` | lesson Quiz A7; glossary: اوی بزرگ، امگا بزرگ، تتا |
| T2.1 | Recursive function: direct/indirect, base vs recursive case; factorial recurrence + code; trace f(5)=120 ending …·2·1·f(0) | `recursion-and-factorial` | `recursive-function`, `base-case` | `factorial-recurrence` | `factorial-trace` | lesson Quiz B1; glossary: تابع بازگشتی، حالت پایه |
| T2.2 | Recursion tree: self-double-call on n−1; R(1)=1, R(6)=32; value 2^(n−1), total calls 2ⁿ−1; exponential growth | `recursion-tree-growth` | `recursive-function` (ref) | `doubling-recurrence` | `recursion-tree-trace` | lesson Quiz B2 (numeric: R(6), call count 63) |
| T2.3 | Operation counting inside recursion: multiply one recursive result by square of another; 8 multiplications for n=8 | `counting-recursive-operations` | — (refs B2 lesson) | — | `recursive-multiplication-count` | lesson Quiz B3 (numeric: 8) |
| T2.4 | Ackermann: 3-case definition; trace Ack(1,1)=3; why it grows fast | `ackermann-function` | `recursive-function` (ref) | `ackermann-definition` | `ackermann-trace` | lesson Quiz B4 (numeric: 3) |
| T2.5 | Classics: S(n)=0 (n=0), n+S(n−1) (n≥1); a^b; a·b by repeated addition; quotient/remainder by repeated subtraction; binomial via Pascal (m=0 or m=n), C(4,2)=6 with C(n,m) order (n on top) | `classic-recursive-definitions` | `base-case` (ref) | `binomial-pascal-rule`, `power-recurrence`, `sum-recurrence` | `binomial-coefficient-trace` (+ inline traces for sum/power/mult/divmod) | lesson Quiz B5 (numeric: C(4,2)=6, S(5)=15, 2⁵=32) |

Coverage check: 12/12 seed subtopics mapped; none orphan; none duplicated (T1.5 intentionally single-lesson; `dominant-term-rule` concept introduced in T1.5 and reused in T1.6 is a reference, not a duplicate mapping).

## 2. Slice plan (each slice independently buildable, validated, demonstrable)

- **Slice 1 — course scaffold + Chapter 1.** Config retitle to «ساختمان داده‌ها و الگوریتم‌ها» with section `foundations`; 7 lessons + all Ch.1 supporting entries; sample calculus content removed (D1); QA route lists updated to new slugs. Demo: homepage → full Ch.1 path with search, math, quizzes, progress.
- **Slice 2 — Chapter 2 (recursion).** Adds section `recursion`; 5 lessons + supporting entries; prerequisites point back into Ch.1 where real (recursion needs algorithm maturity). Demo: recursion path end-to-end including numeric quizzes (120, 32/63, 8, 3, 6) and LTR code blocks.
- **Later slices — roadmap chapters (owner-confirmed, not part of this release).** Labeled roadmap only: arrays & matrices (address computation, sparse matrices); stacks & queues (expression evaluation); linked lists; trees (binary, BST, AVL, heaps); graphs; sorting; searching & hashing. No placeholders, no empty sections created now.

## 3. Content inventory per slice

### 3.1 Course config (slice 1; slice 2 adds one section)

```ts
// src/config/course.ts (planned values)
title: 'ساختمان داده‌ها و الگوریتم‌ها'
tagline: 'از تعریف الگوریتم تا تحلیل مرتبه و بازگشت — قدم‌به‌قدم فارسی'
description: 'درس‌نامهٔ آزاد و قدم‌به‌قدم ساختمان داده‌ها و الگوریتم‌ها: هر ایده با مثال حل‌شده، هر فرمول با اثبات و هر عدد با اجرای کد.'
shortDescription: 'درس‌نامهٔ قدم‌به‌قدم ساختمان داده‌ها و الگوریتم‌ها'
locale: 'fa', direction: 'rtl', difficulty: 'beginner'
tags: ['ساختمان داده', 'الگوریتم', 'تحلیل الگوریتم', 'بازگشت']
category: 'آموزشی'
themePreset: 'programming'   // reversible default; D3
logo: { monogram: 'س', icon: 'layers' }  // D3
sections: [
  { id: 'foundations', title: 'مبانی و تحلیل الگوریتم', order: 1 },
  // slice 2 appends:
  // { id: 'recursion', title: 'بازگشت', order: 2 },
]
features: (omitted = all enabled)
```

### 3.2 Slice 1 — lessons (`section: foundations`)

| # | Slug | Objective (capability) | Prereqs | Refs (`concepts` / `formulas`) |
|---|---|---|---|---|
| 1 | `what-is-an-algorithm` | State the 5 properties and judge whether a procedure (incl. an OS loop) is an algorithm | — | concepts: `algorithm`, `program-vs-algorithm` |
| 2 | `what-is-a-data-structure` | Classify a structure as static/dynamic and linear/non-linear and justify the choice; explain stack/queue as ADTs | `what-is-an-algorithm` | concepts: `data-structure`, `static-data`, `dynamic-data`, `linear-structure`, `nonlinear-structure`, `abstract-data-type` |
| 3 | `comparing-algorithms` | Explain why wall-clock time is unfair and name problem size + basic operation for a task | `what-is-an-algorithm`, `what-is-a-data-structure` | concepts: `problem-size`, `basic-operation`, `time-order`, `space-order` |
| 4 | `search-and-sort-costs` | Compute best/worst/average comparisons for sequential search and bubble sort | `comparing-algorithms` | concepts: `best-worst-average-case`; formulas: `sequential-search-counts`, `bubble-sort-comparisons` |
| 5 | `analyzing-loops` | Derive exact loop counts with floor/ceiling, then simplify to order (incl. log loops and the `i %= 2` trap) | `comparing-algorithms` | concepts: `dominant-term-rule`; formulas: `arithmetic-loop-count`, `geometric-loop-count`, `dependent-loop-sum` |
| 6 | `growth-rate-hierarchy` | Order 1 < log n < n < n log n < n² < n³ < … < 2ⁿ < 3ⁿ < … < n! and apply the dominant-term rule | `analyzing-loops` | concepts: `dominant-term-rule`; formulas: `growth-hierarchy` |
| 7 | `asymptotic-notation` | Prove O/Ω/Θ bounds by exhibiting (c, n₀) and read them graphically | `growth-rate-hierarchy` | concepts: `big-o`, `big-omega`, `big-theta`; formulas: `big-o-definition`, `big-omega-definition`, `big-theta-definition`, `bubble-sort-theta` |

### 3.3 Slice 1 — supporting entries (all `section: foundations` except glossary)

Concepts (each: `short` one-liner; `formulas` only where listed): `algorithm`, `program-vs-algorithm`, `data-structure`, `static-data`, `dynamic-data`, `linear-structure`, `nonlinear-structure`, `abstract-data-type`, `problem-size`, `basic-operation`, `time-order`, `space-order`, `best-worst-average-case`, `dominant-term-rule`, `big-o`, `big-omega`, `big-theta`.
Formulas (each: `name` + `latex` + `conditions` where validity matters): `sequential-search-counts` (`(n+1)/2`, conditions: key present, uniform position), `bubble-sort-comparisons` (`n(n-1)/2`), `arithmetic-loop-count` (⌊(b−a)/k⌋+1, b≥a), `geometric-loop-count` (⌊log_k(b/a)⌋+1, a≥1 k≥2), `dependent-loop-sum` (n(n+1)/2), `growth-hierarchy`, `big-o-definition`, `big-omega-definition`, `big-theta-definition`, `bubble-sort-theta` (T(n)=n(n−1)/2 ∈ Θ(n²)).
Examples (each: `problem` + optional `formula`): `swap-two-variables` (three methods incl. overflow/divide-by-zero warnings), `sequential-search-trace`, `bubble-sort-count`, `loop-count-worked`, `asymptotic-proof-worked` (→ `bubble-sort-theta`).
Questions: `practice-foundations` (`section: foundations`, summative set, ≥6 Qs, `points`, `instructions` in Persian).
Glossary (no section; `term` + `short` + `group`): group «مبانی»: الگوریتم، ورودی، خروجی، قطعیت، پایان‌پذیری، انجام‌پذیری، ساختمان داده، ایستا، پویا، خطی، غیرخطی، اندازه مسئله، عمل اصلی، مرتبه زمانی، مرتبه مکانی; group «تحلیل»: اوی بزرگ، امگا بزرگ، تتا; intro-sense entries (group «مبانی»): آرایه، لیست پیوندی، پشته، صف، درخت، گراف. Full ADT/implementation teaching stays in roadmap slices; these entries say what each structure is in one sentence and link forward without duplicating roadmap lessons.

### 3.4 Slice 2 — lessons (`section: recursion`)

| # | Slug | Objective (capability) | Prereqs | Refs |
|---|---|---|---|---|
| 1 | `recursion-and-factorial` | Write direct/indirect recursion with a correct base case and trace factorial to 120 | `what-is-an-algorithm` | concepts: `recursive-function`, `base-case`; formulas: `factorial-recurrence` |
| 2 | `recursion-tree-growth` | Trace a doubly-recursive tree and count value 32 vs 63 total calls for R(6) | `recursion-and-factorial` | concepts: `recursive-function`; formulas: `doubling-recurrence` |
| 3 | `counting-recursive-operations` | Count multiplications inside a recursive body (8 for n=8) | `recursion-tree-growth` | example: `recursive-multiplication-count` |
| 4 | `ackermann-function` | Evaluate Ack(1,1)=3 from the 3-case definition and explain its growth | `recursion-and-factorial` | formulas: `ackermann-definition` |
| 5 | `classic-recursive-definitions` | Write sum/power/multiply/divmod/binomial recurrences with correct base cases; evaluate C(4,2)=6 with C(n,m) order | `recursion-and-factorial` | concepts: `base-case`; formulas: `sum-recurrence`, `power-recurrence`, `binomial-pascal-rule` |

Supporting: concepts `recursive-function`, `base-case` (`section: recursion`); formulas `factorial-recurrence`, `doubling-recurrence`, `ackermann-definition`, `sum-recurrence`, `power-recurrence`, `binomial-pascal-rule`; examples `factorial-trace`, `recursion-tree-trace`, `recursive-multiplication-count`, `ackermann-trace`, `binomial-coefficient-trace`; questions `practice-recursion` (summative, ≥6 Qs); glossary group «بازگشت»: تابع بازگشتی، حالت پایه (+ cross-links to اوی بزرگ/تتا where reused).

Cross-reference integrity: every `prerequisites`/`formulas`/`concepts`/`formula` value resolves to a shipped entry (bare slug only when globally unique, else `<kind>/<slug>`); every `#fragment` matches a `<Formula id>` in the target page; prose links use clean `/lessons/...` paths (base applied at build).

## 4. Pedagogy rules (every lesson)

Structure: motivating problem → intuition → formal definition (`<Definition>`) → formula plates (`<Formula>` + `<FormulaBreakdown>` with units/`conditions`) → worked example (`<WorkedExample>` or `<StepReveal>`, steps reveal one at a time) → `<Misconception>` or `<Confused>` rescue where genuinely hard (mandatory: case-vs-bound trap T1.4; floor/ceiling + `i %= 2` T1.5; dominant-term T1.6; (c,n₀) proofs T1.7; base-case T2.1; exponential calls T2.2; Ackermann T2.4; C(n,m) order + S(n) domain T2.5) → recap → embedded `<Quiz id="quiz-<lesson-slug>">`.
Quiz: ≥4 questions per lesson mixing `multiple-choice`, `true-false`, and `numeric` (Persian digits accepted, `tolerance` where apt); every question carries an `explanation` shown on a wrong answer; action labels imperative («بررسی پاسخ‌ها»، «گام بعدی را ببینید»). One idea per lesson; `objective` phrased as capability. Preferred Persian terminology used consistently, English term in parentheses on first use per lesson (الگوریتم، ورودی، خروجی، قطعیت، پایان‌پذیری، انجام‌پذیری/کارایی، ساختمان داده، ایستا، پویا، خطی، غیرخطی، اندازه مسئله، عمل اصلی، مرتبه زمانی، مرتبه مکانی، اوی بزرگ (Big-O)، امگا بزرگ (Big-Omega)، تتا (Big-Theta)، تابع بازگشتی، حالت پایه). Code in C-style pseudocode, LTR code blocks; math via `<Formula>` only (never `\(…\)`); no institutional context.

## 5. Verification plan

### 5.1 Canonical commands (from `docs/AI-CONTENT-PROMPT.md` §8 + `docs/QUALITY.md`)

```bash
npm run validate          # frontmatter, sections, references, LaTeX escaping
npm run test              # unit tests (quiz grading, related links, math safety)
npm run build             # static build; must succeed with no new warnings
npm run budgets           # JS/CSS/HTML budgets; zero KaTeX runtime
npm run validate:links    # internal links in built output (needs dist/)
npm run check             # validate + typecheck + lint + test + build + test:dist + links + budgets
BASE_PATH=/<repo> npm run build && BASE_PATH=/<repo> npm run validate:links  # project-site reproduction
npm run preview           # serve dist/ in another terminal, then:
node scripts/visual-qa.mjs        # routes × viewports + overflow/console/h1/dir/TeX checks
node scripts/interaction-qa.mjs  # quiz, reveal, search, progress, theme, mobile nav
```

No new permanent tests by default (`docs/QUALITY.md` Test Value Gate). Prefer existing `tests/unit/build-output.test.ts` + the two browser scripts for rendering/layout questions. Add a regression test only for a plausible consumer-visible failure with an independent oracle and red-before-green (or focused-mutation) evidence.

### 5.2 Execution-based verification of every numeric claim (throwaway scripts; run, don't assert from prose)

| Claim | Compute (how) |
|---|---|
| Swap variants preserve values (add/sub, temp, mul/div + zero/division warnings) | Execute the three swaps in Python/JS for several pairs incl. negatives; show before/after |
| Sequential search: best 1, worst n, average (n+1)/2 (present, uniform) | Instrument comparison counter; run all key positions for n=1,5,10; average the counts |
| Bubble sort comparisons = n(n−1)/2 (e.g. n=5 → 10) | Instrumented bubble run for n=1,2,5,10; compare counter vs closed form |
| Arithmetic loop `i=a..b step k` runs ⌊(b−a)/k⌋+1 (b≥a) | Brute-force counter vs formula over a grid of (a,b,k) incl. non-divisible steps |
| Geometric loop `i=a..b step ×k` runs ⌊log_k(b/a)⌋+1 (a≥1,k≥2) | Counter vs formula over grid incl. non-powers |
| Dependent nested total = n(n+1)/2 (e.g. n=4 → 10) | Counter vs formula for n=0..10 |
| `i %= 2` loop body is O(1) (bounded update) | Execute and show iteration values cycle in {0,1}; count is loop-bound, body constant |
| Dominant-term: 1000n¹⁰ vs 2ⁿ vs n! at large n; n!+2ⁿ+1000n¹⁰ ∈ O(n!) | Evaluate ratios at n=10,20,50 (bigints); show factorial dominance |
| O proof n²+10n, c=2, n₀=10; Ω proof c=1, n₀=0; T(n)=n(n−1)/2 ∈ Θ(n²) | Direct inequality checks over n₀..N + residual plots/values |
| Factorial trace f(5)=120 ending …·2·1·f(0) | Recursive run with call log; assert log tail and product |
| R(1)=1, R(6)=32; value 2^(n−1); total calls 2ⁿ−1 (63 for n=6) | Memo-free recursion with call counter for n=1..8 |
| Multiplication-count function → 8 for n=8 | Execute with operation counter; assert 8 |
| Ack(1,1)=3 from 3-case definition | Execute Ackermann (small args only); assert trace equals hand trace |
| S(5)=15 with S(0)=0, S(n)=n+S(n−1) for n≥1 | Execute for n=0..10; assert closed form n(n+1)/2 |
| a^b, a·b by repeated addition, divmod by repeated subtraction | Execute vs native operators over small grids incl. edge cases (×0, ÷exact/remainder) |
| C(4,2)=6 via Pascal, C(n,0)=C(n,n)=1, n-on-top order | Execute Pascal recursion + closed form for small table; assert C(4,2)=6 and argument-order guard |

### 5.3 Real-browser checks (RTL, math, code, quiz, navigation; desktop + mobile)

- `visual-qa`: all shipped routes × 360/390/430/768/1024/1360, light + dark. Assert per page: `dir=rtl`, `lang=fa`, exactly one `<h1>`, no page-level horizontal overflow, zero console errors/failed requests, KaTeX pre-rendered (`.katex`/`.mfrac` present where math expected), no stripped-TeX text (`frac`/`sqrt`/`cdot` leak regex), creator identity present, no institutional branding.
- `interaction-qa`: quiz (disabled-before-answering → enabled → graded % → retry resets; wrong run marks + explains; Persian-digit numeric accepted; score persists across reload), StepReveal one-at-a-time + all + reset, search (Persian + Arabic-keyboard query, empty state, clear, idle), progress/bookmark persist + homepage readout, theme toggle persists without flash, mobile nav open/navigate at 360px.
- Manual captures: one lesson with heavy math at 360 + 1360 (reading rail, formula plate, no overflow), one recursion lesson with LTR code blocks (code stays LTR inside RTL page), one practice page quiz flow at 390px, search at 360/1024. 200% zoom spot-check on a lesson.

## 6. Acceptance criteria per slice (criterion → proof)

### Slice 1 (scaffold + Ch.1)

- A1 Course identity switched: homepage/hero/brand show «ساختمان داده‌ها و الگوریتم‌ها» with `programming` preset + `س`/`layers` mark, no calculus residue → proof: `npm run build` + `visual-qa` home capture at 390/1360 showing title; `grep` of `dist/` for old course title returns nothing (besides changelog/history if any).
- A2 All 7 Ch.1 lessons + supporting entries ship with valid refs: `npm run validate` passes with zero errors; every T1.1–T1.7 maps to a shipped lesson (mapping table §1) → proof: validator output + `npm run build` exit 0.
- A3 Every numeric claim in Ch.1 reproduced by execution (swap, search counts, bubble n(n−1)/2, loop-count grids, n! dominance, (c,n₀) proofs) → proof: throwaway script outputs pasted into slice report (commands + observed values), not prose assertions.
- A4 Pedagogy bar holds on all 7 lessons: one idea, capability objective, motivating problem → definition → worked example → misconception/confused where mandated → recap → ≥4-question mixed quiz with explanations → proof: `interaction-qa` quiz checks pass on both practice + sampled lesson quizzes; validator shows no missing `objective`/`explanation`.
- A5 Real-browser RTL/math/code quality: `visual-qa` passes all Ch.1 routes × 6 viewports light+dark (rtl, h1=1, no overflow, no console errors, KaTeX rendered, no TeX leak); LTR code/Formula blocks scroll internally at 360px → proof: `report.json` + screenshots.
- A6 Budgets + links clean: `npm run budgets`, `npm run validate:links`, and project-site reproduction (`BASE_PATH=/<repo>`) pass → proof: command outputs.

### Slice 2 (recursion)

- B1 Section `recursion` + 5 lessons ship; all T2.1–T2.5 mapped; prereqs/refs/fragments resolve → proof: `npm run validate` + `npm run build` clean.
- B2 Canonical recursion numbers verified by execution: f(5)=120 with …·2·1·f(0) tail; R(6)=32 with 63 total calls; mult-count(8)=8; Ack(1,1)=3; C(4,2)=6 with C(n,m) order; S(n) recursive branch stated for n≥1 → proof: runner outputs + hand-trace match in `ackermann-trace`/`binomial-coefficient-trace`/`factorial-trace`.
- B3 Correctness traps visible in prose: case-vs-bound separation (average Θ(n), never `O((n+1)/2)`); floor/ceiling loop formulas with side conditions; ADT-vs-implementation note for stack/queue → proof: quoted file:line pointers in slice report + `visual-qa` text check (no `O((n+1)/2)` string in `dist/`).
- B4 Lesson quizzes + summative `practice-recursion` grade correctly incl. Persian digits and retry/persistence → proof: `interaction-qa` quiz/progress checks pass on recursion routes.
- B5 No roadmap leakage: no arrays/trees/graphs/sorting pages or empty sections exist; roadmap lives only in this contract → proof: content file listing + `visual-qa` route list contains only Ch.1–Ch.2 slugs.

## 7. Owner decisions (material only; safe defaults chosen inline)

- D1 Existing calculus sample removal (destructive): default slice 1 deletes sample entries made obsolete by cutover (`01-intro-to-calculus`, `limit`, `derivative`, `definition-of-derivative`, `chain-rule`, `chain-rule-example`, `practice-foundations`, 4 glossary files) and regenerates scaffold via `npm run new:course --force`-equivalent edit. Confirm, or order archive-as-draft instead.
- D2 Roadmap scope/order for later slices (arrays/matrices, stacks/queues, linked lists, trees, graphs, sorting, searching/hashing): confirm set and sequence before any slice 3 plan.
- D3 Theme/logo confirmation: `programming` preset + monogram `س` + `layers` icon (reversible one-line change). Confirm or supply alternative.
- D4 Deployment values (`BASE_PATH`, `SITE_URL`) and license choice: no action in slices; owner supplies at ship time. No license is selected by agents.

## Docs read; conflicts found

Read: `AGENTS.md`, `docs/HARNESS.md`, `docs/exec-plans/README.md`, `docs/AI-CONTENT-PROMPT.md`, `docs/CONTENT-CONTRACT.md` (incl. §§8–12), `README-COURSE.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN.md`, `docs/QUALITY.md`, `src/config/course.ts`, `src/config/site.ts`, `src/content.config.ts`, `src/lib/types.ts`, `src/lib/themes.ts`, `scripts/validate-content.mjs`, `scripts/visual-qa.mjs`, `scripts/interaction-qa.mjs`, `package.json` scripts, one file of each content kind (`lessons/01-intro-to-calculus.mdx`, `concepts/limit.mdx`, `concepts/derivative.mdx`, `formulas/chain-rule.mdx`, `formulas/definition-of-derivative.mdx`, `examples/chain-rule-example.mdx`, `questions/practice-foundations.mdx`, `glossary/rate-of-change.mdx`, `glossary/critical-point.mdx`, `glossary/differentiability.mdx`).

- Conflict C1 (LaTeX in YAML frontmatter): `CONTENT-CONTRACT.md` §5 says single backslashes are correct in YAML, while `AI-CONTENT-PROMPT.md` §3 says doubled backslashes are correct inside double quotes (YAML unescapes once) and to match existing files. Existing files use doubled (`latex: "\\frac{…}"`). Single-backslash form is unsafe in double-quoted YAML for sequences like `\f`. Resolution for slices: follow the prompt + existing files (doubled inside double quotes); flag `CONTENT-CONTRACT.md` §5 for a one-line docs fix. Not silently chosen — recorded here.
- `docs/PRODUCT.md` placeholders: checked — none remain (Users/MVP/Non-goals are fully specified); no bootstrap edit needed.
- Precondition (not a doc conflict): `visual-qa`/`interaction-qa` hardcode calculus slugs; slices must update those route lists or invoke with explicit `--route`/`--base` to prove equal coverage.

## Re-verification against seeds and docs

Re-read this contract against the 12 seed subtopics: T1.1→`what-is-an-algorithm`; T1.2→`what-is-a-data-structure`; T1.3→`comparing-algorithms`; T1.4→`search-and-sort-costs`; T1.5→`analyzing-loops`; T1.6→`growth-rate-hierarchy`; T1.7→`asymptotic-notation`; T2.1→`recursion-and-factorial`; T2.2→`recursion-tree-growth`; T2.3→`counting-recursive-operations`; T2.4→`ackermann-function`; T2.5→`classic-recursive-definitions`. Zero unmapped seeds. All correctness traps and known results from the prompt are carried (§1 table notes, §5.2, B2–B3). Contract uses only existing collections, components, islands, directives, and validation rules evidenced above; no new architecture, schema, or UI convention invented.
