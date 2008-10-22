//var version = "0.01";

var ids = {
	container: "container",
	list: "list",
	textarea: "text",
	edit_btn: "edit_button",
	normal_mode: "normal_mode",
	normal_mode_buttons: "normal_mode_buttons",
	edit_mode: "edit_mode",
	edit_mode_buttons: "edit_mode_buttons",
	toggle_window_link: "toggle_window",
	search: "search",
	project_switcher: "project_switcher",
	version: "version",
	about_dialog: "about_dialog",
	color_setting: "color_setting"
};

var settings = {
	version: "20081009",
	key: {
		data: "taskpapera-data",
		width: "taskpapera-width",
		height: "taskpapera-height",
		color: "taskpapera-color"
	},

	mode: {
		normal: 0,
		edit: 1
	},

	min_height: 200,
	min_width: 100,

	color: null
};

var template = {
	test: "project1:\n- task1\n- task2 @done\n -task3 @asap\nproject2:\n- welcome to\n- taskpapera @ver" + settings.version,
	about: "TaskPapera:\n- version @" + settings.version + "\n-author @Masashi @Iizuka"
};


