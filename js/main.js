(function(){
	'use strict';
	requirejs.config({
		paths : {
			"jquery":"lib/jquery-1.9.1",
			"pkg": "lib/requirejs/pkg",
			"text": "lib/requirejs/text",
			"bootstrap":"lib/bootstrap/js/bootstrap.min.js",
		},
		shim:{
			"bootstrap":{
				deps : [ 'jquery' ],  
                exports : 'bootstrap' 
			}
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
