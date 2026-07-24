# Mustache

A lightweight VS Code / Cursor extension that shows a dot in your status bar when you have stashed git changes.

**Blue dot** = stashes exist. **Gray dot** = no stashes.

![mustache demo](https://raw.githubusercontent.com/parsasabetz/mustache/main/assets/demo.png)

## Why?

You stash some changes, forget about them, and never come back. Mustache makes sure you don't.

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

Press `F5` to launch the Extension Development Host.

## Build

```bash
pnpm run compile
pnpx @vscode/vsce package
```

## License

[MIT](LICENSE)
