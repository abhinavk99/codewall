'use strict';

import * as vscode from 'vscode';

// A ruler in VS Code settings can either be a number or an object mapping strings to numbers/strings
// e.g. 90
// e.g. {"column": 90, "color": "#000"}
type Ruler = number | RulerObject;

interface RulerObject {
  column: number;
  color: string;
}

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

export class CodeWall {
  /**
   * Goes through the document and adds warnings for any lines crossing any rulers.
   * @param document VS Code text document
   * @param diagnosticCollection Diagnostics collection to add warnings to
   */
  public checkCrossingWall(document: vscode.TextDocument, diagnosticCollection: vscode.DiagnosticCollection): void {
    diagnosticCollection.clear();
    const diagnostics: vscode.Diagnostic[] = [];

    const rulers = this.getRulersDescendingOrder();
    if (rulers.length == 0) {
      return;
    }

    for (const line of this.getLines(document)) {
      for (const ruler of rulers) {
        if (this.doesLinePassRuler(line, ruler)) {
          const message = `Line ${line.lineNumber + 1} is longer than ruler at ${this.getRulerNumber(ruler)}.`;
          // Add VS Code warning
          diagnostics.push({
            code: '',
            message: message,
            range: new vscode.Range(
              new vscode.Position(line.lineNumber, this.getRulerNumber(ruler) - 1),
              line.range.end
            ),
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

  /**
   * Gets all the rulers in the VS Code settings in descending order.
   */
  private getRulersDescendingOrder() {
    const rulers: Array<Ruler> = vscode.workspace.getConfiguration('editor').get('rulers', []);
    rulers.sort((a, b) => this.getRulerNumber(b) - this.getRulerNumber(a)); // Descending order
    return rulers;
  }

  /**
   * Since a ruler can either be a number or an object, this method abstracts out getting
   * the line number from the ruler.
   * @param ruler VS Code ruler from settings
   * @returns Ruler line number
   */
  public getRulerNumber(ruler: Ruler): number {
    if (typeof ruler === 'number') {
      return ruler;
    }
    return ruler.column;
  }

  /**
   * Gets all the lines in the text document as an iterator.
   * @param document VS Code text document
   * @returns Iterator of lines in the text document
   */
  private *getLines(document: vscode.TextDocument) {
    const lineCount = document.lineCount;
    for (let lineNumber = 0; lineNumber < lineCount; lineNumber++) {
      yield document.lineAt(lineNumber);
    }
  }

  /**
   * Returns whether the line passes the ruler.
   * @param line Position number of the last character in the line.
   * @param ruler Ruler being checked
   * @returns True if line passes the ruler, otherwise false
   */
  private doesLinePassRuler(line: vscode.TextLine, ruler: Ruler) {
    return line.range.end.character > this.getRulerNumber(ruler);
  }

  public dispose(): void {
    return;
  }
}
