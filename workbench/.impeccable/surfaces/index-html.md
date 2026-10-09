---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: ["app.mjs","style.css"]
---

# Vditor writing workbench

Scope: a local, reversible trial of a browser writing workspace. Operate mode. The user explicitly chose a SiYuan/VS Code-like workbench and notebooks grouped by article category. Existing article files are copied read-only; article edits persist in this browser only. The current extension adds article properties, conflict recovery, and direct image uploads to the user's GitHub Picture-bed repository when the user configures a token and selects/pastes/drops images. Article synchronization now writes dedicated workbench branches and opens or updates PRs; main requires PR review and merge. The static workspace is included in the Pages build, while deployment itself is a separate repository operation. Automated upload validation uses mocked GitHub endpoints, with no real image commits.

## Direction contract

THESIS: Organize the existing blog as category notebooks and keep several articles within reach while writing. The user's requested workbench structure governs this narrowly scoped prototype.

OWN-WORLD: Inherit the blog's quiet typography and text-first character in an editor layout. Neutral dark and light surfaces, restrained blue selection, 1px panel separators, system sans UI text, monospace only for paths and code. No marketing hero or decorative cards.

STORY: Open a category, select an article, switch tabs, edit in Vditor, and see explicit local-save feedback. Export a Markdown copy when desired. A supplied welcome document is clearly an experience sample.

Extension: Preserve the existing workbench. Add a native modal for image-bed settings, another for article properties, transient upload notifications and an on-demand upload-history popover with retry feedback, and a persistent conflict-recovery notice. Credentials stay in page memory; ordinary settings may persist. On simultaneous saves, preserve a separate recovery draft instead of replacing the other window's version. Images completing after a tab switch return to the original article.

FIRST VIEWPORT: A compact 42px web navigation bar with right-aligned search (up to 240px wide) above a 280px notebook sidebar, a horizontally scrollable tab strip and a wide writing surface. Vditor provides the toolbar and an optional right outline. New article and sync actions remain visible; export is in the article menu. Below 760px the notebook sidebar becomes a dismissible drawer. A bottom status bar distinguishes local draft storage from GitHub publication.

FORM: User-pinned editor workbench; code-led functional extension, no open visual-direction selection or seed applies. Signature interaction is category-to-tab navigation with shared document identity across categories. Motion is limited to responsive panel transitions and state feedback.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Validation: exact untouched Markdown export; Front Matter preserved on body edits; category grouping does not move files; switching and reopening retains edits; desktop and narrow-screen usability. Browser automation plugin bootstrap is unavailable, so isolated local headless testing may be used.

Local workflow extension (v3): Preserve the current workbench and add import/management controls in the sidebar, a filename field in article properties, and history/trash actions in a small article menu. Focused dialogs handle batch category changes, reversible trash, backup restore as new copies, and history restoration. A wide preview dialog renders an actual local Hugo build from an isolated temporary project on a separate loopback origin. Local preview creates no article commits. Explicit GitHub synchronization is separate from preview and auto-save. Backup contains local drafts, trash and bounded history, never credentials. Test imports are explicitly named QA samples. New management row text is 14px and secondary details/preview hints are 12px; the hook's new tiny-text finding was corrected, with no ignore rule. The navigation is now 42px, and the compact article header is about 58px; manual save lives in the article menu.

GitHub extension: preserve the compact shell. Add connection settings, explicit save confirmation and a two-version conflict dialog. Reuse native dialog, field, toast and button styles. Pending PRs are read across devices, and the status bar distinguishes local persistence, GitHub persistence and publication. Pages uses a script-disabled Markdown preview; local mode retains isolated Hugo preview.
