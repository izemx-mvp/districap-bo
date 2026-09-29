<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules

- All back-office data lives in `src/lib/mock-data.ts` and is mutated through the localStorage-backed context in `src/lib/store.tsx`; no backend is used because this is a front-end-only demo.
- Every admin page is a route under `src/routes/` wrapped in `AppShell`, which also enforces the demo auth guard, so navigation and access stay consistent.
- Lists reuse `src/components/data-table.tsx` and page chrome reuses `src/components/ui-bits.tsx` to keep search, filters, and headers identical across modules.
