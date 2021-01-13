import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import vscode from 'vscode';
import * as codewall from '../../extension';

interface TestCase {
  expectedResult: number;
  message: string;
}

interface NumberTestCase extends TestCase {
  input: number;
}

interface RulerTestCase extends TestCase {
  ruler: codewall.Ruler;
}

interface RulersTestCase extends TestCase {
  ruler1: codewall.Ruler;
  ruler2: codewall.Ruler;
}

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

  const rulerComparatorTestcases = [
    {
      ruler1: 5,
      ruler2: 8,
      expectedResult: -3,
      message: 'Get negative number when number ruler a is before number ruler b',
    },
    {
      ruler1: 34,
      ruler2: 18,
      expectedResult: 16,
      message: 'Get positive number when number ruler a is after number ruler b',
    },
    {
      ruler1: 3,
      ruler2: 3,
      expectedResult: 0,
      message: 'Get 0 when number ruler a is at same position as number ruler b',
    },
    {
      ruler1: { column: 5, color: '#000000' },
      ruler2: 8,
      expectedResult: -3,
      message: 'Get negative number when object ruler a is before number ruler b',
    },
    {
      ruler1: 34,
      ruler2: { column: 18, color: '#000000' },
      expectedResult: 16,
      message: 'Get positive number when number ruler a is after object ruler b',
    },
    {
      ruler1: { column: 3, color: '#000000' },
      ruler2: { column: 3, color: '#000000' },
      expectedResult: 0,
      message: 'Get 0 when object ruler a is at same position as object ruler b',
    },
  ];
  rulerComparatorTestcases.forEach((testCase: RulersTestCase) => {
    test(`${testCase.message}`, () => {
      assert.strictEqual(codeWall.rulerComparator(testCase.ruler1, testCase.ruler2), testCase.expectedResult);
    });
  });

  const getRulerColumnNumberTestCases = [
    { ruler: 5, expectedResult: 5, message: 'Get ruler column number from number' },
    { ruler: { column: 5, color: '#000000' }, expectedResult: 5, message: 'Get ruler column number from object' },
  ];
  getRulerColumnNumberTestCases.forEach((testCase: RulerTestCase) => {
    test(`${testCase.message}`, () => {
      assert.strictEqual(codeWall.getRulerColumnNumber(testCase.ruler), testCase.expectedResult);
    });
  });

  const getRulerColumnNumberThatLineCrossedTestCases = [
    { input: 80, expectedResult: -1, message: 'Get -1 when line does not cross any rulers' },
    { input: 95, expectedResult: 90, message: 'Get first ruler column number when line crosses first ruler' },
    { input: 110, expectedResult: 100, message: 'Get second ruler column number when line crosses second ruler' },
    { input: 150, expectedResult: 120, message: 'Get last ruler column number when line crosses last ruler' },
    { input: 90, expectedResult: -1, message: 'Get -1 when line ends at first ruler' },
    { input: 100, expectedResult: 90, message: 'Get first ruler column number when line ends at second ruler' },
    { input: 120, expectedResult: 100, message: 'Get second ruler column number when line ends at third ruler' },
  ];
  getRulerColumnNumberThatLineCrossedTestCases.forEach((testCase: NumberTestCase) => {
    test(`${testCase.message}`, () => {
      assert.strictEqual(codeWall.getRulerColumnNumberThatLineCrossed(testCase.input, rulers), testCase.expectedResult);
    });
  });
});
