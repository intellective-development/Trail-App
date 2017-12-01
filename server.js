// Created by Diori

// 'use strict'
const express = require('express');
const http = require('http');
const bodyparser = require('body-parser');
const socketio = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname,'public')));

app.get('/',function(req,res) {
	res.send('Hello!');
})

var clients = [];
var filePath = 'data.json';
var goLiveEvent = false;


// ====== reset Json file =======
function resetDataJsonFile(){
	fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) throw err;
        var object = {"id":"events","data":[]};
        object = JSON.stringify(object);
        fs.writeFile (filePath, object, function(err) {
            if (err) throw err;
        });
	});
}

resetDataJsonFile();


io.on('connection',socket =>{

	 // ======= Put socket ID in clients Array =======
	if(socket.handshake.query.token){
		clients.push({"token":socket.handshake.query.token,"id":socket.id});
	}

	var position = clients.findIndex(x => x.token == 'A');
	if(position != -1){
		resetDataJsonFile();
		goLiveEvent = false;
	}

	// ======= Write data.json file =======
	function writeFileJson(srcPath,arrayList){
		fs.readFile(srcPath, 'utf8', function (err, data) {
	        if (err) throw err;
	        if(data){
	        	var getRegions = JSON.parse(data);
		        var cnt = 0;
	        	if(!getRegions.data.length){
		        	var emptyArray = {'group_1':[]};
		        	getRegions.data.push(emptyArray);
		        }else{
		        	var totalLength = getRegions.data.length;
	        		var lastInsertRow = getRegions.data[totalLength - 1]['group_'+totalLength+''].length;
	        		cnt = lastInsertRow;
		        }

		       	// get the coordinates data from cursor trail and store into Temporary Array
	        	var getArray = arrayList.filter(function(obj){
	        		var totalLength = getRegions.data.length;
	        		var lastInsertRow = getRegions.data[totalLength - 1]['group_'+totalLength+''].length;
	        		if(lastInsertRow == 10){
	        			var key = 'group_'+(totalLength + 1)+'';
	        			var emptyArray = {['group_'+(totalLength + 1)+'']:[]};
	        			cnt = 0;
		        		getRegions.data.push(emptyArray);
	        		}

		        	var data = {
		        		'pageX' : obj.pageX,
		        		'pageY' : obj.pageY,
		        		'speed' : obj.speed,
		        		'timestamp' : new Date()
		        	}
		        	var dataObj = {['second_'+(cnt + 1)+'']:data};
		        	var totalLength = getRegions.data.length;
		        	getRegions.data[totalLength - 1]['group_'+totalLength+''].push(dataObj);
	        		cnt++;
	    		});

		        getRegions = JSON.stringify(getRegions);

		        // ====== store data in json file ======
		        fs.writeFile (srcPath, getRegions, function(err) {
		            if (err) throw err;
		        });
	        }

    	});
	}

	 // ====== Broadcast First App Function =======
	socket.on('stepOne',(data,storeJson) => {
		if(storeJson){
			writeFileJson(filePath,data);
		}
		getIndex = clients.findIndex(x => x.token == 'B');
        if(getIndex != -1 && goLiveEvent){
			socket.broadcast.to(clients[getIndex].id).emit('stepTwoData',data);
		}
	});


	 // ======= Read data.json file =======
	function readFileJson(srcPath){
		fs.readFile(srcPath, 'utf8', function (err, data) {
	        if (err) throw err;
	        var getRegions = JSON.parse(data);
	        getIndex = clients.findIndex(x => x.token == 'B');
	        if(getIndex != -1){
				socket.emit('stepTwoData',getRegions,true);
			}
    	});
	}

	 // ====== Broadcast Second App Function =======
	socket.on('stepTwo',(val) => {
		if(val){
			goLiveEvent = true;
			getIndex = clients.findIndex(x => x.token == 'A');
	        if(getIndex != -1 && goLiveEvent){
				socket.broadcast.to(clients[getIndex].id).emit('stepOneReset');
			}
		}else{
			goLiveEvent = false;
			readFileJson(filePath);
		}
	});


	 // ======= Socket disconnect event =======
	socket.on('disconnect', () => {
		var index = clients.findIndex(x => x.id == socket.id);
		if(index != -1){
			clients.splice(index,1);
		}
	});

});

server.listen(3000,function(err){
	console.log('server started on port 3000');
})
