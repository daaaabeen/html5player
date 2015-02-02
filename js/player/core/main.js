define(function (require, exports, module) {
	var Event = require("pkg!Event");
	var config = require("pkg!config");
	//console.log(config);
	var Player = function(){
		//console.log(this.Event);
		//var testa = require("pkg!testa");
		//console.log(testa);
		var Kernel = require("pkg!Kernel");
		
		Kernel.init(document.getElementById( config.config.canvas.viewId ), document.getElementById( config.config.audio.audioId ) );
		var View = require("pkg!View");
		View.init();
	};
	Player.prototype.Event = Event;
	//console.log(Event);
	
	//var testb = require("pkg!testb");
	//console.log(testb);
	
	return Player;
	
});
