---
name: fe-polish
description: Improve the visual polish of an existing frontend feature or page — spacing, typography, color, responsive layout, interactive states, accessibility — without changing business logic or adding new dependencies
argument-hint: [feature-name or page/component path]
---

Improve the visual design of `$ARGUMENTS`. This is a polish pass on **existing, working** UI — if the feature doesn't exist yet, stop and say so; use `/fe-feature` to build it first, not this skill.

## Before touching anything
1. Read `frontend-reactJs-vite/docs/FE-ARCHITECTURE.md` and `frontend-reactJs-vite/docs/FE-PROJECT-RULES.md` §4 (Component Rules), §6 (Anti-patterns).
2. Read `frontend-reactJs-vite/src/styles/globals.css` and `frontend-reactJs-vite/src/shared/components/` — reuse whatever tokens/components already exist instead of inventing new ones. If two features already style the same kind of element differently, flag the drift instead of adding a third variant.
3. Open the target feature's `context.md` (if present) to understand what the UI is actually for — don't restyle based on guesses about the feature's purpose.

## Design tokens — establish once, reuse everywhere
If `globals.css` has no custom theme yet, define one via Tailwind v4's `@theme` block (colors, radius, shadow) rather than sprinkling raw hex/px values through components:
```css
@import "tailwindcss";

@theme {
  --color-brand-50: ...;
  --color-brand-600: ...;
  --radius-card: 0.75rem;
}
```
Every component after that consumes the tokens (`bg-brand-600`, `rounded-card`) — never `style={{ color: '#...' }}` or one-off hex classes (`FE-PROJECT-RULES.md` §6 anti-pattern table already forbids this).

## Polish checklist
Work through this for the target feature; skip items that don't apply rather than forcing changes:

- **Hierarchy & spacing** — consistent spacing scale (Tailwind's default `4px` steps), clear visual grouping, no cramped or arbitrary `mt-[13px]` values.
- **Typography** — one type scale for the whole app (heading sizes, body, caption); avoid ad-hoc `text-[15px]`.
- **Color & contrast** — WCAG AA contrast for text on backgrounds; semantic colors for success/error/warning states, not arbitrary greens/reds per component.
- **Interactive states** — every clickable element has `hover:`, `focus-visible:`, `active:`, and `disabled:` styling; focus rings must stay visible (never `outline-none` without a replacement).
- **Loading / empty / error states** — loading via `shared/components/Skeleton`, not blank screens; empty states have a message + next action, not a bare "no data"; errors surface via `react-hot-toast` per `FE-PROJECT-RULES.md` §5, not silent failure.
- **Responsiveness** — mobile-first; verify the layout at `sm`/`md`/`lg` breakpoints, not just desktop width.
- **Motion** — subtle `transition-colors`/`transition-transform` on interactive elements only; nothing that fights `prefers-reduced-motion`.
- **Dark mode parity** — if `dark:` variants exist elsewhere in the app, the touched components must support them too, not regress to light-only.
- **Consistency over novelty** — prefer extending `shared/components/` (Button, Modal, Skeleton) over one-off component-local styling; if a pattern repeats 3+ times across features, propose promoting it to `shared/components/` instead of copy-pasting again.

## Constraints (MUST NOT)
- No changes to business logic, data fetching, hooks, or service calls — this is styling/markup only. If a visual fix genuinely requires a logic change (e.g. missing loading state in a hook), name it and ask before touching the hook.
- No new npm dependencies (icon libraries, animation libraries, UI kits) without asking first — check `package.json` before assuming something isn't installed.
- Stay within the ≤~150 line component budget (`FE-PROJECT-RULES.md` §4) — extract a sub-component instead of growing one file.
- Tailwind utility classes only, per the existing convention — no new `.css`/`.module.css` files unless the change is genuinely too complex for utilities (rare; ask first).

## After polishing
Run the dev server (`npm run dev`) and actually look at the changed page/component in a browser — at minimum the golden path and one narrow viewport — before reporting done. Run `npm run lint` and `npm run build` to confirm nothing broke. Report what changed and why, and flag any repeated pattern you think belongs in `shared/components/` instead.
