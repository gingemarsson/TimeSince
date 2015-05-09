Time Since.
============
Time Since is a node.js application to keep track of the time since the last instance of an reccuring 
tasks (for example cleaning, updating websites and similar periodic tasks). The application contains 
both a server side node.js script that stores the events in a json file and a html client with a user 
interface. 

Server
------------------------------------ 
The server supports the following actions, triggered by sending a http request to the associated URL 
with the indicated parameters:

 - Return the stored times as JSON (/timers).
 - Edit the title of a timer (/editTitle id=ID newTitle=NEWTITLE).
 - Mark a task as done (/done id=ID [time=TIME]).
 - Undo the latest done action (/undoLatest id=ID).
 - Update all averages. This is useful if the file has been modified externally (/updateAverages).
 - Remove a timer (/remove id=ID).
 - Swap the position of two timers in the list, used to enable custom ordering (/swapTimers id=ID id2=ID2).
 - Add a new timer. The timer will start with a done action at the current time (/newTimer).
 - Toggle the hidden attribute of a timer to tell the client that this timer should be hidden (/toggleHide id=ID).
 
All other requests to the server will be send the corresponding file in thw www folder or, if no file 
exists, be redirected to the server root.
