'use strict';

/**
 * Evaluates given condition
 *
 * @example
 * evaluatePair('Martin','contains','Mar') // 'Martin'.indexOf('Mar') !== -1 => true
 *
 * @pure
 * @param {*} result
 * @param {String} condition
 * @param {*} value
 * @returns {boolean}
 * @throws Error
 */
const evaluatePair = (result, condition, value) => {
  switch (condition) {
    case 'exists':
      return !!result;
    case 'equals':
      return result === value;
    case 'does not equal':
    case 'not equal to':
    case 'not equals':
      return result !== value;
    case 'contains':
      return result.indexOf(value) !== -1;
    case 'does not contain':
      return result.indexOf(value) === -1;
    case 'is empty':
    case 'empty':
    case 'is null':
    case 'null':
      return !result || result.trim().length === 0;
    case 'is not empty':
    case 'not empty':
    case 'is not null':
    case 'not null':
      return result && result.trim().length > 0;
    case 'is undefined':
    case 'undefined':
      return !result;
    case 'is not undefined':
    case 'not undefined':
      return !!result;
    default:
      throw new Error(`Unknown condition ${condition}.`);
      return false;
  }
}

/**
 * Recursively evaluates conditions over the given result
 *
 * @example
 * evaluate('Martin',['does not equal', {'Martin'},'and','contains','r','or','contains','in'])
 * // ('Martin' !== {'Martin'} && ('Martin'.indexOf('r') !== -1 || ('Martin'.indexOf('in') !== -1))) => true
 *
 * @pure
 * @param {*} result
 * @param {Array<*>} conditions
 * @returns {Boolean}
 * @throws Error
 */
const evaluate = (result, conditions) => {
  if (conditions.length > 2) {
    const [condition, value, divider, ...tail] = conditions;
    switch (divider) {
      case '&&':
      case 'and':
        return evaluatePair(result, condition, value) && evaluate(result, tail);
      case '||':
      case 'or':
        return evaluatePair(result, condition, value) || evaluate(result, tail);
      default:
        throw new Error(`Unknown condition divider ${divider}. Only 'and' and 'or' are supported.`);
    }
  } else {
    return evaluatePair(result, conditions[0], conditions[1]);
  }
};

module.exports = {
  evaluate
};
