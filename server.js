var http = require('http');
var fs = require('fs');
var express = require('express');
var app = express();


var PORT = 8085;
var UPDATEINTERVAL = 60000;


var timers = [];
var defaultName = "Untitled";
var filename = "timers.json"
var writeToFile = false;

loadFile()
setInterval( function(){if(writeToFile) {updateFile(); writeToFile = false;}}, UPDATEINTERVAL);

//------------------------
// WEBSITE
//------------------------

//Bind webbserver to port PORT
app.listen(PORT); 
console.log("[INFO]: Application listening at port " + PORT);

//Static files in the www-folder
app.use(express.static(__dirname + '/www'));

//The timers as json
app.use("/timers", function(req, res, next) {res.setHeader('Content-Type', 'application/json'); res.send(JSON.stringify(timers));});

//Edit title
app.use("/editTitle" ,function(req, res, next){
	editTitle(req.query.id, req.query.newTitle)
	res.send("Title changed");
});

//New event registered for timer
app.use("/done" ,function(req, res, next){
	timerDone(req.query.id)
	res.send("Event recorded");
});

//Remove a timer
app.use("/remove" ,function(req, res, next){
	removeTimer(req.query.id)
	res.send("Timer removed");
});

//Add new timer
app.use("/newTimer" ,function(req, res, next){
	addNewTimer()
	res.send("New timer added");
});

//Redirect every other request to "/"
app.use("/", function(req, res, next) {
	if (req.path.length > 1) {res.redirect("/");}
	else {res.sendfile(__dirname + "/index.html");}
;});

//------------------------
// TIMERS
//------------------------

function addNewTimer() {
	//Get highest id
	nextId = 0;
	timers.forEach(function(timer) {
		if (timer.id >= nextId) {nextId = timer.id + 1}
	});
	
	//Add to array
	timers.push({id: nextId, title: defaultName, average: 0, history: [Date.now()]});
	writeToFile = true;
}

function timerDone(id) {
	timers.forEach(function(timer) {
		if (timer.id == id) {
			//Add to history
			timer.history.push(Date.now())
			
			//Update average
			var timeSum = 0;
			for (i = 1; i < timer.history.length; i++) {
				timeSum += timer.history[i] - timer.history[i-1];
			}			
			timer.average = timeSum/timer.history.length;
		}
	});
	writeToFile = true;
}

function editTitle(id, newTitle) {
	timers.forEach(function(timer) {
		if (timer.id == id) {
			timer.title = newTitle;
		}
	});
	writeToFile = true;
}

function removeTimer(id) {
	timers.forEach(function(timer, timerIndex) {
		if (timer.id == id) {
			indexToRemove = timerIndex;
		}
	});
	timers.splice(indexToRemove, 1)
	writeToFile = true;
}

//------------------------
// FILESYSTEM
//------------------------

function updateFile(){ //Update the database file
	fs.writeFile(filename, JSON.stringify(timers), 'utf8');
	console.log("[FS] File written");
}

function loadFile(){ //Load database from file
	fs.readFile(filename,'utf8', function(err, fileData){
		if (err) {return console.log(err);}
		
		timers = JSON.parse(fileData);
		console.log("[FS] File read");
	})
}