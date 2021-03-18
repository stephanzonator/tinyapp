const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require('morgan');


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('dev'));

app.set("view engine", "ejs");

function generateRandomString() {
  let result = Math.random().toString(36).replace('0.', '');
  return result.slice(0,6);
}

const users = { 
  "userRandomID": { //Pass this user object to your templates via templateVars.
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },

  "q6ibtc": {
    id: "q6ibtc", 
    email: "a@a.com", 
    password: "asdf"
  }
}

function userLookup(emailPass) {
  for (user in users) {
    // console.log("userlookup log: ", emailPass, users[user], users[user]["email"]);
    if (users[user]["email"] === emailPass) {
      // console.log("Found ID:", users[user]["email"], "equivalent to", emailPass);
      return user;
    }
  }
  console.log("User not found");
  return null;
}

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


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/login", (req, res) => { 
  const user = users[req.cookies["user_id"]];
  const templateVars = {"user_id": req.cookies["user_id"], "user": user};
  res.render("urls_login", templateVars);
});

app.get("/register", (req, res) => { 
  const user = users[req.cookies["user_id"]];
  const templateVars = {"user_id": req.cookies["user_id"], "user": user};
  res.render("urls_register", templateVars);
});

app.get("/urls/new", (req, res) => {
  // const user = userLookupById(req.cookies["user_id"]);
  const user = users[req.cookies["user_id"]];
  // console.log("urls/new user log", user, user.email);
  const templateVars = {"user_id": req.cookies["user_id"], "user": user};
  // console.log("/urls/new: ", req.cookies["user_id"], user.email); //.email
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {"user_id": req.cookies["user_id"], shortURL: req.params.shortURL, 
  longURL: urlDatabase[req.params.shortURL], "user": user};
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {"user_id": req.cookies["user_id"], urls: urlDatabase, "user": user};
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send('Please fill out all forms.');
  } 
  if (userLookup(req.body.email)) {
    return res.status(400).send('User already exists.');
  }
  // console.log("register posting correctly")
  const randString = generateRandomString();
  users[randString] = {
    id: randString, 
    email: req.body.email, 
    password: req.body.password
  } 
  // console.log("full users:", users);
  res.cookie("user_id", randString);
  return res.redirect("/urls");  
});


app.post("/login", (req, res) => {
  // console.log("Post login email lookup: ", req.body.email);
  const user = userLookup(req.body.email);
  if (users[user]["password"] !== req.body.password || !user) {
    return res.status(403).send('Invalid credentials.');
  }
  console.log("/login post: ", users[user]["id"])
  res.cookie("user_id", users[user]["id"]);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  urlDatabase[generateRandomString()] = req.body["longURL"];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params);
  delete urlDatabase[req.params.shortURL];
  console.log("post received");
  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
  console.log(req.body.newLink);
  urlDatabase[req.params.shortURL] = req.body.newLink;
  console.log("post received");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
