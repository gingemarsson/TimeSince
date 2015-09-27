$(".go").click(function(){calc();});
$(".send").click(function(){send();});

$(".result").click(function(){
    $(".resultField").show();
    $(".resultField").select();
});

$(".resultField").click(function(){
    $(".resultField").hide();
});

doGenerate();

//Generate the page
function calc(){
    console.log("Go");
    
    days = ["Mon", "Tue", "Wed", "Thur", "Fri", "Sat", "Sun"]
    
    timedate = Date.now() - 60*60*1000*24 * $("#value").val()
    date = new Date(timedate)
    
    timeString = days[date.getDay()-1] + " " + 
        date.getFullYear() + "-" +
        ("0" + (date.getMonth()+1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + " " 
        + ("0" + date.getHours()).slice(-2) + ":" 
        + ("0" + date.getMinutes()).slice(-2);
    
	$(".result").html(timeString + "<hr />" + timedate);
    $(".resultField").val(timedate);
}

$(document).keypress(function(e){
    if (e.which == 13){
       $(".go").click();
    }
});

toggle = true;
$(document).keydown(function(e){
    if (e.which == 9){
        calc()
        console.log(toggle);
        if (toggle) {
            $(".result").click();
            e.preventDefault();
            toggle = false;
        }
        else {
            $("#value").select()
            $(".resultField").hide();
            toggle = true;
            e.preventDefault();
        }
    }
});

function send() {
    var ajax = $.ajax("/done?id=" + $(".selectTimer").val() + "&time=" + $(".resultField").val());
	
	ajax.done(function(response) {
		showSuccNotification();
	})
	
	ajax.fail(function() {showFailNotification();})
}

var messageShowTime = 2000;
var messageAnimationTime = 100;

function showSuccNotification() {
    $(".notSucc").fadeIn(messageAnimationTime);
    setTimeout(function(){$(".notSucc").fadeOut(messageAnimationTime);}, messageShowTime)
}

function showFailNotification() {
    $(".notFail").fadeIn(messageAnimationTime);
    setTimeout(function(){$(".notFail").fadeOut(messageAnimationTime);}, messageShowTime)
}


var data;
function doGenerate(){
	var ajax = $.ajax("/timers")
	
	ajax.done(function(response) {
		data = response;
		fillSelect();
	})
	
	ajax.fail(function() {connectionErrorAlert();})
}

function fillSelect() {
    htmlString = "";
    data.forEach(function(section, sectionId){
		htmlString += "<option value=" + section.id + ">" + section.title + "</option>"
	});
    
    $(".selectTimer").html(htmlString)
}