'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Reads a file synchronously as utf-8 and returns parsed JSON
 *
 * @impure
 * @param {String} file
 * @throws Error
 */
const readSync = file => JSON.parse(fs.readFileSync(path.join(__static, file), 'utf-8'));

module.exports = {
  readSync
};
