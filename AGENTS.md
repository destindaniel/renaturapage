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

- Ocean data: live provider calls live only in src/lib/ocean.functions.ts (server functions); the dataset catalogue in src/lib/catalog.ts holds real provider metadata only — never invent values or fill gaps.
- Single-page dashboard: all modules live in src/components/sections and render as tabs on "/" (?tab=...); old routes only redirect there, so new modules go in a section + tab, not a new page.
- Brand assets: use the uploaded logo through its CDN pointer in shared site branding and derive the public favicon from that same original; keep theme colors in global semantic tokens so all dashboard modules remain consistent.
