'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext): void {
  const diagnostics = vscode.languages.createDiagnosticCollection('CodeWall');
  const codeWall = new CodeWall();

  if (vscode.window.activeTextEditor) {
    codeWall.checkCrossingWall(vscode.window.activeTextEditor.document, diagnostics);
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor: vscode.TextEditor | undefined) => {
      if (editor != undefined) {
        codeWall.checkCrossingWall(editor.document, diagnostics);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
      codeWall.checkCrossingWall(document, diagnostics);
    })
  );

  context.subscriptions.push(codeWall);
}

export function deactivate(): void {
  return;
}

class CodeWall {
  public checkCrossingWall(document: vscode.TextDocument, diagnosticCollection: vscode.DiagnosticCollection) {
    diagnosticCollection.clear();
    const diagnostics: vscode.Diagnostic[] = [];

    // Get rulers in descending order
    const rulers: Array<number | Record<string, unknown>> = vscode.workspace
      .getConfiguration('editor')
      .get('rulers', []);
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
            range: new vscode.Range(new vscode.Position(lineNumber, ruler - 1), line.range.end),
            severity: vscode.DiagnosticSeverity.Warning,
          });
          break;
        }
      }
    }

    if (diagnostics.length > 0) {
      diagnosticCollection.set(document.uri, diagnostics);

      // Open problems pane if setting is on
      if (vscode.workspace.getConfiguration('codewall').get('openProblemsPane')) {
        vscode.commands.executeCommand('workbench.action.problems.focus');
      }
    }
  }

  public dispose() {
    return;
  }
}
