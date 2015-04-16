var http = require('http');
var express = require('express');
var app = express();

var PORT = 8085;


//------------------------
// INITIATION
//------------------------

//Bind webbserver to port PORT
app.listen(PORT); 
console.log("[INFO]: Application listening at port " + PORT);

//Static files in the www-folder
app.use(express.static(__dirname + '/www'));

//The timers as json
app.use("/timers", function(req, res, next) {res.sendfile(__dirname + "/timers.json");});

//Redirect every other request to "/"
app.use("/", function(req, res, next) {
	if (req.path.length > 1) {res.redirect("/");}
	else {res.sendfile(__dirname + "/index.html");}
;});