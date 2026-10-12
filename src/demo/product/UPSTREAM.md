# Sillage Web UI snapshot

Source repository: https://github.com/getsillage/sillage

Source directory: `sillage/apps/web/src`

Source commit: `3e2994ddf3325b4af63e944b1fdbcfc0ccca1520`

This directory contains 37 production TypeScript, TSX, and CSS files copied byte for byte from the actual Sillage Web UI. Test files, test directories, and the upstream `main.tsx` entry are excluded. Do not edit the copied source files.

The website demo entry and its local data/API adapters live outside this snapshot. They supply the fictional demo account and records while the snapshot renders the actual product UI.

The static brand resource referenced by the source, `/sillage-icon.svg`, is shared through `website/public`. Markdown attachment and image URLs come from record content and are supplied by the outer demo adapter.

Refresh from the website repository with:

```sh
node scripts/sync-demo-product.mjs
# Or provide the path to a local Sillage Web source checkout:
node scripts/sync-demo-product.mjs /path/to/sillage/apps/web/src
```

The script updates this revision, copies the production source unchanged, removes obsolete copied source files, and updates the required brand resource only when its bytes differ.
