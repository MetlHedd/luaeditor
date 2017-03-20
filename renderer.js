// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
/*
    luaEditor
    By U-12 (Breno Alves)

    Github: https://github.com/U-12/luaeditor
    License: https://raw.githubusercontent.com/U-12/luaeditor/master/LICENSE.md
*/

const request = require("request");
const fs = require("fs");
const remote = require('electron').remote;
const {dialog} = remote;
const {Menu, MenuItem} = remote;
const menu = new Menu();
const clipboard = remote.clipboard;
const storage = require('electron-json-storage');
const ipcRenderer = require('electron').ipcRenderer;
const mdapi = require("./modules/moduleapi.js")
let mdfn = fs.readFile('./modules/mdapi_functions.json', 'utf-8', function(er, data){
	if(er) mdfn = []
	mdfn = JSON.parse(data)
})

// menu
menu.append(new MenuItem({label: 'Cut', click() { clipboard.writeText(editor.session.getTextRange(editor.getSelectionRange()));editor.session.remove(editor.getSelectionRange()); }}));
menu.append(new MenuItem({label: 'Copy', click() { clipboard.writeText(editor.session.getTextRange(editor.getSelectionRange())); }}));
menu.append(new MenuItem({label: 'Paste', click() { editor.insert(clipboard.readText()); }}));
menu.append(new MenuItem({type: 'separator'}))
menu.append(new MenuItem({label: 'Select All', click() { editor.selectAll() }}));
window.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  menu.popup(remote.getCurrentWindow())
}, false);

ace.require("ace/ext/language_tools");


function luaEditor(){
    this.fileSaved = false;
    this.filePath = false;
    this.editor = ace.edit("editor");

	// options
	var themes = {
		"github": true,
		"monokai": true,
		"eclipse": true,
		"tomorrow": true,
		"solarized_dark": true,
		"chaos": true
	};
	var defaultOptions = { theme: "Github", path: false, language: "en", script: false };
	this.options = defaultOptions;

	var self = this;

	storage.has('options', function(er, has){
		if(er) bootbox.alert("Storage error: "+er);
		if(has){
			storage.get('options', function(er, data){
				if(er) bootbox.alert("Storage error: "+er);
				self.options = data;
				for(var i in defaultOptions){
					if(!self.options[i]) self.options[i] = defaultOptions[i];
				}
				if(!themes[self.options.theme]) self.options.theme = "github";
				this.editor.setTheme("ace/theme/"+self.options.theme);
				if(self.options.path){
					fs.readFile(self.options.path, 'utf-8', function(er, data){
						if(er){
							self.options.path = false;
							storage.set('options', self.options, function(er){if(er) bootbox.alert("Storage error: "+er);});
						} else{
							self.filePath = self.options.path;
							self.fileSaved = true;
							self.editor.setValue(data);
						}
					});
				} else{
					if(self.options.script) self.editor.setValue(self.options.script);
				}
			});
		} else{
			storage.set('options', defaultOptions, function(er){ if(er) bootbox.alert("Storage error: "+er); });
		}
	});

    //this.editor.setTheme("ace/theme/github");
    this.editor.getSession().setMode("ace/mode/lua");
    this.editor.setOptions({
	    enableBasicAutocompletion: true,
	    enableSnippets: true,
	    enableLiveAutocompletion: true
    });
    this.editor.commands.addCommand({
        name: 'gotolineCommand',
        bindKey: {win: 'Ctrl-G', mac: 'Command-G'},
        exec: function(editor) {
            $("#gotoline").click();
        },
        readOnly: true
    });
	this.editor.commands.addCommand({
		name: 'findCommand',
		bindKey: {win: 'Ctrl-F', mac: 'Command-F'},
		exec: function(editor) {
			$('#find').click();
		},
		readOnly: true
	});
	this.editor.commands.addCommand({
		name: 'replaceCommand',
		bindKey: {win: 'Ctrl-H', mac: 'Command-H'},
		exec: function(editor) {
			$('#find').click();
		},
		readOnly: true
	});
};

var lE = new luaEditor();
editor = lE.editor;

// buttons
$("#about").click(function(){
	bootbox.dialog({
		title: '<b>About:</b>',
		message: '<h3>Lua Editor</h3><p>Github: <u>https://github.com/U-12/luaeditor</u><br>Forums: <u>http://atelier801.com/topic?f=6&t=819122&p=1</u><br>Trello: ??<br>By <a href="#">U-12 (https://github.com/U-12)</a><br><br>version: <b>0.1.0</b>',
		buttons: {
			cancel: {
				label: 'Close',
				className: 'btn btn-raised btn-danger'
			}
		},
		backdrop: true
	});
});

$("#colorp").click(function(){
	var picker;
	bootbox.dialog({
		title: '<b>Color Picker:</b>',
		message: '<input id="color" type="text" class="form-control">',
		buttons: {
			cancel: {
				label: 'Close',
				className: 'btn btn-raised btn-danger',
				callback: function(){
					picker.destroy();
				}
			}
		},
		backdrop: true
	});
	
	picker = new CP(document.getElementById('color'));
	picker.on("change", function(color) {
		$("#lcolor2").text("#"+color);
		$("#lcolor").css("background-color", '#'+color);
		this.target.value = '#' + color;
	});

});

$("#lcolor2").click(function() {
	clipboard.writeText($("#lcolor2").text());
});

$("#options").click(function(){
	bootbox.dialog({
		title: '<b>Options:</b>',
		message: '<div class="form-group"> <div class="checkbox"><label>Module API: <input type="checkbox" checked=""></label></div></div>'
/*+'<br><b>Style:<select class="form-control" id="select">'
+ "           <option>Github</option> "
+ "           <option>Monokai</option> "
+ "           <option>Solarized</option> "
+ "           <option>Tomorrow Night</option> "
+ "           <option>Twilight</option> "
+ "         </select> "
+ '        </b><br><br><b><a href="#" class="btn btn-raised btn-danger">Reset</a></b></form>',*/
+'<div class="form-group"><label for="s1">Style: </label><select id="s1" class="form-control" selected="'+lE.options.theme+'"><option value="github">Github</option><option value="monokai">Monokai</option><option value="eclipse">Eclipse</option><option value="tomorrow">Tomorrow</option><option value="chaos">Chaos</option><option value="solarized_dark">Solarized Dark</option></select></div>'
+'<div class="form-group"><label for="s2">Language: </label><select id="s2" class="form-control"><option value="en">English</option><option value="pt" disabled>Português</option></select></div>',
		buttons: {
			confirm: {
				label: 'Ok!',
				className: 'btn btn-raised btn-success',
				callback: function(){
					var themeS = $('#s1 :selected').val();
					lE.options.theme = themeS;
					storage.set('options', lE.options, function(er){
						if(er) bootbox.alert("Storage error: "+er);
					});
					bootbox.alert("Changes will be applied in next restart!");
				}
			},
			reset: {
				label: 'Clear storage',
				className: 'btn btn-raised btn-warning',
				callback: function(){
					storage.clear(function(er){ if(er) bootbox.alert("Storage error: "+er); });
					bootbox.alert("Changes will be applied in next restart!");
				}
			},
			cancel: {
				label: 'Cancel',
				className: 'btn btn-raised btn-danger'
			}
		}
	});
	$.material.init();
	$('select').select2();
});

// gotoline, undo, redo, find, replace, selectall
$("#gotoline").click(function(){
	bootbox.dialog({
		title: '<b>Go to Line:</b>',
		message: '<input type="number" class="form-control" id="lineNumber" value="1" min="1" max="' + editor.session.getLength() + '">',
		buttons: {
			confirm: {
				label: 'Go!',
				className: 'btn btn-raised btn-success',
				callback: function(){
					editor.gotoLine(parseInt($("#lineNumber").val()));
				}
			},
			cancel: {
				label: 'Cancel',
				className: 'btn btn-raised btn-danger'
			}
		}
	});
});

$("#copy").click(function() {
	clipboard.writeText(editor.session.getTextRange(editor.getSelectionRange()));
});

$("#paste").click(function() {
	editor.insert(clipboard.readText());
});

$("#cut").click(function() {
	$("#copy").click();
	editor.session.remove(editor.getSelectionRange());
});

$("#undo").click(function(){
	editor.undo();
});

$("#redo").click(function(){
	editor.redo();
});

$("#find").click(function(){
	var dialog = bootbox.dialog({
		title: '<b>Find and replace:</b>',
		message: '<form class="form-horizontal">' + 
					'<div class="form-group">' + 
						'<label class="col-lg-2 control-label">Find what: </label>' +
						'<div class="col-lg-6">' +
							'<input type="text" class="form-control" id="fw">' +
						'</div>' +
					'</div>' + 
					'<div class="form-group">' +
						'<label class="col-lg-2 control-label">Replace what: </label>' + 
						'<div class="col-lg-6">' + 
							'<input type="text" class="form-control" id="rw">' +
						'</div>' +
					'</div><br>' +
					'<div class="form-group">' + 
						'<div class="col-lg-10">' + 
							'<div class="radio">' + 
								'<label>' + 
									'<input type="radio" name="fa" id="fa" value="op1" checked=""> Find' + 
								'</label>' + 
							'</div>' + 
							'<div class="radio">' + 
								'<label>' + 
									'<input type="radio" id="ra" name="ra" value="op2"> Replace' + 
								'</label>' + 
							'</div>' + 
						'</div>' + 
					'</div>' + 
					'<div class="form-group" style="margin-top: 0;">' +
						'<div class="col-lg-10">' +
							'<div class="checkbox">' +
								'<label>' +
									'<input type="checkbox" id="use-reg-exp"> Regular Expression&nbsp;&nbsp;&nbsp;' + 
								'</label>' +
								'<label>' +
									'<input type="checkbox" id="use-case-sensitive"> Case Sensitive&nbsp;&nbsp;&nbsp;' + 
								'</label>' +
								'<label>' +
									'<input type="checkbox" id="use-whole-word"> Whole Word' + 
								'</label>' +
							'</div>' +
						'</div>' +
					'</div>' +
				'</form>',
		buttons: {
			confirm: {
				label: 'Go!',
				className: 'btn btn-raised btn-success',
				callback: function(){
					editor.findAll($("#fw").val(), {
						regExp: $('#use-reg-exp').is(':checked'),
						caseSensitive: $('#use-case-sensitive').is(':checked'),
						wholeWord: $('#use-whole-word').is(':checked'),
					});

					if(!($('#fa').is(':checked')))
						editor.replaceAll($("#rw").val());

					editor.focus();
				}
			},
			cancel: {
				label: 'Close',
				className: 'btn btn-raised btn-danger'
			}
		}
	});
	
	$('#fa').click(function() {
		var isCheck = this.checked;
		$("#ra").prop("checked", !this.checked);
	});
	$('#ra').click(function() {
		var isCheck = this.checked;
		$("#fa").prop("checked", !this.checked);
	});
	$.material.init();
});

$("#sall").click(function(){
	editor.selectAll();
	editor.focus();
});
//
$("#txteditor").click(function(){
	ipcRenderer.send('open-ta-editor');
});

$("#ppeditor").click(function(){
	ipcRenderer.send('open-pp-editor');
});
//
$.material.init();

// lines and lenght
editor.getSession().on('change', function(e) {
    $("#lin").text(editor.session.getLength());
	$("#len").text(editor.session.getValue().length);
	if(!lE.filePath){
		lE.options.script = editor.getValue();
		storage.set('options', lE.options, function(er){if(er) bootbox.alert("Storage error: "+er);});
	} else{
		lE.options.script = false;
		storage.set('options', lE.options, function(er){if(er) bootbox.alert("Storage error: "+er);});
	}
});

// open, save, save as
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
							lE.filePath = false;
							editor.setValue(body || "");
							editor.focus();
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
				lE.filePath = path[0];
                editor.setValue(data || "");
				lE.options.path = path[0];
				storage.set('options', lE.options, function(er){if(er) bootbox.alert("Storage error: "+er);});
			});
		}
	});
});

$("#newf").click(function(){
	editor.setValue("");
	lE.filePath = false;
	lE.options.path = false;
	lE.options.script = false;
	storage.set('options', lE.options, function(er){if(er) bootbox.alert("Storage error: "+er);});
});

$("#saveas").click(function(){
	dialog.showSaveDialog({
		title: 'luaEditor - Save File',
		filters: [{ name: 'Lua (.lua)', extensions: ['lua'] }, { name: 'Text file (.txt)', extensions: ['txt'] }],
	}, function(path){
		if(path){
			fs.writeFile(path, editor.getValue(), 'utf-8', function(er, data){
				if(er) return bootbox.alert('Error #3: '+er);
				lE.filePath = path;
				lE.options.path = path;
				lE.options.script = false;
				storage.set('options', lE.options, function(er){if(er) bootbox.alert("Storage error: "+er);});
			});
		}
	});
});

$("#exit").click(function(){
	var window = remote.getCurrentWindow();
	window.close();
});

$("#savef").click(function(){
	if(lE.filePath){
		fs.writeFile(lE.filePath, editor.getValue(), 'utf-8', function(er, data){
			if(er) return bootbox.alert('Error #4: '+er);
		});
	} else{
		dialog.showSaveDialog({
			title: 'luaEditor - Save File',
			filters: [{ name: 'Lua (.lua)', extensions: ['lua'] }, { name: 'Text file (.txt)', extensions: ['txt'] }],
		}, function(path){
			if(path){
				fs.writeFile(path, editor.getValue(), 'utf-8', function(er, data){
					if(er) return bootbox.alert('Error #4: '+er);
					lE.filePath = path;
					lE.options.filePath = path;
					lE.options.script = false;
					storage.set('options', lE.options, function(er){if(er) bootbox.alert("Storage error: "+er);});
				});
			}
		});
	}
});

$("#mdtest").click(function(){
	/*let newGame = new mdapi('tfm.exec.newGame', [{ id: 'mapcode', name: 'String/Number/Other', type: 'string', value: '0', ph: 'Example: "@123456", 0, "#12", \'xml\'' }], bootbox, editor);
	newGame.generate(function(script){
		editor.insert(script)
	})
	$.material.init()*/
	bootbox.dialog({
		title: 'Module API',
		message: '<select id="ms"></select>',
		buttons: {
			cancel: {
				label: 'Close',
				className: 'btn btn-raised btn-danger'
			},
			confirm: {
				label: 'Ok!',
				className: 'btn btn-raised brn-success',
				callback: function(){
					let fn = $("#ms :selected").val()
					let mdd = new mdapi(mdfn[fn].text, mdfn[fn].elements, bootbox);
					mdd.generate((script) => editor.insert(script))
				}
			}
		}
	})
	$("#ms").select2({data: mdfn, width: '80%'})
});