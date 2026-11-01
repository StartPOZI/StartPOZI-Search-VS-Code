# StartPOZI Search

Search with [startpozi.com](https://startpozi.com) straight from VS Code.
Results open in the built-in VS Code browser.

## Download & Install

Download the latest `startpozi-search-*.vsix` from
[**Releases**](https://github.com/StartPOZI/StartPOZI-Search-VS-Code/releases),
then install it:

```bash
code --install-extension startpozi-search-0.1.5.vsix
```

Or in VS Code: Extensions view (`Ctrl+Shift+X`) → `···` → **Install from VSIX...**

## Features

| Command | What it does |
|---|---|
| **StartPOZI: Search** (`Ctrl+Shift+1` / `Cmd+Shift+1`) | Asks for a query and searches it with StartPOZI. If text is selected in the editor, it is pre-filled automatically |
| **StartPOZI: Search Selection** | Searches the selected text (editor context menu item). If nothing is selected, asks for a query |
| **StartPOZI: Search in Code** (`Ctrl+Shift+2` / `Cmd+Shift+2`) | Searches across all files of the workspace. Just right-click a word — no selection needed. If text is selected, the selection is searched |
| **StartPOZI: Open StartPOZI** | Opens the startpozi.com home page |

The search URL is built as `https://startpozi.com/search?q=<query>`,
with the query URL-encoded (spaces → `+`), just like in regular browsers.

## Where results open

The `startpozi.openIn` setting:

- **`integrated`** (default) — results open inside VS Code:
  1. the VS Code Integrated Browser;
  2. the built-in Simple Browser — for older VS Code versions;
  3. the system browser — if neither is available.
- **`external`** — always open in an external program (the default system browser: Chrome, Firefox, StartPOZI Browser, etc.).

## About the built-in browser's Search Engine setting

The VS Code built-in browser has an address bar search engine setting
(`workbench.browser.searchEngine`), but its allowed values
(`bing`, `google`, `yahoo`, `duckduckgo`, `none`) are hardcoded in the VS Code
source code, and extensions cannot add their own engine there — this is a
platform limitation.

This extension solves it differently: StartPOZI commands open the search
results directly in the integrated browser, which is practically the same as
changing the default search engine.
