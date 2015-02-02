(function(){
	'use strict';
	requirejs.config({
		paths : {
			"jquery":"lib/jquery-1.9.1",
			"pkg": "lib/requirejs/pkg",
			"text": "lib/requirejs/text",
		},
		config: {
		    pkg: {
		    	path: "player"
		    }
		}
	});
	
	
	//////////// 入口 /////////////////
	requirejs(["pkg!core"], function (App) {
	    var player = new App();
	    return player;
	});
	
})();
