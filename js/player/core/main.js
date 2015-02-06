define(function (require, exports, module) {
	var Event = require("pkg!Event");
	var config = require("pkg!config");
	//console.log(config);
	var Player = function(){
		
		var Kernel = require("pkg!Kernel");
		Kernel.init();
		var View = require("pkg!View");
		View.init();
	};
	Player.prototype.Event = Event;
	
	return Player;
	
});
