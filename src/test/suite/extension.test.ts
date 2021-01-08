import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as codewall from '../../extension';

suite('CodeWall Test Suite', () => {
  vscode.window.showInformationMessage('Start all CodeWall tests.');
  const codeWall = new codewall.CodeWall();

  test('Get ruler number from number', () => {
    assert.strictEqual(codeWall.getRulerNumber(5), 5);
  });

  test('Get ruler number from object', () => {
    assert.strictEqual(codeWall.getRulerNumber({ column: 5, color: '#000000' }), 5);
  });
});
