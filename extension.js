'use strict';

const vscode = require('vscode');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CFG_SECTION = 'startpozi';
const CFG_OPEN_IN = 'openIn';

/** Base StartPOZI search URL. The encoded query is appended to it. */
const SEARCH_URL = 'https://startpozi.com/search?q=';
const STARTPOZI_HOME = 'https://startpozi.com';

const EMPTY_QUERY_MESSAGE = 'Nothing to search: the query is empty.';

/**
 * Commands that can open a URL inside VS Code, in order of preference.
 *
 * 1. `workbench.action.browser.open` — the Integrated Browser in modern VS Code
 *    (same browser behind `workbench.browser.searchEngine`). Accepts a URL string.
 * 2. `simpleBrowser.show` — the built-in Simple Browser extension, available in
 *    older VS Code versions. Accepts a URL string.
 *
 * Availability is detected at runtime, so the extension works on any version.
 */
const INTEGRATED_BROWSER_COMMANDS = [
	'workbench.action.browser.open',
	'simpleBrowser.show'
];

/** VS Code built-in "Find in Files" (Search across all workspace files). */
const FIND_IN_FILES_COMMAND = 'workbench.action.findInFiles';

// ---------------------------------------------------------------------------
// Configuration helpers
// ---------------------------------------------------------------------------

function getConfig() {
	return vscode.workspace.getConfiguration(CFG_SECTION);
}

// ---------------------------------------------------------------------------
// URL building
// ---------------------------------------------------------------------------

/**
 * Encode a search query the way browsers do: `encodeURIComponent`,
 * then spaces as `+`.
 */
function encodeQuery(query) {
	return encodeURIComponent(query).replace(/%20/g, '+');
}

/**
 * Build the StartPOZI search URL for a query.
 */
function buildSearchUrl(query) {
	return SEARCH_URL + encodeQuery(query);
}

// ---------------------------------------------------------------------------
// Opening URLs (Integrated Browser -> Simple Browser -> external)
// ---------------------------------------------------------------------------

/**
 * Open a URL per the user's `startpozi.openIn` setting.
 *
 * 'integrated' tries, in order (a missing or failing command is skipped):
 *   1. the VS Code Integrated Browser (`workbench.action.browser.open`),
 *   2. the built-in Simple Browser (`simpleBrowser.show`),
 *   3. the system browser as a last resort.
 */
async function openUrl(url) {
	const where = getConfig().get(CFG_OPEN_IN) || 'integrated';

	if (where === 'integrated') {
		for (const commandId of INTEGRATED_BROWSER_COMMANDS) {
			try {
				await vscode.commands.executeCommand(commandId, url);
				return;
			} catch (error) {
				// Command not available in this VS Code version, or it failed —
				// fall through to the next option.
				console.error(`StartPOZI: opening '${commandId}' failed, trying next fallback.`, error);
			}
		}
	}

	await vscode.env.openExternal(vscode.Uri.parse(url));
}

// ---------------------------------------------------------------------------
// Selection helpers (from vscode-simple-search)
// ---------------------------------------------------------------------------

/**
 * Return the active editor's selected text with whitespace collapsed
 * to single spaces, or undefined when there is no usable selection.
 */
function getSelectedText() {
	const editor = vscode.window.activeTextEditor;
	if (!editor || editor.selection.isEmpty) {
		return undefined;
	}

	const selectedText = editor.document.getText(editor.selection);
	if (!selectedText) {
		return undefined;
	}

	return selectedText.replace(/\s\s+/g, ' ').trim();
}

/**
 * Return the word under the cursor, or undefined when the cursor is not
 * on a word.
 */
function getWordUnderCursor() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return undefined;
	}

	const wordRange = editor.document.getWordRangeAtPosition(editor.selection.active);
	return wordRange ? editor.document.getText(wordRange) : undefined;
}

// ---------------------------------------------------------------------------
// Search actions
// ---------------------------------------------------------------------------

/**
 * Run a StartPOZI search for the given query.
 */
async function search(query) {
	if (query == null || query.trim() === '') {
		vscode.window.showInformationMessage(EMPTY_QUERY_MESSAGE);
		return;
	}

	await openUrl(buildSearchUrl(query.trim().replace(/\s\s+/g, ' ')));
}

/**
 * Ask the user for a query via an input box, pre-filled with the current
 * selection (if any), then search. (From vscode-bing-search, improved.)
 */
async function searchFromInputBox() {
	const query = await vscode.window.showInputBox({
		value: getSelectedText() || '',
		placeHolder: 'What are you looking for?',
		prompt: 'Search with StartPOZI (startpozi.com)',
		ignoreFocusOut: false
	});

	// undefined means the user pressed Esc — do not show the "empty query" hint.
	if (query !== undefined) {
		await search(query);
	}
}

/**
 * Search the current selection. If nothing is selected, fall back to
 * asking for a query.
 */
async function searchSelection() {
	const selectedText = getSelectedText();
	if (selectedText) {
		await search(selectedText);
	} else {
		await searchFromInputBox();
	}
}

/**
 * Open the StartPOZI home page.
 */
async function openStartPozi() {
	await openUrl(STARTPOZI_HOME);
}

// ---------------------------------------------------------------------------
// Code search (VS Code "Find in Files")
// ---------------------------------------------------------------------------

/**
 * Open the VS Code Search view ("Find in Files") with the given query,
 * searching across all files of the workspace.
 */
async function searchInCode(query) {
	if (query == null || query.trim() === '') {
		vscode.window.showInformationMessage(EMPTY_QUERY_MESSAGE);
		return;
	}

	const text = query.trim().replace(/\s\s+/g, ' ');

	try {
		await vscode.commands.executeCommand(FIND_IN_FILES_COMMAND, { query: text, triggerSearch: true });
	} catch {
		// Older VS Code versions accept a plain string argument.
		try {
			await vscode.commands.executeCommand(FIND_IN_FILES_COMMAND, text);
		} catch (error) {
			console.error('StartPOZI: code search is not available.', error);
			vscode.window.showErrorMessage('StartPOZI: code search is not available.');
		}
	}
}

/**
 * Search in code: uses the selection, or — when nothing is selected — the
 * word under the cursor. As a last resort asks for a query.
 */
async function searchInCodeFromSelection() {
	const query = getSelectedText() || getWordUnderCursor();

	if (query) {
		await searchInCode(query);
		return;
	}

	const typed = await vscode.window.showInputBox({
		placeHolder: 'Find this in code...',
		prompt: 'Search across all files in the workspace',
		ignoreFocusOut: false
	});

	if (typed !== undefined) {
		await searchInCode(typed);
	}
}

// ---------------------------------------------------------------------------
// Extension entry points
// ---------------------------------------------------------------------------

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const disposables = [
		vscode.commands.registerCommand('startpozi.search', searchFromInputBox),
		vscode.commands.registerCommand('startpozi.searchSelection', searchSelection),
		vscode.commands.registerCommand('startpozi.searchInCode', searchInCodeFromSelection),
		vscode.commands.registerCommand('startpozi.openStartPozi', openStartPozi)
	];

	context.subscriptions.push(...disposables);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
};
