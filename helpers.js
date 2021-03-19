const userLookup = function(emailPass, users) {
  console.log("userlookup function called correctly");
  for (let user in users) {
    // console.log("userlookup log: ", emailPass, users[user], users[user]["email"]);
    if (users[user]["email"] === emailPass) {
      // console.log("Found ID:", users[user]["email"], "equivalent to", emailPass);
      return user;
    }
  }
  // console.log("User not found");
  return null;
};

const urlFilter = function(userId, urlDatabase) {
  // console.log("url filter function called correctly", userId, urlDatabase);
  let result = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url]["userID"] === userId) {
      result[url] = urlDatabase[url];
    }
  }
  // console.log("urlFilter", result, urlDatabase);
  return result;
};

module.exports = {userLookup, urlFilter};