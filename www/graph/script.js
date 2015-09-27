
$( ".selectTimer" ).change(function() {
  parseData(data[$( ".selectTimer" ).val()]);
});

$( window ).resize(function() {
  parseData(data[$( ".selectTimer" ).val()]);
});

//Generate the page

gridColorHor = "#444444";
gridColorVer = "#5a5a5a";
markerColor = "#00DD00"
markerLineColor = "#00AA00"
averageColor = "#006600";

dynamicGraphStart = true;
defaultGraphStart = 0;
padding = {T: 20, B:20, L:60, R:20}

numberOfLables = 10;

doGenerate();

function parseData(timer) {
    if (timer.history.length == 1) {draw("canvas", timer.history, [0]);}
    else if (timer.history.length == 2) {draw("canvas", timer.history, [timer.history[0] - timer.history[1], timer.history[0] - timer.history[1]]);}
    else {
        values = [timer.history[1] - timer.history[0]];
        
        for (i = 1; i < timer.history.length - 1; i++) {
            values.push(((timer.history[i] - timer.history[i-1]) + (timer.history[i+1] - timer.history[i]))/2)
        }
        
        values.push(timer.history[timer.history.length - 1] - timer.history[timer.history.length - 2]);
      
        draw("canvas", timer.history, values, timer.average);
    }
}


function draw(canvasID, dataX, dataY, average) {
    var c = document.getElementById(canvasID);
    var ctx = c.getContext("2d");
    
    ctx.canvas.width  = $(".main").width() - 20;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    
    if (dynamicGraphStart) {graphStart = dataX[0]}
    else {graphStart = defaultGraphStart}
    
    graphEnd = dataX[dataX.length - 1];
    
    dataPoints = [];
    
    dataX.forEach(function(timedate, index){
        date = new Date(parseInt(timedate));
        timeString = date.getDate() + "/" + (date.getMonth()+1);
        positionX = padding.L + ((timedate - graphStart)/(graphEnd - graphStart))*(canvas.width - padding.L - padding.R);
        //positionY = canvas.height - (padding.B + ((dataY[index] - Math.min.apply(Math, dataY))/(Math.max.apply(Math, dataY) - Math.min.apply(Math, dataY)))*(canvas.height - padding.T - padding.B));
        positionY = padding.B + ((dataY[index] - Math.min.apply(Math, dataY))/(Math.max.apply(Math, dataY) - Math.min.apply(Math, dataY)))*(canvas.height - padding.T - padding.B);
                
        if (isNaN(positionY)) {positionY = (canvas.height - padding.T - padding.B)/2 + padding.T}
        dataPoints.push( {
            label: timeString,
            positionX: positionX,
            positionY: positionY
        })
    });
   
   ctx.lineWidth = 1;
   
   //GRID HORIZONTAL
    ctx.strokeStyle = gridColorHor;
    for (i = canvas.height/5; i < canvas.height; i += canvas.height/5) {
        ctx.moveTo(40,i);
        ctx.lineTo(canvas.width,i);
        
        ctx.font="10px 'Open Sans'";
        ctx.fillStyle = 'white';
       
       
        time = Math.min.apply(Math, dataY) + (Math.max.apply(Math, dataY) - Math.min.apply(Math, dataY))*((i - padding.T)/canvas.height);
        if (time > 0) {
            ctx.fillText(timeSince(time), 35 - ctx.measureText(timeSince(time)).width, i + 3);
        }
    }
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(-11,-11,5,0,2*Math.PI);
    ctx.stroke();
    
    //GRID VERTICAL
    ctx.strokeStyle = gridColorVer;
    dataPoints.forEach(function(marker, markerID) {
        if (dataPoints.length < numberOfLables || markerID % Math.floor((dataPoints.length/numberOfLables)) == 0) {
            ctx.moveTo(marker.positionX,0);
            ctx.lineTo(marker.positionX, canvas.height - 12);
        }
   });
    ctx.stroke();
   
    ctx.beginPath();
    ctx.arc(-11,-11,5,0,2*Math.PI);
    
   
    //AVERAGE
    ctx.strokeStyle = averageColor;
    ctx.moveTo(40, padding.B + ((average - Math.min.apply(Math, dataY))/(Math.max.apply(Math, dataY) - Math.min.apply(Math, dataY)))*(canvas.height - padding.T - padding.B));
    ctx.lineTo(canvas.width, padding.B + ((average - Math.min.apply(Math, dataY))/(Math.max.apply(Math, dataY) - Math.min.apply(Math, dataY)))*(canvas.height - padding.T - padding.B));
    ctx.stroke();
   
    ctx.beginPath();
    ctx.arc(-11,-11,5,0,2*Math.PI);
   
   //MARKERLINES
   ctx.strokeStyle = markerLineColor;
   for (i = 1; i < dataPoints.length; i++) {
      ctx.moveTo(dataPoints[i - 1].positionX,dataPoints[i - 1].positionY);
      ctx.lineTo(dataPoints[i].positionX,dataPoints[i].positionY);
   }
   ctx.stroke();
   
   //MARKERS
   ctx.strokeStyle = markerColor;
   dataPoints.forEach(function(marker, markerID) {
      ctx.lineWidth = 3;
      //console.log(marker.positionX + ", " + marker.positionY) //Every point
      ctx.beginPath();
      ctx.arc(marker.positionX,marker.positionY,1,0,2*Math.PI);
      ctx.stroke();
      
      ctx.font="10px 'Open Sans'";
      ctx.fillStyle = 'white';
            
      if (dataPoints.length < numberOfLables || markerID % Math.floor((dataPoints.length/numberOfLables)) == 0) {
        ctx.fillText(marker.label, marker.positionX - (ctx.measureText(marker.label).width/2), canvas.height);
      }
   });
   
    ctx.stroke();
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

//Generate a readable string describing the specified amount of time
function timeSince(date) {
    var seconds = Math.floor(date / 1000);
    var interval = Math.floor(seconds / 31536000);

    intervalLimit = 1;
    
    if (interval > intervalLimit) {
        return interval + " yrs";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > intervalLimit) {
        return interval + " mns";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > intervalLimit) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > intervalLimit) {
        return interval + " h";
    }
    interval = Math.floor(seconds / 60);
    if (interval > intervalLimit) {
        return interval + " min";
    }
    return Math.floor(seconds) + " s";
}


var data;
function doGenerate(){
    var ajax = $.ajax("/timers")
    
    ajax.done(function(response) {
        data = response;
        fillSelect();
        parseData(data[$( ".selectTimer" ).val()]);
        setTimeout(function(){parseData(data[$( ".selectTimer" ).val()]);}, 300)
    })
}

function fillSelect() {
    htmlString = "";
    data.forEach(function(section, sectionId){
		htmlString += "<option value=" + sectionId + ">" + section.title + "</option>"
	});
    
    $(".selectTimer").html(htmlString)
}