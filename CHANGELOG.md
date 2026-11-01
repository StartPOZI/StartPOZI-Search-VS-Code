# Change Log

All notable changes to the "StartPozi Search" extension will be documented in this file.

## [0.1.5]

- README and all extension strings are now in English.
- Updated the repository URL.

## [0.1.4]

- "StartPOZI: Search in Code" now works via right-click on a word without selecting it (word under the cursor).
- The `startpozi.openIn` setting now has clear Russian descriptions (integrated browser vs external program).

## [0.1.3]

- New command "StartPOZI: Search in Code" (`Ctrl+Shift+2`): search the selected text (or a typed query) across all workspace files using the built-in VS Code Search.

## [0.1.2]

- Extension renamed to "StartPOZI Search".
- Removed the editable URL setting — the search URL is now built in and cannot be changed from settings.
- README cleanup.

## [0.1.1]

- Added the extension icon (StartPozi logo).

## [0.1.0]

- Initial release.
- Search from the command palette (`Ctrl+Shift+1`), pre-filled with the current selection.
- Search the selected text from the editor context menu.
- Results open in the VS Code Integrated Browser (`workbench.action.browser.open`),
  with fallback to Simple Browser and then the system browser.
- Configurable query template (`startpozi.queryTemplate`).
- "Open StartPozi" command.
