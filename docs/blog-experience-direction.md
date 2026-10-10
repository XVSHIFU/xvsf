# Blog experience · approved direction

Keep Hugo + PaperMod + GitHub Pages at /xvsf/, the configured avatar, “她和她的猫”, and the site's blue/pink reading identity. Public reading and the author workbench have separate visual scopes.

## First viewport

Home keeps its short introduction, existing avatar, real nine-part Coding Agent learning route and recent article descriptions. Secondary navigation belongs in More. The avatar rotates 360 degrees over one second and links to About. Use an SVG chevron inside the 34px More control and align the search, terminal and theme controls with 20 × 20px icons. Preserve the narrow-screen layout.

## Reading and discovery

Show the actual chapter order from data/reading_series.json. Keep descriptions, code filenames and folding, inline explanations, link previews and backlinks grounded in real content. Public notes are author content managed through the existing workbench and PR flow. Friend subscriptions are collected at build time; empty or unavailable sources are reported honestly.

## Implementation boundaries

The main site serves readers; /admin/ serves authoring. Preserve the existing terminal reading extension. Do not invent friends, author notes or activity. User/feed text is not executable HTML. Maintain visible inner focus, accessible names, touch access, useful empty/error states and subpath compatibility. Honor reduced motion and retain static reading without JavaScript.

## References and reuse

References: [PaperGrid](https://github.com/xywml/PaperGrid), [Wakusei](https://github.com/wakusei0413/WakuseiHomePage), [Quartz](https://quartz.jzhao.xyz/), [Nutshell](https://github.com/ncase/nutshell) and [Expressive Code](https://expressive-code.com/). Their personal content and compiled bundles are not part of the reuse scope. Preserve the existing Joye attribution and license.

## Maintenance

Root DESIGN.md holds source-backed YAML tokens; .impeccable/design.json is the schemaVersion 2 extension with three blog component samples. PRODUCT.md and docs/blog-experience.md describe current capabilities and development. workbench/DESIGN.md remains separate. Local review uses port 4320 from E:/MyBlog2.0/xvsf-experience/.preview-site; publishing requires the normal repository workflow.
