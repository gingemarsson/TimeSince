//Create a global variable time to track the time it takes to generate page
var time;

function doGenerate(){
	console.log("Updating..");
	time = Date.now();
	
	var ajax = $.ajax("/timers")
	
	ajax.done(function(response) {
		console.log("Updated (" + (Date.now() - time) + " ms)");
		generateTimers(response);
	})
	
	ajax.fail(function() {console.log('FEL: Anslutningen kunde inte upprättas.')})
}

function generateTimers(data) {
	var htmlString = "";

	data.forEach(function(section){
		htmlString += generateTimer(section);
	});
	
	console.log("Generated HTML (" + (Date.now() - time) + " ms)");
	$(".timers").html(htmlString)
	
	console.log("Done (" + (Date.now() - time) + " ms)");
	
	console.log(data)
}

function generateTimer(section){			
	htmlString = " <div class='card'>"
	htmlString += "	<h1 class='title'>" + section.title + "<h1>"
	htmlString += "	<span class='countdown'>" + timeSince(section.lastTimedate) + " ago</span>"
	htmlString += "	<div class='tags'>"
	htmlString += "		<span class='average tag'>" + timeSince(Date.now() - section.average) + " average</span><br />"
	htmlString += "		<span class='count tag'>" + section.history.length + "</span>"
	htmlString += "	</div>"
	htmlString += "	<div class='progressbar'><span class='meter'></span></div>"
	htmlString += "	<div class='button done'>Done!</div>"
	htmlString += "</div>"
	
	return htmlString;
}

doGenerate()


function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}