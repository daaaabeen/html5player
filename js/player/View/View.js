define(function (require, exports, module) {

	var Events = require("pkg!Event");
	var Kernel = require("pkg!Kernel");
	var $ = require("jquery");
	var View = {
		init:function(){
			this._total_time && ( this._total_time = void 0 );
			this.initialize();
			//Events.on("Kernel:RS:inited",this.play);
			Events.on("Kernel:Control:start", View.on_start, View);
			Events.on("Kernel:Control:play", View.on_play, View);
			Events.on("Kernel:Control:stop", View.on_stop, View);
			Events.on("Kernel:Control:wait", View.on_wait, View);
			Events.on("Kernel:Control:pause", View.on_pause, View);
			Events.on("Kernel:Control:error", View.on_error, View);
			Events.on("Kernel:rs:inited",View.on_rs_inited,View);
			Events.on("Kernel:Control:timechange",View.on_time_change,View);
			Events.on("Kernel:Control:mute_change",View.on_mute_change,View);
			Events.on("Kernel:Control:volume_change",View.on_volume_change,View);
			Events.on("Kernel:Control:seek_end",View.on_seek_end,View);
			
		},
		
		initialize:function(){},
		on_start:function(){},
		on_play:function(){},
		on_stop:function(){},
		on_wait:function(){},
		on_pause:function(){},
		on_error:function(){},
		on_rs_inited:function(){},
		on_time_change:function(){},
		on_mute_change:function(){},
		on_volume_change:function(){},
		on_seek_end:function(){},
		
		//当前的状态
		status : function(){
			return Kernel.status();
		},
		
		//当前时间
		current_time : function(){
			return  Kernel.current_time();	
		},
		
		//时长
		total_time : function(){
			this._total_time || ( this._total_time = Kernel.total_time() );
			return this._total_time;
		},
		
		start:function(url){
			/*
			var fun = function(){
				this.play();
			}.bind(this);
			*/
			Events.trigger("Kernel:Control:start",url);
		},
		
		play:function(url){	
			if( Kernel.status() == "nostatus" || Kernel.status() == "stop"  || Kernel.status() == "error"){
				this.start(url);
			}else{
				Events.trigger("Kernel:Control:play");
			}
		},
		seek_to:function(pos){
			Events.trigger("Kernel:Control:seek_to",pos);
		},
		
		pause:function(){
			Events.trigger("Kernel:Control:pause");
		},
		
		mute : function(val){
			Events.trigger("Kernel:Control:mute",val);
			//Kernel.mute(val);
		},
		
		set_volume : function(val){
			Events.trigger("Kernel:Control:set_volume",val);
		},
		
	};
	
	var Extend =  function ( source ) {
		var target = this;
		for (var p in source) {
			if (source.hasOwnProperty(p)) {
				target[p] = source[p];
		    }
		}	    
		return target;
	};
	
	View.extend = Extend;
	
	return View;
	
	
});