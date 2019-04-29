const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);
const logger = require('morgan');

const app = express();

// database
app.locals.db = require('./database.js');

// prevents client-side caching (cause of 304 status)
app.disable('etag');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser(process.env.cookie_secret));

const store = new KnexSessionStore({
  knex: db,
  tablename: process.env.session_table
});
 
app.use(session({
  store: store,
  secret: process.env.cookie_secret,
  resave: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
  saveUninitialized: false
}));


app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/', require('./routes'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
