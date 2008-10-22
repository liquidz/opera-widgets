var $ = function(id){
	return document.getElementById(id);
};

var foreach = function(arr, fn){
	if(!arr) return;
	for(var i = 0; i < arr.length; ++i){
		fn(arr[i]);
	}
};

var trim = function(str){
	return str.replace(/^\s+|\s+$/g, "");
};

var create_tag = function(tag_name, fn){
	var obj = document.createElement(tag_name);
	fn(obj);
	return obj;
};

