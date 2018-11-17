'use strict';

import { ExtensionContext, TextDocument, workspace, commands, window, TextEditor, languages, DiagnosticCollection, Diagnostic, Range, Position, DiagnosticSeverity } from 'vscode';

export function activate(context: ExtensionContext) {

    console.log('Congratulations, your extension "CodeWall" is now active!');

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
        let diagnostics: Diagnostic[] = [];

        // Get rulers in descending order
        const rulers: Array<number> = workspace.getConfiguration('editor', null).get('rulers');
        rulers.sort((a, b) => b - a);
        console.log(rulers);

        // Go through all the lines in the document
        const lineCount = document.lineCount;
        for (let lineNumber = 0; lineNumber < lineCount; lineNumber++) {
            let line = document.lineAt(lineNumber);
            let character = line.range.end.character;
            for (let ruler of rulers) {
                // Check if the line passes the ruler
                if (character >= ruler) {
                    let message = `Line ${lineNumber + 1} is longer than ruler at ${ruler}.`;
                    console.log(message)
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

        diagnosticCollection.set(document.uri, diagnostics);

        // Open problems panel
        commands.executeCommand('workbench.action.problems.focus');
    }

    public dispose() { }
}