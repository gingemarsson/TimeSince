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
	editTitle(req.query.id, req.query.newTitle);
	res.send("Title changed");
});

//New event registered for timer
app.use("/done" ,function(req, res, next){
	timerDone(req.query.id, req.query.time);
	res.send("Event recorded");
});

//Undo latest done 
app.use("/undoLatest" ,function(req, res, next){
	undoLatest(req.query.id);
	res.send("Averages updates");
});

//Update averages
app.use("/updateAverages" ,function(req, res, next){
	updateAverages()
	res.send("Averages updates");
});

//Remove a timer
app.use("/remove" ,function(req, res, next){
	removeTimer(req.query.id);
	res.send("Timer removed");
});

//Swap timers
app.use("/swapTimers" ,function(req, res, next){
	swapTimers(req.query.id, req.query.id2);
	res.send("Order changed");
});

//Add new timer
app.use("/newTimer" ,function(req, res, next){
	addNewTimer();
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

function timerDone(id, date) {
	timers.forEach(function(timer) {
		if (timer.id == id) {
			//Add to history
			if (date == undefined || date < timer.history[timer.history.length - 1]) { timer.history.push(Date.now());}
			else {timer.history.push(date);}
			
			updateAverage(timer);
		}
	});
	writeToFile = true;
}

function undoLatest(id) {
	timers.forEach(function(timer, timerIndex) {
		if (timer.id == id) {
			timer.history.splice(timer.history.length - 1, 1)
		}
		
		updateAverage(timer);
	});
	writeToFile = true;
}

function updateAverage(timer) {
	//Update average
	var timeSum = 0;
	for (i = 1; i < timer.history.length; i++) {
		timeSum += timer.history[i] - timer.history[i-1];
	}			
	timer.average = timeSum/(timer.history.length - 1);
}

function updateAverages() {
	timers.forEach(function(timer) {			
		updateAverage(timer);
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

function swapTimers(id, id2) {
	indexToSwap1 = -1;
	indexToSwap2 = -1;
	
	timers.forEach(function(timer, timerIndex) {
		if (timer.id == id) {indexToSwap1 = timerIndex;}
	});
	
	timers.forEach(function(timer, timerIndex) {
		if (timer.id == id2) {indexToSwap2 = timerIndex;}
	});
	
	if(indexToSwap1 != -1 && indexToSwap2 != -1) {
		temp = timers[indexToSwap1];
		timers[indexToSwap1] = timers[indexToSwap2];
		timers[indexToSwap2] = temp;
	}
	
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