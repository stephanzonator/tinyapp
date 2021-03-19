const { assert } = require('chai');
const helpers = require('../helpers');
const userLookup = helpers.userLookup;
const urlFilter = helpers.urlFilter;

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testURL = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "q6ibtc" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

describe('urlFilter', function() {
  it('should return the correct URLs when given a user ID', function() {
    const user = urlFilter("q6ibtc", testURL);
    const expectedOutput = {
      "b6UTxQ": {
        "longURL": "https://www.tsn.ca",
        "userID": "q6ibtc"
      }
    };
    assert.deepEqual(user, expectedOutput);
  });

  it('should return the correct URLs when given a user ID, test two', function() {
    const result = urlFilter("aJ48lW", testURL);
    const expectedOutput = {
      "i3BoGr": {
        "longURL": "https://www.google.ca",
        "userID": "aJ48lW"
      }
    };
    console.log(result, expectedOutput);
    assert.deepEqual(result, expectedOutput);
  });
  it('should not return data when given wrong data', function() {
    const result = urlFilter("b6UTxQ", testURL);
    const expectedOutput = {};
    console.log(result, expectedOutput);
    assert.deepEqual(result, expectedOutput);
  });
});

describe('userLookup', function() {
  it('should return a user with valid email', function() {
    const user = userLookup("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user, expectedOutput);
  });
  it('should return null if the email does not exist', function() {
    const user = userLookup("fake@fake.com", testUsers);
    const expectedOutput = null;
    assert.strictEqual(user, expectedOutput);
  });
  it('should check for emails only, not ids', function() {
    const user = userLookup("userRandomID", testUsers);
    const expectedOutput = null;
    assert.strictEqual(user, expectedOutput);
  });
  it('should check for emails only, not passwords', function() {
    const user = userLookup("purple-monkey-dinosaur", testUsers);
    const expectedOutput = null;
    assert.strictEqual(user, expectedOutput);
  });
});
