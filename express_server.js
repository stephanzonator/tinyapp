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
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
//  });
 
//  app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
//  });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
  
// });

app.get("/register", (req, res) => {
  const templateVars = {"username": req.cookies["username"]};
  res.render("urls_register", templateVars);
});

app.get("/urls/new", (req, res) => {
  // const cookies = cookieParser.JSONCookies(req.headers.cookie);
  console.log(req.cookies["username"]);
  const templateVars = {"username": req.cookies["username"]};
  res.render("urls_new", templateVars);
  // res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {"username": req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {"username": req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
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
