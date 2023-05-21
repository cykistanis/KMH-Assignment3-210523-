const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
// import in routes

const landingRoutes = require('./routes/landing')
const posterRoutes = require('./routes/posters')
const usersRoutes = require('./routes/users')
const cloudinaryRoutes = require('./routes/cloudinary')


const session = require('express-session');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);
const csrf = require('csurf')
require("dotenv").config();


// create an instance of express app
let app = express();

// set the view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(
  express.urlencoded({
    extended: false
  })
);

app.use(session({
  secret: process.env.SESSION_SECRET_KEY,
  store: new FileStore(),
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

app.use(flash())
// app.use(csrf());



app.use(function(req,res,next){
if (req.csrfToken) {
    res.locals.csrfToken = req.csrfToken();
}
next();
})



//Register flash middleware
app.use(function (req, res, next) {
res.locals.success_messages = req.flash("success_messages");
res.locals.error_messages = req.flash("error_messages");
// res.locals.csrfToken = req.csrfToken();
next();
});


// Share the user data with hbs files
app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  next();
})

// enable CSRF
app.use(csrf());

app.use(function (err, req, res, next) {
  if (err && err.code == "EBADCSRFTOKEN") {
      req.flash('error_messages', 'The form has expired. Please try again');
      res.redirect('back');
  } else {
      next();
  }
  });
  

// Share CSRF with hbs files
app.use(function(req,res,next){
  res.locals.csrfToken = req.csrfToken();
  next();
})

async function main() {

  

 

  app.use('/', landingRoutes);
  app.use('/posters', posterRoutes);	
  app.use('/users', usersRoutes);	
  app.use('/cloudinary', cloudinaryRoutes);	
  
   


}

main();

app.listen(3000, () => {
  console.log("Server has started");
});