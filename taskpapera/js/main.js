// =parser {{{
var parser = {
	projects: new Array(),

	// =parse
	parse: function(str, fn){
		var count = 0;
		var list = $(ids.list);
		list.innerHTML = "";
		parser.projects = new Array();

		foreach(str.split(/\n+/), function(line){
			var content = trim(line.split(/\s+@/)[0]);
			var tags = line.match(/@[\w\-\_\/\.\,\(\)\:\;]+/g);
			var is_done = false;

			foreach(tags, function(x){
				if(x == "@done") is_done = true;
			});

			if(content.match(/^\-/)){
				// item
				list.appendChild(create_tag("p", function(p){
					p.className = "item_wrap";

					if(fn != undefined){
						fn("item", p, content, tags, is_done);
					}

					// checkbox
					p.appendChild(components.item_checkbox(count, is_done));
					// label
					p.appendChild(components.item_label(content, tags, count, is_done));

				}));

				++count;
			} else if(content.match(/:$/)){
				// project
				parser.projects.push(line);
				list.appendChild(create_tag("h2", function(obj){
					if(fn != undefined){
						fn("project", obj, line, null, null);
					}

					obj.innerHTML = line;
				}));
			}
		});

		var inputs = document.getElementsByTagName("input");
		foreach(inputs, function(x){
			if(x.className == "items"){
				x.addEventListener("click", controller.toggle_done, false);
			}
		});

		parser.update_project_list();
	},

	update_project_list: function(){
		var query = $(ids.search).value.toLowerCase();
		var project_selected = false;
		if(query.match(/^p:/)){
			query = query.replace(/^p:\s*/, "");
			project_selected = true;
		}

		var target = $(ids.project_switcher);
		target.innerHTML = "";
		foreach(parser.projects, function(project){
			var tmp = project.replace(/:\s*$/, "");
			target.appendChild(create_tag("option", function(o){
				o.value = tmp;
				o.innerHTML = tmp;

				if(project_selected && tmp.toLowerCase().match(query)){
					o.selected = true;
				}
			}));
		});

		target.onchange = controller.switch_project;
	},

	color_parse: function(str){
		foreach(str.split(/\n/), function(x){
			var arr = x.split(/\s*:\s*/);
			if(arr.length == 2){
				var target_tag = arr[0];
				var colors = arr[1].split(/\s*,\s*/);

				// settings.color = 
			}
		});
	}
};
// }}}

// =components {{{
var components = {
	// =item_checkbox
	item_checkbox: function(count, is_done){
		return create_tag("input", function(obj){
			obj.type = "checkbox";
			obj.id = "item_" + count;
			obj.checked = is_done;
			obj.className = "items";
		});
	},

	// =item_label
	item_label: function(content, tags, count, is_done){
		return create_tag("label", function(obj){
			obj.id = "label_" + count;
			obj.setAttribute("for", "item_" + count);
			if(is_done) obj.className = "done";
			obj.innerHTML = content;

			foreach(tags, function(tag){
				obj.appendChild(create_tag("span", function(s){
					s.innerHTML = " ";
				}));

				obj.appendChild(create_tag("a", function(a){
					a.setAttribute("href", "javascript:controller.select('"+tag+"');");
					a.innerHTML = tag;
				}));
			});
		});
	},

	// =back_button
	back_button: function(label){
		return create_tag("p", function(p){
			p.id = "back";

			p.appendChild(create_tag("a", function(a){
				a.setAttribute("href", "javascript:controller.refresh();");
				a.innerHTML = label;
			}));
		});
	}
};
// }}}

// =io {{{
var io = {
	// =read
	read: function(key, default_value){
		var v = widget.preferenceForKey(key);
		return (v == undefined || v == "") ? default_value : v;
	},

	// =write
	write: function(key, value){
		widget.setPreferenceForKey(value, key)
		return value;
	},

	// =read_to_textarea
	read_to_textarea: function(){
		var v = io.read(settings.key.data, template.test);
		$(ids.textarea).value = v;
		return v;
	},

	// =write_from_textarea
	write_from_textarea: function(){
		var v = $(ids.textarea).value;
		//widget.setPreferenceForKey(v, settings.key.data);
		io.write(settings.key.data, v);
		return v;
	},

	// =read_window_settings
	read_window_settings: function(){
		var lw = io.read(settings.key.width, 0);
		var lh = io.read(settings.key.height, 0);

		if(lw > settings.min_width && lh > settings.min_height){
			window.resizeTo(lw, lh);
			WidgetChrome.redraw();
		}
	},

	// =write_window_settings
	write_window_settings: function(){
		var nw = window.innerWidth;
		var nh = window.innerHeight;

		io.write(settings.key.width, nw);
		io.write(settings.key.height, nh);
	}
};
// }}}

// =main {{{
(function(){
	// =onload
	window.onload = function(){
		var code = io.read_to_textarea();
		parser.parse(code);

		io.read_window_settings();

		$(ids.color_setting).value = io.read(settings.key.color, "");

		// project_switcher
		//$(ids.project_switcher).addEventListener("change", controller.switch_project, true);
		WidgetChrome.addElementToChrome(ids.project_switcher);

		// search
		var search = $(ids.search);
		search.addEventListener("keyup", controller.search, false);
		search.addEventListener("click", function(e){
			e.currentTarget.select(0, e.currentTarget.value.length);
		}, false);
		WidgetChrome.addElementToChrome(ids.search);

		// toggle window
		WidgetChrome.addElementToChrome("toggle_window_p");

		// normal_mode_buttons
		WidgetChrome.addElementToChrome(ids.normal_mode_buttons);

		// edit_mode_buttons
		WidgetChrome.addElementToChrome(ids.edit_mode_buttons);

		$(ids.about_dialog).style.display = "none";
		WidgetChrome.ButtonConfig.onclick = function(){
			if($(ids.about_dialog).style.display == "none"){
				controller.open_window(ids.about_dialog);
			} else {
				controller.close_window(ids.about_dialog);
			}
		};

		$(ids.version).innerHTML = settings.version;
	};

	// =onresize
	window.onresize = function(){
		io.write_window_settings();
	};
})();
// }}}
