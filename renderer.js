const request = require("request");
const fs = require("fs");
const remote = require('electron').remote;
const {dialog} = require('electron').remote;
// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
$("#raw").click(function(){
	bootbox.dialog({
		title: '<b>Get raw:</b>',
		message: '<input type="text" class="form-control" placeholder="Example: http://pastebin.com/raw/..." id="gr">',
		buttons: {
			confirm: {
				label: 'Go!',
				className: 'btn btn-raised btn-success',
				callback: function(){
					var link = $("#gr").val();
					request(link, function(er, res, body){
						if (!er && res.statusCode == 200) {
							newDocument(body);
							editor.focus();
							filePath = false;
						} else{
							bootbox.alert("Error #1");
						}
					});
				}
			},
			cancel: {
				label: 'Cancel',
				className: 'btn btn-raised btn-danger'
			}
		}
	});
});

$("#openf").click(function(){
	dialog.showOpenDialog({
		title: 'luaEditor - Open File',
		filters: [{ name: 'Lua (.lua)', extensions: ['lua'] }, { name: 'Text file (.txt)', extensions: ['txt'] }],
		properties: ['openFile']
	}, function(path){
		if(path){
			fs.readFile(path[0], 'utf-8', function(er, data){
				if(er) return bootbox.alert('Error #2: '+er);
				newDocument(data);
				filePath = path[0];
			});
		}
	});
});

$("#newf").click(function(){
	newDocument("");
	filePath = false;
});

$("#saveas").click(function(){
	dialog.showSaveDialog({
		title: 'luaEditor - Save File',
		filters: [{ name: 'Lua (.lua)', extensions: ['lua'] }, { name: 'Text file (.txt)', extensions: ['txt'] }],
	}, function(path){
		if(path){
			filePath = path;
			fs.writeFile(path, editor.getValue(), 'utf-8', function(er, data){
				if(er) return bootbox.alert('Error #3: '+er);
			});
		}
	});
});

$("#exit").click(function(){
	var window = remote.getCurrentWindow();
	window.close();
});

$("#savef").click(function(){
	if(filePath){
		fs.writeFile(filePath, editor.getValue(), 'utf-8', function(er, data){
			if(er) return bootbox.alert('Error #4: '+er);
		});
	} else{
		dialog.showSaveDialog({
			title: 'luaEditor - Save File',
			filters: [{ name: 'Lua (.lua)', extensions: ['lua'] }, { name: 'Text file (.txt)', extensions: ['txt'] }],
		}, function(path){
			if(path){
				filePath = path;
				fs.writeFile(path, editor.getValue(), 'utf-8', function(er, data){
					if(er) return bootbox.alert('Error #4: '+er);
				});
			}
		});
	}
});