const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
var cookieSession = require('cookie-session');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const helpers = require('./helpers');
const userLookup = helpers.userLookup; 
const urlFilter = helpers.urlFilter;


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  // maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use(morgan('dev'));

app.set("view engine", "ejs");

const generateRandomString = function() {
  let result = Math.random().toString(36).replace('0.', '');
  return result.slice(0,6);
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "q6ibtc" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = { 
  "userRandomID": { //Pass this user object to your templates via templateVars.
    id: "userRandomID", 
    email: "user@example.com", 
    password: "$2b$10$heMSN2K596eFuaaklJoYWeRNqj.uGIDL2LShv2KgWoQSxKDGT.58u"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "$2b$10$heMSN2K596eFuaaklJoYWeRNqj.uGIDL2LShv2KgWoQSxKDGT.58u"
  },

  "q6ibtc": {
    id: "q6ibtc", 
    email: "a@a.com", 
    password: "$2b$10$PK4gZQ..Ofg0z4et.ldnJuwO5/r/g.FFUAEfiTB20n2S5FMUqxl0."
  }
};



// function userLookupById(idPass) {
//   // console.log("userlookup: ", idPass);
  
//   for (user in users) {
//     console.log("userlookup log: ", user, user["email"]);
//     // console.log("userfind", user);
//     if (user === idPass) {
//       // console.log("Found ID:", user, "equivalent to", idPass);
//       return user;
//     } else {
//       // console.log("User not YET found", user, "not equivalent to", idPass);
  
//     }
//   }
//   // console.log(users);
//   return "User not found";
// }


// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };




app.get("/login", (req, res) => { 
  //OLD SYNTAX: const user = users[req.cookies["user_id"]];
  const user = users[req.session.user_id];
  const templateVars = {"user_id": req.session.user_id, "user": user};
  res.render("urls_login", templateVars);
});

app.get("/register", (req, res) => { 
  const user = users[req.session.user_id];
  const templateVars = {"user_id": req.session.user_id, "user": user};
  res.render("urls_register", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = {"user_id": req.session.user_id, "user": user};
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = {"user_id": req.session.user_id, shortURL: req.params.shortURL, 
  longURL: urlDatabase[req.params.shortURL], "user": user};
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = {"user_id": req.session.user_id, urls: urlFilter(req.session.user_id, urlDatabase), "user": user};
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/register", (req, res) => {
  const password = req.body.password; // found in the req.params object
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!req.body.email || !req.body.password) {
    return res.status(400).send('Please fill out all forms.');
  } 
  if (userLookup(req.body.email, users)) {
    return res.status(400).send('User already exists.');
  }
  // console.log("register posting correctly")
  const randString = generateRandomString();
  users[randString] = {
    id: randString, 
    email: req.body.email, 
    password: hashedPassword
  } 
  // console.log("full users:", users);
  //OLD SYNTAX res.cookie("user_id", randString);
  req.session.user_id = randString;
  return res.redirect("/urls");  
});


app.post("/login", (req, res) => {
  // console.log("Post login email lookup: ", req.body.email);
  const user = userLookup(req.body.email, users);
  if (!user) {
    console.log("user not found");
    return res.status(403).send('Invalid credentials.');
  } 

  // const comparePass = bcrypt.compare(req.body.password, users[user]["password"];
  bcrypt.compare(req.body.password, users[user]["password"]).then(function(result) {
    if (!result) {
      console.log("wrong password");
      return res.status(403).send('Invalid credentials.');
    }
    // console.log("/login post: ", users[user]["id"])
    // res.cookie("user_id", users[user]["id"]);
    req.session.user_id = users[user]["id"];
    res.redirect("/urls");
  });
  
});

app.post("/logout", (req, res) => {
  // res.clearCookie('user_id');
  req.session = null;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.redirect("/login");
  }
  // console.log(req.body);  // Log the POST request body to the console
  urlDatabase[generateRandomString()] = {"longURL": req.body["longURL"], "userID": req.session.user_id};
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.redirect("/login");
  }
  if (urlDatabase[req.params.shortURL]["userID"] === req.session.user_id) {
    // console.log(req.params);
    delete urlDatabase[req.params.shortURL];
    console.log("post deleted");
    res.redirect("/urls");
  } else {
    console.log("not deleted");
    return res.status(403).send('Invalid credentials.');
  }
  
});

app.post("/urls/:shortURL/update", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.redirect("/login");
  }
  if (urlDatabase[req.params.shortURL]["userID"] === req.session.user_id) {
    // console.log(req.body.newLink);
    urlDatabase[req.params.shortURL] = {"longURL": req.body.newLink, "userID": req.session.user_id}
    //b6UTxQ: { longURL: "https://www.tsn.ca", userID: "q6ibtc" },
    console.log("post received");
    res.redirect("/urls");
  } else {
    console.log("not changed");
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
