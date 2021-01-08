'use strict';

import { ExtensionContext, TextDocument, workspace, commands, window, TextEditor, languages, DiagnosticCollection, Diagnostic, Range, Position, DiagnosticSeverity } from 'vscode';

export function activate(context: ExtensionContext) {

    const diagnostics = languages.createDiagnosticCollection('CodeWall');
    const codeWall = new CodeWall();

    if (window.activeTextEditor) {
        codeWall.checkCrossingWall(window.activeTextEditor.document, diagnostics);
    }

    context.subscriptions.push(window.onDidChangeActiveTextEditor((editor: TextEditor) => {
        codeWall.checkCrossingWall(editor.document, diagnostics);
    }));

    context.subscriptions.push(workspace.onDidSaveTextDocument((document: TextDocument) => {
        codeWall.checkCrossingWall(document, diagnostics);
    }));

    context.subscriptions.push(codeWall);
}

export function deactivate() {
}

class CodeWall {

    public checkCrossingWall(document: TextDocument, diagnosticCollection: DiagnosticCollection) {

        diagnosticCollection.clear();
        const diagnostics: Diagnostic[] = [];

        // Get rulers in descending order
        const rulers: Array<number> = workspace.getConfiguration('editor').get('rulers');
        rulers.sort((a, b) => b - a);

        // Go through all the lines in the document
        const lineCount = document.lineCount;
        for (let lineNumber = 0; lineNumber < lineCount; lineNumber++) {
            const line = document.lineAt(lineNumber);
            const character = line.range.end.character;
            for (const ruler of rulers) {
                // Check if the line passes the ruler
                if (character > ruler) {
                    const message = `Line ${lineNumber + 1} is longer than ruler at ${ruler}.`;
                    console.log(message);
                    diagnostics.push({
                        code: '',
                        message: message,
                        range: new Range(new Position(lineNumber, ruler - 1), line.range.end),
                        severity: DiagnosticSeverity.Warning
                    });
                    break;
                }
            }
        }

        if (diagnostics.length > 0) {
            diagnosticCollection.set(document.uri, diagnostics);

            // Open problems pane if setting is on
            if (workspace.getConfiguration('codewall').get('openProblemsPane')) {
                commands.executeCommand('workbench.action.problems.focus');
            }
        }
    }

    public dispose() { }
}