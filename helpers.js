const userLookup = function(emailPass, users) {
  // console.log("function called correctly");
  for (user in users) {
    // console.log("userlookup log: ", emailPass, users[user], users[user]["email"]);
    if (users[user]["email"] === emailPass) {
      // console.log("Found ID:", users[user]["email"], "equivalent to", emailPass);
      return user;
    }
  }
  // console.log("User not found");
  return null;
};

module.exports = userLookup;