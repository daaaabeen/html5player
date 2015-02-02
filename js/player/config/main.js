define(function (require, exports, module) {
	console.log("load config!");
	//var event = require("pkg!Event");
	
	var Configure = function(){
		var conf = require("text!config/config.json");
		
		this.config =  JSON.parse(conf);
	};
	return new Configure();
});