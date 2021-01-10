import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import vscode from 'vscode';
import * as codewall from '../../extension';

suite('CodeWall Test Suite', () => {
  vscode.window.showInformationMessage('Start all CodeWall tests.');
  const codeWall = new codewall.CodeWall();
  const rulers = [
    {
      column: 90,
      color: '#000000',
    },
    100,
    {
      column: 120,
      color: '#ff0000',
    },
  ];

  test('Get ruler column number from number', () => {
    assert.strictEqual(codeWall.getRulerColumnNumber(5), 5);
  });

  test('Get ruler column number from object', () => {
    assert.strictEqual(codeWall.getRulerColumnNumber({ column: 5, color: '#000000' }), 5);
  });

  test('Get -1 when line does not cross any rulers', () => {
    assert.strictEqual(codeWall.getRulerColumnNumberThatLineCrossed(80, rulers), -1);
  });

  test('Get first ruler column number when line crosses first ruler', () => {
    assert.strictEqual(codeWall.getRulerColumnNumberThatLineCrossed(95, rulers), 90);
  });

  test('Get second ruler column number when line crosses second ruler', () => {
    assert.strictEqual(codeWall.getRulerColumnNumberThatLineCrossed(110, rulers), 100);
  });

  test('Get last ruler column number when line crosses last ruler', () => {
    assert.strictEqual(codeWall.getRulerColumnNumberThatLineCrossed(150, rulers), 120);
  });

  test('Get -1 when line ends at first ruler', () => {
    assert.strictEqual(codeWall.getRulerColumnNumberThatLineCrossed(90, rulers), -1);
  });

  test('Get first ruler column number when line ends at second ruler', () => {
    assert.strictEqual(codeWall.getRulerColumnNumberThatLineCrossed(100, rulers), 90);
  });

  test('Get second ruler column number when line ends at third ruler', () => {
    assert.strictEqual(codeWall.getRulerColumnNumberThatLineCrossed(120, rulers), 100);
  });
});
