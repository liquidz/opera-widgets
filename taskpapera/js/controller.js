var controller = {
	backup: "",
	window: {
		is_minimize: false,
		original_height: 0,
		mode: settings.mode.normal
	},

	// =toggle_done
	toggle_done: function(e){
		var obj = e.currentTarget;
		var id = parseInt(obj.id.split(/_/)[1]);
		var result = "";
		var count = 0;

		foreach($(ids.textarea).value.split(/\n+/), function(x){
			var line = trim(x);
			if(line.match(/^\-/)){
				if(count == id){
					if(obj.checked){
						var tmp = line + " @done";
						result += tmp.replace(/\s+/, " ") + "\n";
					} else {
						var tmp = line.replace(/@done/g, "");
						result += tmp.replace(/\s+/, " ") + "\n";
					}
				} else {
					result += line + "\n";
				}
				++count;
			} else {
				result += line + "\n";
			}
		});

		result = trim(result);
	
		$(ids.textarea).value = result;
		io.write_from_textarea();
		parser.parse(result);
	},

	// =edit
	edit: function(){
		$(ids.normal_mode).style.display = "none";
		$(ids.edit_mode).style.display = "block";

		$(ids.normal_mode_buttons).style.display = "none";
		$(ids.edit_mode_buttons).style.display = "block";

		this.backup = $(ids.textarea).value;
		this.window.mode = settings.mode.edit;

		$(ids.textarea).focus();
	},

	// =save
	save: function(){
		$(ids.normal_mode).style.display = "block";
		$(ids.edit_mode).style.display = "none";

		$(ids.normal_mode_buttons).style.display = "block";
		$(ids.edit_mode_buttons).style.display = "none";

		var code = io.write_from_textarea();
		parser.parse(code);

		this.window.mode = settings.mode.normal;
	},

	// =cancel
	cancel: function(){
		$(ids.normal_mode).style.display = "block";
		$(ids.edit_mode).style.display = "none";

		$(ids.normal_mode_buttons).style.display = "block";
		$(ids.edit_mode_buttons).style.display = "none";

		$(ids.textarea).value = this.backup;
		parser.parse(this.backup);
		this.backup = "";
		this.window.mode = settings.mode.normal;
	},

	// =select
	select: function(tag_name){
		$(ids.search).value = "t:" + tag_name;
		controller.search();
		$(ids.list).insertBefore(create_tag("h3", function(x){
			x.innerHTML = "&raquo; " + tag_name;
		}), $(ids.list).firstChild);
	},

	// =toggle_window
	toggle_window: function(){
		var container = $(ids.container);

		if(this.window.is_minimize){
			window.resizeTo(window.innerWidth, this.window.original_height);

			container.style.display = "block";
			$(ids.toggle_window_link).innerHTML = "£";
		} else {
			this.window.original_height = window.innerHeight;
			window.resizeTo(window.innerWidth, 60);

			container.style.display = "none";
			$(ids.toggle_window_link).innerHTML = "¥";
		}
		this.window.is_minimize = !this.window.is_minimize;
		WidgetChrome.redraw();
	},

	// =search
	search: function(e){
		var query = "";
		if(e == undefined){
			query = $(ids.search).value.toLowerCase();
		} else {
			query = e.currentTarget.value.toLowerCase();
		}
		var now_project = null;
		var target_count = 0;
		var search_flag = false;
		var project_search = (query.match(/^p:/)) ? true : false;
		var tag_search = (query.match(/^t:/)) ? true : false;
		if(project_search) now_project = "";

		parser.parse($(ids.textarea).value, function(type, obj, content, tags, id_done){
			if(project_search){
				/* project serach --------------------------------------------*/
				pquery = query.replace(/^p:\s*/g, "");
				if(pquery.length > 1){
					if(type == "item"){
						if(now_project.match(pquery)){
							obj.style.display = "block";
						} else {
							obj.style.display = "none";
						}
					} else if(type == "project"){
						now_project = content.toLowerCase();

						if(now_project.match(pquery)){
							obj.style.display = "block";
						} else {
							obj.style.display = "none";
						}
					}
					search_flag = true;
				} else {
					obj.style.display = "block";
				}
			} else if(tag_search){
				/* tag serach --------------------------------------------*/
				tquery = query.replace(/^t:\s*/g, "");
				if(tquery.length > 1){
					if(type == "item"){
						var target = false;
						foreach(tags, function(tag){
							if(tag.match(tquery)) target = true;
						});

						if(target){
							obj.style.display = "block";
							++target_count;
						} else {
							obj.style.display = "none";
						}
					} else if(type == "project"){
						if(now_project != null){
							if(target_count == 0)
								now_project.style.display = "none";
							else
								now_project.style.display = "block";
						} 
						now_project = obj;
						target_count = 0;
					}
					search_flag = true;
				} else {
					obj.style.display = "block";
				}
			} else {
				/* normal serach --------------------------------------------*/
				if(query.length > 1){
					if(type == "item"){
						if(content.toLowerCase().match(query)){
							obj.style.display = "block";
							++target_count;
						} else {
							obj.style.display = "none";
						}
					} else if(type == "project"){
						if(now_project != null){
							if(target_count == 0)
								now_project.style.display = "none";
							else
								now_project.style.display = "block";
						} 
						now_project = obj;
						target_count = 0;
					}
	
					search_flag = true;
				} else {
					obj.style.display = "block";
				}
			}
		});
		// process for last project
		if(project_search == false && now_project != null){
			if(target_count == 0)
				now_project.style.display = "none";
			else
				now_project.style.display = "block";
		}

		if(search_flag) $(ids.list).appendChild(components.back_button("&laquo; back"));
	},

	switch_project: function(e){
		//opera.postError("v = " + e.currentTarget.value);
		$(ids.search).value = "p:" + e.currentTarget.value;
		controller.search(undefined);
	},

	// =refresh
	refresh: function(){
		parser.parse($(ids.textarea).value);
		$(ids.search).value = "";
	},

	// =open_window
	open_window: function(id){
		var w = $(id);
		w.style.display = "block";

		if(controller.window.mode == settings.mode.normal){
			$(ids.normal_mode).style.display = "none";
			$(ids.normal_mode_buttons).style.display = "none";
		} else if(controller.window.mode == settings.mode.edit) {
			$(ids.edit_mode).style.display = "none";
			$(ids.edit_mode_buttons).style.display = "none";
		} else {
			opera.postError("others = " + controller.window.mode);
		}
	},

	// =close_window
	close_window: function(id){
		$(id).style.display = "none";

		if(controller.window.mode == settings.mode.normal){
			$(ids.normal_mode).style.display = "block";
			$(ids.normal_mode_buttons).style.display = "block";
		} else if(controller.window.mode == settings.mode.edit){
			$(ids.edit_mode).style.display = "block";
			$(ids.edit_mode_buttons).style.display = "block";
		}

		if(id == ids.about_dialog){
			io.write(settings.key.color, $(ids.color_setting).value);
		}
	},

	// =close
	close: function(){
		io.write_window_settings();
		window.close();
	}
};

