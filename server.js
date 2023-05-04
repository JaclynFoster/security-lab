const path = require("path");
const express = require("express");
const session = require("express-session");

// Mock database to store usernames and passwords by username.
const db = {
  test: {
    username: "test",
    password: "test",
  },
  testhashed: {
    username: "testhashed",
    password: "$2a$10$7WK77kJZ0qzrcgOoE3MszOWuPz2bzPueuSCePScbQnkKwCUx2045q",
  },
};

const app = express();

// Set up EJS as the view engine. We'll use this to serve pages from the views/ directory.
// For example, res.render("index") will render views/index.ejs.
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Built-in middleware to extract data from req.body.
app.use(express.urlencoded({ extended: false }));

// Set up the session middleware. This will allow us to store data in the user's session.
app.use(
  session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: "shhhh, very secret", // secret key used to sign the session ID cookie
  })
);

// Flash messaging middleware.
// This will allow us to set a message in the session, and then display it on the next
// page. This is useful for displaying error messages or success messages to the user.
app.use((req, res, next) => {
  const { error, success } = req.session;

  // Flush existing session messages
  req.session.error = req.session.success = null;
  res.locals.message = ""; // res.locals is how we store local variables in Express

  if (error) {
    res.locals.message = `<p class="msg error">${error}</p>`;
  }
  if (success) {
    res.locals.message = `<p class="msg success">${success}</p>`;
  }

  next(); // move on to the next middleware
});

// Middleware to restrict access to a route.
// When a user logs in, we store their username in the session. If req.session.username
// doesn't exist, don't call next(). Instead, redirect to the homepage and display an
// error message.
const restrict = (req, res, next) => {
  if (req.session.username) {
    next();
  } else {
    req.session.error =
      "Access denied! Try logging in again or create a new account.";
    res.redirect("/");
  }
};

// The homepage.
app.get("/", (req, res) => {
  res.render("index");
});

// Handle user login.
app.post("/login", (req, res, next) => {
  // TODO: Get the username and password from form data
  let {username, password} = req.body
  // TODO: Attempt to retrieve the user from the database
  let userInfo = db[username]
  
//   if (userInfo) {
//   //  res.status(400).send("Username does not exist")
//   req.session.error =
//   "Authentication failed, please check your username and password.";
// res.redirect("/")
//   }
  // TODO: If the user exists, check if the password matches the user's password
  if (userInfo && password === userInfo.password) {
    req.session.username = username
    res.session.success = "Logged in successfully!";
    res.redirect("/login/success")
  
  } else {
    req.session.error =
      "Authentication failed, please check your username and password.";
    res.redirect("/")
  }
  // TODO: Log the user in by storing their username in the session

  // TODO: Display a success message and redirect to /login/success
  // TODO: If the user doesn't exist or the password doesn't match, display an error
  //       message and redirect to the homepage
});

// Handle user registration.
app.post("/register", (req, res, next) => {
  // TODO: Get the username and password from form data
  let {username, password} = req.body
  let newUser = {}
  // TODO: Check if username already exists in the database
  for (let i = 0; i < db.length; i++) {
    if (username === db[i].username) {
    restrict(req,res, next)
    }
  }
  // TODO: If it doesn't, create a new user and store it in the database
  if (!username === db[i].username && !password === db[i].password) {
    newUser.username = username
    newUser.password = password
    db.push(newUser)
    res.status(200).send("Success")
    res.redirect("/")
  } else {
   restrict(req, res, next)
  }
  // TODO: Display a success message to the user
  // TODO: If the user already exists, display an error message
  // TODO: Either way, redirect to the homepage so they can log in
});

// A restricted route that can only be accessed if the user is logged in.
app.get("/login/success", restrict, (req, res) => {
  res.render("login-success", { username: req.session.username });
});

// Destroy the user's session cookie to log them out.
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.listen(8000, () => console.log("Server running on port 8000"));
