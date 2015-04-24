//Page load actions
var data;
$(".add").click(function(){sendCommand("/newTimer"); doGenerate(); setTimeout(doGenerate(), 300);});
$("header").click(function(){doGenerate();});

doGenerate()
setInterval(updateTimers, 1000);
setInterval(doGenerate, 3000000);

//Generate the page
function doGenerate(){
	var ajax = $.ajax("/timers")
	
	ajax.done(function(response) {
		data = response;
		generateTimers();
		updateTimers();
	})
	
	ajax.fail(function() {connectionErrorAlert();})
}

//Generate all the timers
function generateTimers() {
	var htmlString = "";

	data.forEach(function(section, sectionId){
		htmlString += "<div class='card'>"
		htmlString += "<h1 class='title'><span class='titleText' data-editId='editTitle-" + section.id + "'>" + section.title + "</span><input type='text' class='editTitle' id='editTitle-" + section.id + "' data-id='" + section.id + "'></input><h1>"
		htmlString += "<span class='timer' id='timer-" + section.id + "' title='" + new Date(section.history[section.history.length - 1]).toString() + "'></span>"
		
		htmlString += "<div class='tags'>"
		if (section.average > 0) {htmlString += "<span class='average tag' title='" + (section.average/(1000*60*60)).toFixed(2) + " h'>" + timeSince(Date.now() - section.average) + " average (" + section.history.length + ")</span><br />";}
		htmlString += "</div>"
		
		htmlString += "<div class='progressbar' id='progress-" + section.id + "'><span class='meter'></span></div>"
		htmlString += "<div class='buttons'>"
		
		htmlString += "<div class='button done' data-id='" + section.id + "'>&#10003; Done!</div>"
		htmlString += "<div class='button remove' data-id='" + section.id + "'> &#10005; Remove</div>"
		if (data[sectionId - 1] != undefined) {htmlString += "<div class='button up' data-id='" + section.id + "' data-swapWith='" + data[sectionId - 1].id + "'>&#x25B2;</div>"}
		if (data[sectionId + 1] != undefined) {htmlString += "<div class='button down' data-id='" + section.id + "' data-swapWith='" + data[sectionId + 1].id + "'>&#x25BC;</div>"}
		
		htmlString += "</div>"
		htmlString += "</div>"
	});
	
	$(".timers").html(htmlString)
	
	//Edit titles
	$(".titleText").dblclick(editTitle);
	
	//Click done
	$(".done").click(function(e){sendCommand("/done?id=" + $(this).attr("data-id")); doGenerate(); setTimeout(doGenerate(), 300);});
	
	//Remove
	$(".remove").click(function(e){if(confirm("Remove timer?")){sendCommand("/remove?id=" + $(this).attr("data-id")); doGenerate(); setTimeout(doGenerate(), 300);}});
	
	//Up
	$(".up").click(function(e){sendCommand("/swapTimers?id=" + $(this).attr("data-id") + "&id2=" + $(this).attr("data-swapWith")); doGenerate(); setTimeout(doGenerate(), 300);});
	
	//Down
	$(".down").click(function(e){sendCommand("/swapTimers?id=" + $(this).attr("data-id") + "&id2=" + $(this).attr("data-swapWith")); doGenerate(); setTimeout(doGenerate(), 300);});

}

//Edit title
function editTitle(e) {
	$("#" + $(this).attr("data-editId")).val($(this).html());
	$(this).html("&nbsp;");
	$("#" + $(this).attr("data-editId")).show();
	$("#" + $(this).attr("data-editId")).focus();
	
	//Close the editor when enter is pressed
	$("#" + $(this).attr("data-editId")).unbind();
	$("#" + $(this).attr("data-editId")).keyup(function(e) {
		if(e.keyCode == 13) {
			$(this).hide();
			$("[data-editId='" + $(this).attr("id") + "']").html($(this).val());
			sendCommand("/editTitle?id=" + $(this).attr("data-id") + "&newTitle=" + $(this).val());
		}
	});
}

//Send an update to the server
function sendCommand(command) {
	var ajax = $.ajax(command)
			
	ajax.done(function(response) {})
	ajax.fail(function() {connectionErrorAlert(command);})
}

var tryingToConnect = false;
function connectionErrorAlert(command) {
	if (tryingToConnect) {return;} //Make sure only one instance of trying to connect is run at the same time
	$(".notification").show();
	
	tryingToConnect = true;
	
	var loop = setInterval( function(){
		var ajax = $.ajax("/timers");
		
		ajax.done(function(response) {
			clearInterval(loop);
			$(".notification").fadeOut()
			tryingToConnect = false;
			doGenerate();
		});
	}, 5000);

}

//Update all the timers
function updateTimers() {
	data.forEach(function(section){
		progress = (Date.now() - section.history[section.history.length - 1])/section.average;
		
		$("#timer-" + section.id).html(timeSince(section.history[section.history.length - 1]) + " ago");
		$("#progress-" + section.id).attr("title", (progress * 100).toFixed(1) + "%");
		
		if (progress < 1) {
			$("#progress-" + section.id + " .meter").css("width", (progress * 100) + "%");
		}
		else if (progress > 10 && progress != Infinity) {
			$("#progress-" + section.id + " .meter").css("width", "100%");
			$("#progress-" + section.id + " .meter").css("background", "#b80d0d");
		}
		else {
			$("#progress-" + section.id + " .meter").css("width", "100%");
			$("#progress-" + section.id + " .meter").css("background", "#b8500d");
		}
		
	});
}

//Generate a readable string describing the specified amount of time
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