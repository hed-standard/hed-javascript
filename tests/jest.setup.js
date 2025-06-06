import { toMatchIssue } from './test-helpers/toMatchIssue.js';

expect.extend({
  toMatchIssue(receivedError, expectedCode, expectedParams) {
    return toMatchIssue(receivedError, expectedCode, expectedParams)
  }
})
