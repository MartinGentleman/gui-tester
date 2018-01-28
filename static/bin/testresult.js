'use strict';

const
  timestamp = () => Date.now(),
  result = {
    url: null,
    title: null,
    error: null,
    start: null,
    end: null,
    testCases: []
  },
  testCase = {
    start: null,
    end: null,
    functions: [],
    status: null,
    message: null
  };

module.exports = {
  timestamp,
  result,
  testCase
};
