var createError 	  = require('http-errors');
var express 		  = require('express');
var path 			  = require('path');
var bodyParser        = require("body-parser");
var session           = require('express-session');
const mysql 		  = require('mysql');			    //// Add SQL
var con               = require('./db');
var Cryptr            = require('cryptr');
var cryptr            = new Cryptr('myTotalySecretKey');
var app               = express();
const port 			  = 3000;

var indexRouter       = require('./routes/index');


// view engine setup
app.set('port', process.env.port || port);
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.enable('trust proxy');
app.set('trust proxy', 'loopback');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ 
     secret: '123456cat',
     resave: false,
     saveUninitialized: true,
     cookie: { maxAge: 3600000 * 3 }
}))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', indexRouter);



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
  res.render('error', {message:err});
});

module.exports = app;
