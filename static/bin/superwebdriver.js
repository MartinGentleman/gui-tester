'use strict';

const fs = require('fs');
const webdriverio = require('webdriverio');
const evaluate = require('./condition-evaluator').evaluate;
const defaultMessage = {};

let client;
let firstURL;
let initialized = false;

const getChromeExtension = file => fs.readFileSync(__dirname + '/' + file).toString('base64');

const options = {
  desiredCapabilities: {
    browserName: 'chrome',
    chromeOptions: {
      extensions: [getChromeExtension('js-modheader.crx')]
    }
  }
};
const driver = webdriverio.remote(options);

const isInitialized = () => initialized;

const createFirstURL = targetURL => {
  const argumentsPos = targetURL.indexOf('?');
  let port;
  if (targetURL.split(':').length > 2) {
    port = argumentsPos !== -1 ? targetURL.split(':')[2].substr(0, argumentsPos) : targetURL.split(':')[2];
  } else {
    port = null;
  }
  firstURL = {
    full: targetURL,
    clean: targetURL,
    protocol: targetURL.split('/')[0],
    domain: targetURL.split('/')[2],
    args: argumentsPos !== -1 ? targetURL.substr(argumentsPos) : null,
    port: port,
    root: targetURL.split('/')[0] + '://' + targetURL.split('/')[2]
  };
  firstURL.clean = firstURL.args ? firstURL.clean.replace(firstURL.args, '') : firstURL.clean;
  firstURL.port = firstURL.port ? firstURL.clean.replace(firstURL.port, '') : firstURL.clean;
  return firstURL;
};

defaultMessage['url'] = {
  pass: 'URL opened.',
  fail: 'URL could not be opened.'
};
const url = async (targetURL, useArguments = false, usePort = false) => {
  if (firstURL) {
    let URL = targetURL[0];
    if (URL === '.') {
      URL = firstURL.full;
    } else if (URL.substr(0, 2) === './') {
      URL = firstURL.clean + targetURL.substr(1);
      URL = usePort ? URL + firstURL.port : URL;
      URL = useArguments ? URL + firstURL.args : URL;
    } else if (URL.substr(0, 1) === '/' && targetURL.substr(0, 2) !== '//') {
      URL = firstURL.root + targetURL.substr(1);
      URL = usePort ? URL + firstURL.port : URL;
      URL = useArguments ? URL + firstURL.args : URL;
    }
    return await client.url(URL);
  } else {
    const result = await client.url(...targetURL);
    if (result) {
      createFirstURL(...targetURL);
    }
    return result;
  }
};

defaultMessage['init'] = {
  pass: 'Browser started.',
  fail: 'Browser not started.'
};
const init = async targetURL => {
  client = driver.init();
  initialized = true;
  if (targetURL) {
    return url(targetURL);
  } else {
    return await client;
  }
};

defaultMessage['setCookie'] = {
  pass: 'Cookie is set.',
  fail: 'Cookie could not be set.'
};
const setCookie = async cookie => await client.setCookie(...cookie);

defaultMessage['execute'] = {
  pass: 'JavaScript was executed on the page.',
  fail: 'JavaScript could not be executed on the page or result does not match.'
};
const execute = async args => {
  const result = await client.execute(eval(args[0]));
  return (args.length === 2) ? evaluate(result.value, args[1]) : result.value;
};

defaultMessage['end'] = {
  pass: 'Browser ended.',
  fail: 'Browser could not be ended..'
};
const end = async () => await client.end();

defaultMessage['getTitle'] = {
  pass: 'Page title was found.',
  fail: 'Page title could not be obtained.'
};
const getTitle = async args => {
  const result = await client.getTitle();
  return (args.length === 1) ? evaluate(result, args[0]) : result;
};

defaultMessage['getUrl'] = {
  pass: 'Page url was found.',
  fail: 'Page url could not be obtained.'
};
const getUrl = async args => {
  const result = await client.getUrl();
  return (args.length === 1) ? evaluate(result, args[0]) : result;
};

defaultMessage['getText'] = {
  pass: 'Element text was found.',
  fail: 'Element text could not be obtained.'
};
const getText = async args => {
  let result = await client.getText(args[0]);
  result = typeof result === "object" ? result [0] : result;
  return (args.length === 2) ? evaluate(result, args[1]) : result;
};

defaultMessage['isExisting'] = {
  pass: 'Element exists.',
  fail: 'Element was not found on the page.'
};
const isExisting = async selector => await client.isExisting(...selector);

defaultMessage['isNotExisting'] = {
  pass: 'Element does not exist.',
  fail: 'Element exists on the page.'
};
const isNotExisting = async selector => ! await client.isExisting(...selector);

defaultMessage['isVisible'] = {
  pass: 'Element is visible.',
  fail: 'Element is not visible on the page.'
};
const isVisible = async selector => await client.isVisible(...selector);

defaultMessage['isNotVisible'] = {
  pass: 'Element is not visible.',
  fail: 'Element is visible on the page.'
};
const isNotVisible = async selector => ! await client.isVisible(...selector);

defaultMessage['setValue'] = {
  pass: 'Element value was set.',
  fail: 'Element value could not be set.'
};
const setValue = async args => await client.setValue(...args);

defaultMessage['getValue'] = {
  pass: 'Element value was found.',
  fail: 'Element value could not be obtained or does not match.'
};
const getValue = async args => {
  const result = await client.getValue(args[0]);
  return (args.length === 2) ? evaluate(result, args[1]) : result;
};

defaultMessage['getAttribute'] = {
  pass: 'Element or attribute value was found.',
  fail: 'Element or attribute value could not be obtained or does not match.'
};
const getAttribute = async args => {
  const result = await client.getAttribute(args[0], args[1]);
  return (args.length === 3) ? evaluate(result, args[2]) : result;
};

defaultMessage['click'] = {
  pass: 'Element was clicked.',
  fail: 'Element could not be clicked.'
};
const click = async selector => await client.click(...selector);

defaultMessage['selectByValue'] = {
    pass: 'Option was selected.',
    fail: 'Option could not be selected.'
};
const selectByValue = async args => await client.selectByValue(...args);

defaultMessage['waitForExist'] = {
  pass: 'Element appeared.',
  fail: 'Element did not appear in the given time.'
};
const waitForExist = async args => await client.waitForExist(...args);

defaultMessage['back'] = {
  pass: 'Browser was able to move back in browser history.',
  fail: 'Browser was not able to move back in browser history.'
};
const back = async () => await client.back();

defaultMessage['switchTab'] = {
  pass: 'Browser was able to switch tab.',
  fail: 'Browser was not able to switch tab.'
};
const switchTab = async windowHandle => await client.switchTab(windowHandle);

defaultMessage['firstTab'] = {
  pass: 'Browser was able to switch to the first tab.',
  fail: 'Browser was not able to switch to the first tab.'
};
const firstTab = async () => await client.switchTab();

defaultMessage['getNumberOfTabs'] = {
  pass: 'Browser was able to get number of tabs.',
  fail: 'Browser was not able to get number of tabs.'
};
const getNumberOfTabs = async () => await client.getTabIds().length;

defaultMessage['switchToTabNumber'] = {
  pass: 'Browser was able to switch tab by number.',
  fail: 'Browser was not able to switch tab by number.'
};
const switchToTabNumber = async number => {
  const tabs = await client.getTabIds();
  if (tabs.length < number || number < 1) {
    return false;
  }
  return await client.switchTab(tabs[number -1]);
}

defaultMessage['close'] = {
  pass: 'Browser was able to close tab/window.',
  fail: 'Browser was not able to close tab/window.'
};
const close = async windowHandle => await client.close(windowHandle);

defaultMessage['reload'] = {
    pass: 'Browser was able to reload tab/window.',
    fail: 'Browser was not able to reload tab/window.'
};
const reload = async () => await client.reload();

defaultMessage['refresh'] = {
    pass: 'Browser was able to refresh tab/window.',
    fail: 'Browser was not able to refresh tab/window.'
};
const refresh = async () => await client.refresh();

defaultMessage['wait'] = {
  pass: 'Browser was able to wait.',
  fail: 'Browser was not able to wait.'
};
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

defaultMessage['waitForVisible'] = {
  pass: 'Element became visible.',
  fail: 'The element did not become visible.'
};
const waitForVisible = async args => await client.waitForVisible(...args);

module.exports = {
  defaultMessage,
  isInitialized,
  init,
  end,
  url,
  setCookie,
  getTitle,
  getUrl,
  getText,
  isExisting,
  isNotExisting,
  isVisible,
  isNotVisible,
  setValue,
  getValue,
  getAttribute,
  click,
  selectByValue,
  waitForExist,
  back,
  execute,
  switchTab,
  firstTab,
  getNumberOfTabs,
  switchToTabNumber,
  close,
  reload,
  refresh,
  wait,
  waitForVisible
};
