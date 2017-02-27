/*
	main script - luaEditor
	version: 0.1
	
	API:
		newDocument(string script, string fileName or false)
		openDocument()
		saveDocument(string script)
		find(string toFind)
		findNext(string toFind)
		replace(string str1, string str2)
		replaceAll(string str1, string str2)
		
*/
var fileSaved = false;
var filePath = false;

ace.require("ace/ext/language_tools");
var editor = ace.edit("editor");
editor.setTheme("ace/theme/github");
editor.getSession().setMode("ace/mode/lua");
editor.setOptions({
	enableBasicAutocompletion: true,
	enableSnippets: true,
	enableLiveAutocompletion: true
});

editor.commands.addCommand({
	name: 'gotolineCommand',
	bindKey: {win: 'Ctrl-G', mac: 'Command-G'},
	exec: function(editor) {
		$("#gotoline").click();
	},
	readOnly: true
});

$("#about").click(function(){
	var dialog = bootbox.dialog({
		title: '<b>About:</b>',
		message: '<h3>Lua Editor</h3><p>Github: link<br>Forums: link<br>Trello: <br>By <a href="#">U-12</a><br><br>version: 0.0.2',
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
	var dialog = bootbox.dialog({
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
		$("#lcolor2").attr("data-clipboard-text", '#'+color);
		$("#lcolor").css("background-color", '#'+color);
		this.target.value = '#' + color;
	});

});

// color picker (copty to clipboard)
var clipboard = new Clipboard('#lcolor2');

// options
$("#options").click(function(){
	var dialog = bootbox.dialog({
		title: '<b>Options (em breve):</b>',
		message: '<div class="form-group"> <div class="checkbox"><label>Module API: <input type="checkbox" checked=""></label></div></div>'
/*+'<br><b>Style:<select class="form-control" id="select">'
+ "           <option>Github</option> "
+ "           <option>Monokai</option> "
+ "           <option>Solarized</option> "
+ "           <option>Tomorrow Night</option> "
+ "           <option>Twilight</option> "
+ "         </select> "
+ '        </b><br><br><b><a href="#" class="btn btn-raised btn-danger">Reset</a></b></form>',*/
+'<div class="form-group"><label for="s1">Style: </label><select id="s1" class="form-control"><option value="1">Github</option><option value="2">Monokai</option></select></div>'
+'<div class="form-group"><label for="s2">Language: </label><select id="s2" class="form-control"><option value="1">English</option><option value="2" disabled>Português</option></select></div>',
		buttons: {
			cancel: {
				label: 'Ok!',
				className: 'btn btn-raised btn-info'
			}
		}
	});
	$.material.init();
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

$("#undo").click(function(){
	editor.undo();
});

$("#redo").click(function(){
	editor.redo();
});

$("#find").click(function(){
	var dialog = bootbox.dialog({
		title: '<b>Find and replace:</b>',
		message: '<form class="form-horizontal"><div class="form-group"><label class="col-lg-2 control-label">Find what: </label><div class="col-lg-6"><input type="text" class="form-control" id="fw"></div></div><div class="form-group"><label class="col-lg-2 control-label">Replace what: </label><div class="col-lg-6"><input type="text" class="form-control" id="rw"></div></div><br><div class="form-group"><div class="col-lg-10"><div class="radio"><label><input type="radio" name="fa" id="fa" value="op1" checked=""> Find</label></div><div class="radio"><label><input type="radio" id="ra" name="ra" value="op2"> Replace</label></div></div></div></form>',
		buttons: {
			confirm: {
				label: 'Go!',
				className: 'btn btn-raised btn-success',
				callback: function(){
					if($('#fa').is(':checked')){
						editor.findAll($("#fw").val());
					} else{
						editor.findAll($("#fw").val());
						editor.replaceAll($("#rw").val());
						editor.findAll($("#rw").val());
					}
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

$("#txteditor").click(function(){
	var height = (window.screen.availHeight - window.screen.availHeight * 0.2)+"px";
	var width = (window.screen.availWidth - window.screen.availWidth * 0.4)+"px";
	
	bootbox.dialog({
		title: 'TextArea Editor',
		message: '<iframe src="http://laagtfm.esy.es/textarea/" height="'+height+'" width="'+width+'" style="border: 1px #000 solid;"></iframe>',
		size: 'large',
		buttons: {
			cancel: {
				label: 'Close',
				className: 'btn btn-raised btn-danger'
			}
		}
	});
});

$("#ppeditor").click(function(){
	var height = (window.screen.availHeight - window.screen.availHeight * 0.2)+"px";
	var width = (window.screen.availWidth - window.screen.availWidth * 0.4)+"px";
	
	bootbox.dialog({
		title: 'Popup Editor',
		message: '<iframe src="http://laagtfm.esy.es/" height="'+height+'" width="'+width+'" style="border: 1px #000 solid;"></iframe>',
		size: 'large',
		buttons: {
			cancel: {
				label: 'Close',
				className: 'btn btn-raised btn-danger'
			}
		}
	});
});

$.material.init();

newDocument = function(script){
	var script = script || "";
	editor.setValue(script);
}

editor.getSession().on('change', function(e) {
    $("#lin").text(editor.session.getLength());
	$("#len").text(editor.session.getValue().length);
});