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
	
	ajax.fail(function() {console.log('FEL: Anslutningen kunde inte upprättas.')})
}

//Generate all the timers
function generateTimers() {
	var htmlString = "";

	data.forEach(function(section){
		htmlString += " <div class='card'>"
		htmlString += "	<h1 class='title'><span class='titleText' data-editId='editTitle-" + section.id + "'>" + section.title + "</span><input type='text' class='editTitle' id='editTitle-" + section.id + "' data-id='" + section.id + "'></input><h1>"
		htmlString += "	<span class='timer' data-lastTimedate='" + section.history[section.history.length - 1] + "' id='timer-" + section.id + "'>" + timeSince(section.history[section.history.length - 1]) + " ago</span>"
		htmlString += "	<div class='tags'>"
		if (section.average > 0) {htmlString += "		<span class='average tag'>" + timeSince(Date.now() - section.average) + " average (" + section.history.length + ")</span><br />";}
		htmlString += "	</div>"
		htmlString += "	<div class='progressbar'><span class='meter' id='progress-" + section.id + "'></span></div>"
		htmlString += "	<div class='buttons'><div class='button done' data-id='" + section.id + "'>&#10003; Done!</div><div class='button remove' data-id='" + section.id + "'> &#10005; Remove</div></div>"
		htmlString += "</div>"
	});
	
	$(".timers").html(htmlString)
	
	//Edit titles
	$(".titleText").dblclick(editTitle);
	
	//Click done
	$(".done").click(function(e){sendCommand("/done?id=" + $(this).attr("data-id")); doGenerate(); setTimeout(doGenerate(), 300);});
	
	//Remove
	$(".remove").click(function(e){if(confirm("Remove timer?")){sendCommand("/remove?id=" + $(this).attr("data-id")); doGenerate(); setTimeout(doGenerate(), 300);}});

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

//Update all the timers
function updateTimers() {
	data.forEach(function(section){
		$("#timer-" + section.id).html(timeSince(section.history[section.history.length - 1]) + " ago");
		
		progress = (Date.now() - section.history[section.history.length - 1])/section.average;
		if (progress < 1) {
			$("#progress-" + section.id).css("width", (progress * 100) + "%");
		}
		else if (progress > 10 && progress != Infinity) {
			$("#progress-" + section.id).css("width", "100%");
			$("#progress-" + section.id).css("background", "#b80d0d");
		}
		else {
			$("#progress-" + section.id).css("width", "100%");
			$("#progress-" + section.id).css("background", "#b8500d");
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