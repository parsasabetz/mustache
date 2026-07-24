# Mustache

I forget things, so a lightweight VS Code / Cursor extension that shows a dot in your status bar when you have stashed git changes, helps me and maybe it helps ya too.

**Blue dot** = stashes exist. **Gray dot** = no stashes.

## Why?

You stash some changes, forget about them, and never come back, maybe even do extra work later. At least I sometimes do.

## Features

- Blue/gray dot indicator in the status bar
- Updates instantly when stashes change (via `.git/refs/stash` file watching)
- Click the dot to manually refresh
- Multi-root workspace support
- Zero configuration

## Install

Search for **"Mustache"** in the VS Code / Cursor extensions marketplace, or install the `.vsix` from [Releases](https://github.com/parsasabetz/mustache/releases).

## Development

```bash
pnpm install
pnpm run compile
```

## Build

```bash
pnpm run compile
pnpx @vscode/vsce package
```

## License

[MIT](LICENSE)
