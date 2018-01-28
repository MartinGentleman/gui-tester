'use strict';

// node src/lib/test-parser.js static/data/tests/definitions/registration-e2e.json http://www.solarwinds.com/network-performance-monitor true
if (process.argv.length !== 4 && process.argv.length !== 5) {
  console.error('expected 4 or 5 arguments: node test-parser.js test.json http://targeturl true');
  process.exit(1);
}

const browser = require('./superwebdriver');
const fs = require('fs');
const spawn = require('child_process').spawn;
const testResult = require('./testresult');
const result = testResult.result;
const runSelenium = !(process.argv.length === 5 && process.argv[4] === 'false');

let currentTestCase = testResult.testCase;
let testDefinition;
let selenium;

/**
 * Forces the testing to stop, browser to close, output JSON with testing
 * results, selenium to kill and the process to exit.
 *
 * @async
 * @impure
 * @return {Promise.<void>}
 */
const finishTest = async () => {
  result.end = testResult.timestamp();
  if (browser.isInitialized()) {
    await browser.end();
  }
  console.log(JSON.stringify(result));
  if (runSelenium) {
    selenium.kill();
  }
  process.exit();
};

/**
 * Verifies whether the current level of test is blocking. Every level that is
 * not 'warn' or 'fail' is considered 'block'.
 *
 * @example isBlocking('fail'); // false
 *
 * @pure
 * @param {String} level - 'warn' || 'fail' || 'block'
 * @return {Boolean}
 */
const isBlocking = level => !['warn', 'fail'].includes(level);

/**
 * Processes Error thrown during testing accepting standard node.js Error object.
 *
 * @async
 * @impure
 * @param {Error} err
 * @return {Promise.<void>}
 */
const processError = async (err) => {
  currentTestCase.status = currentTestCase.status || 'block';
  if (isBlocking(currentTestCase.status)) { // block
    currentTestCase.end = testResult.timestamp();
    currentTestCase.message = currentTestCase.message || err.message;
    result['error'] = err.message + ' ' + err.stack;
    result.testCases.push(currentTestCase);
    await finishTest();
  }
};

/**
 * Uses recursion to process an array of tests.
 *
 * @async
 * @recursive
 * @impure
 * @param {Array} tests
 * @return {Promise.<*>}
 */
const runTest = async tests => {
  const
    [test, ...tail] = tests,
    [method, ...args] = test;

  currentTestCase.functions.push(method);

  let testResult = false;
  try {
    if (typeof browser[method] === 'function') {
      testResult = await browser[method](args);
    } else {
      await processError(new Error(`Test case is trying to call undefined function browser.${method}.`));
    }
  } catch (err) {
    currentTestCase.message = currentTestCase.message || browser.defaultMessage[method]['fail'];
    await processError(err);
    return testResult;
  }
  if (tests.length > 1 && testResult !== false) {
    testResult = await runTest(tail);
  }
  return testResult;
};

/**
 * Evaluates given conditions
 *
 * @example
 * evaluateUnderCondition(["isExisting", "#FirstName"],"and",["isExisting", "#CTALastName"]);
 *
 * @async
 * @pure
 * @param {Array} conditions
 * @returns {Promise.<*>}
 * @throws Error
 */
const evaluateUnderCondition = async conditions => {
  if (conditions.length > 1) {
    const [test, divider, ...tail] = conditions;
    switch (divider) {
      case '&&':
      case 'and':
        return await runTest([test]) && await evaluateUnderCondition(tail);
      case '||':
      case 'or':
        return await runTest([test]) || await evaluateUnderCondition(tail);
      default:
        throw new Error(`Unknown condition divider ${divider}.`);
    }
  } else {
    return await runTest([conditions[0]]);
  }
};

/**
 * Uses recursion to process an array of testCases.
 *
 * @async
 * @recursive
 * @impure
 * @param {Array} testCases
 * @return {Promise.<void>}
 */
const runTestCase = async testCases => {
  const
    [testCase, ...tail] = testCases;

  currentTestCase = Object.assign({}, testResult.testCase);
  currentTestCase.functions = [];
  currentTestCase.status = testCase.level || 'block';
  currentTestCase.message = testCase.fail || null;

  if (testCase.underCondition && !await evaluateUnderCondition(testCase.underCondition)) {
    if (tail.length !== 0) {
      await runTestCase(tail);
      return;
    } else {
      return;
    }
  }

  currentTestCase.start = testResult.timestamp();
  const testRunResult = await runTest(testCase.tests);
  currentTestCase.end = testResult.timestamp();

  const
    lastFunction = currentTestCase.functions[currentTestCase.functions.length - 1],
    passMessage = testCase.pass || browser.defaultMessage[lastFunction]['pass'],
    failMessage = testCase.fail || browser.defaultMessage[lastFunction]['fail'];

  if (testRunResult) {
    currentTestCase.status = 'pass';
    currentTestCase.message = passMessage;
    result.testCases.push(currentTestCase);
  } else {
    currentTestCase.message = failMessage;
    result.testCases.push(currentTestCase);
    if (isBlocking(currentTestCase.status)) {
      await finishTest();
    }
  }

  if (tail.length !== 0) {
    await runTestCase(tail);
  }
};

/**
 * Setups and runs testing.
 *
 * @async
 * @impure
 * @return {Promise.<void>}
 */
const startTesting = async () => {
  result.start = testResult.timestamp();
  currentTestCase = Object.assign({}, testResult.testCase);
  try {
    currentTestCase.start = testResult.timestamp();
    currentTestCase.status = 'block';
    currentTestCase.message = 'Could not open a browser to start testing.';
    currentTestCase.functions = ['init'];
    await browser.init([result['url']]);
    await runTestCase(testDefinition['testCases']);
    await finishTest();
  } catch (err) {
    await processError(err);
  }
};

try {
  testDefinition= JSON.parse(fs.readFileSync(process.argv[2], 'utf-8'))
  if (runSelenium) {
    // if needed to kill manually: lsof -t -i tcp:4444 | xargs kill
    selenium = spawn('java', ['-jar', '-Dwebdriver.chrome.driver=static/bin/chromedriver',
      'static/bin/selenium-server-standalone-3.4.0.jar', '-role', 'standalone']);
  }
} catch (err) {
  processError(err).catch(finishTest);
}
result['url'] = process.argv[3];
result['title'] = testDefinition.title;

const parserTimeout = setTimeout(
  () => processError(new Error('Testing has not finished within 1 minute.')),
  60000);

if (runSelenium) {
  const seleniumTimeout = setTimeout(
    () => processError(new Error('Selenium startup timed out.')),
    15000);
  selenium.stderr.on('data', (data) => {
    if (('' + data).substr(-34) === 'Selenium Server is up and running\n') {
      clearTimeout(seleniumTimeout);
      startTesting().catch(processError);
    }
  });
} else {
  startTesting().catch(processError);
}

