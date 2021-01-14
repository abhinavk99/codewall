'use strict';

import vscode from 'vscode';
import binarySearch from 'binary-search';

// A ruler in VS Code settings can either be a number or an object mapping strings to numbers/strings
// e.g. 90
// e.g. {"column": 90, "color": "#000"}
export type Ruler = number | RulerObject;

export interface RulerObject {
  column: number;
  color: string;
}

export function activate(context: vscode.ExtensionContext): void {
  const codeWall = new CodeWall();

  if (vscode.window.activeTextEditor != undefined) {
    codeWall.checkCrossingWall(vscode.window.activeTextEditor.document);
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor: vscode.TextEditor | undefined) => {
      if (editor != undefined) {
        codeWall.checkCrossingWall(editor.document);
      }
    }),
    vscode.workspace.onWillSaveTextDocument((textDocumentWillSaveEvent: vscode.TextDocumentWillSaveEvent) => {
      codeWall.checkCrossingWall(textDocumentWillSaveEvent.document);
    }),
    vscode.workspace.onDidChangeConfiguration((configChangeEvent: vscode.ConfigurationChangeEvent) => {
      if (configChangeEvent.affectsConfiguration(CodeWall.EDITOR_CONFIG)) {
        codeWall.setRulers();
      }
      if (configChangeEvent.affectsConfiguration(CodeWall.CODEWALL_CONFIG)) {
        codeWall.setOpenProblemsPane();
      }
    }),
    codeWall
  );
}

export function deactivate(): void {
  return;
}

export class CodeWall {
  static readonly EDITOR_CONFIG = 'editor';
  static readonly CODEWALL_CONFIG = 'codewall';

  readonly diagnosticCollection: vscode.DiagnosticCollection;

  rulers: Ruler[] = [];
  openProblemsPane: boolean;

  constructor() {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('CodeWall');
    this.setRulers();
    this.openProblemsPane = false;
    this.setOpenProblemsPane();
  }

  /**
   * Gets and sets all the rulers in the VS Code settings in ascending column number order ignoring rulers at column <= 0.
   */
  public setRulers(): void {
    this.rulers = vscode.workspace.getConfiguration(CodeWall.EDITOR_CONFIG).get('rulers', []);
    this.rulers.sort(this.rulerComparator.bind(this));
    this.rulers.filter((ruler) => this.getRulerColumnNumber(ruler) > 0);
  }

  public setOpenProblemsPane(): void {
    this.openProblemsPane =
      vscode.workspace.getConfiguration(CodeWall.CODEWALL_CONFIG).get('openProblemsPane') ?? false;
  }

  /**
   * Goes through the document and adds warnings for any lines crossing any rulers.
   * @param document VS Code text document
   */
  public checkCrossingWall(document: vscode.TextDocument): void {
    this.diagnosticCollection.clear();
    const diagnostics: vscode.Diagnostic[] = [];

    if (this.rulers.length == 0) {
      return;
    }

    for (const line of this.getLines(document)) {
      const crossedRulerColumnNumber = this.getRulerColumnNumberThatLineCrossed(line.range.end.character, this.rulers);
      if (crossedRulerColumnNumber != -1) {
        this.addDiagnosticWarningToDiagnostics(line, crossedRulerColumnNumber, diagnostics);
      }
    }

    if (diagnostics.length > 0) {
      this.diagnosticCollection.set(document.uri, diagnostics);

      // Open problems pane if setting is on
      if (this.openProblemsPane) {
        vscode.commands.executeCommand('workbench.action.problems.focus');
      }
    }
  }

  /**
   * Comparator function for sorting rulers in ascending order based on column number.
   * @param a Ruler 1
   * @param b Ruler 2
   * @returns Negative number if a is before b, Positive number if a is after b, 0 if equal
   */
  public rulerComparator(a: Ruler, b: Ruler): number {
    return this.getRulerColumnNumber(a) - this.getRulerColumnNumber(b);
  }

  /**
   * Since a ruler can either be a number or an object, this method abstracts out getting
   * the column number from the ruler.
   * @param ruler VS Code ruler from settings
   * @returns Ruler column number
   */
  public getRulerColumnNumber(ruler: Ruler): number {
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
   * Gets the column number of the ruler the line passed or -1.
   * @param lineEndColumnNumber Column number of the last character in the line
   * @param rulers List of rulers in ascending order
   * @returns The column number of the ruler the line passed or -1
   */
  public getRulerColumnNumberThatLineCrossed(lineEndColumnNumber: number, rulers: Ruler[]): number {
    let insertionIndex = binarySearch(rulers, lineEndColumnNumber, this.rulerComparator.bind(this));
    if (insertionIndex < 0) {
      // -(index + 1) is returned by binarySearch when the value is not found in the array, where index is where the value
      // would be inserted to maintain sorted order, so we do simple math to extract the index from what was returned.
      insertionIndex = -insertionIndex - 1;
    }
    if (insertionIndex == 0) {
      // Line ends before any rulers
      return -1;
    }
    return this.getRulerColumnNumber(rulers[insertionIndex - 1]);
  }

  /**
   * Adds VS Code Diagnostic warning to list of Diagnostic objects.
   * @param line Line that crosses a ruler
   * @param crossedRulerColumnNumber Column number of the ruler being crossed
   * @param diagnostics List of Diagnostic objects being added to
   */
  private addDiagnosticWarningToDiagnostics(
    line: vscode.TextLine,
    crossedRulerColumnNumber: number,
    diagnostics: vscode.Diagnostic[]
  ) {
    diagnostics.push({
      code: '',
      message: `Line ${line.lineNumber + 1} is longer than ruler at column ${crossedRulerColumnNumber}.`,
      range: new vscode.Range(new vscode.Position(line.lineNumber, crossedRulerColumnNumber - 1), line.range.end),
      severity: vscode.DiagnosticSeverity.Warning,
    });
  }

  public dispose(): void {
    this.diagnosticCollection.dispose();
  }
}
