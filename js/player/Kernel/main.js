define(function (require, exports, module) {
	
	//var player = require("pkg!core");
	//console.log(palyer);
	//console.log(palyer.a);
	
	var Events = require("pkg!Event");
	var Rs = require("./Rs");
	var Board = require("./Board");
	var Audio = require("./Audio");
	
	var Kernel = {
		Events: Events,
		init : function( canvas_obj, audio_obj ){
			Audio.init(audio_obj);
			Board.init(canvas_obj);
			this.Events.on("Kernel:Control:start", Kernel.control.start, Kernel.control);
			this.Events.on("Kernel:Control:play", Kernel.control.play, Kernel.control);
			this.Events.on("Kernel:Control:stop", Kernel.control.stop, Kernel.control);
			this.Events.on("Kernel:Control:wait", Kernel.control.wait, Kernel.control);
			this.Events.on("Kernel:Control:pause", Kernel.control.pause, Kernel.control);
			this.Events.on("Kernel:Control:mute", Kernel.control.mute, Kernel.control);
			this.Events.on("Kernel:Control:set_volume", Kernel.control.set_volume, Kernel.control);
			this.Events.on("Kernel:Control:seek_to", Kernel.control.seek_to, Kernel.control);
		},
		
		status:function(){
			return this.control.status();
		},
		
		//当前播放的事件
		current_time : function(){
			return Audio.current_time();
		},
		
		total_time : function(){
			return Audio.total_time();
		},
		
		mute : function(val){
			if(val === true){
				Audio.mute();
			}else{
				Audio.unmute();
			}
		},
		
		
		set_volume : function(val){
			Audio.set_volume(val);
		},
		
		volume : function(){
			return Audio.volume();
		},
		
		
		//日志对象
		logger : {
			write:function(msg){
				console.log(msg);
			}
		},
		
		//对外提供的控制接口
		control : {
			
			//状态码
			_code:{ init:0, play:1, pause:2, wait:3, stop:4 },
			
			status : function(){
				switch(this._status){
				
				case this._code.init:
					return "init";
				case this._code.play:
					return "play";
				case this._code.pause:
					return "pause";
				case this._code.wait:
					return "wait";
				case this._code.stop:
					return "stop";
				default:
					return "nostatus";
					
				}
			},
			
			//更改播放器的状态
			change_status:function(status){
				if(this._status != this._code.wait ) this._last_status = this._status;
				this._status = status;
			},
			
			//开始播放
			start:function(url,success){
				this.change_status(this._code.init);
				Board.reset();
				Audio.reset();
				Rs.reset();
				Rs.init(url,Audio.set_src.bind(Audio),Board.set_trail.bind(Board),Audio.can_play.bind(Audio) );
				typeof success == "function" && success();
			
			},
			
			//停止
			stop:function(success){
				this.change_status(this._code.stop);
			},
			
			//播放
			play:function(success){
				this.change_status(this._code.play);
				console.log("调用：Kernel.Control.play");
				Audio.play();
				var k_c_p_run = setInterval(function(){
					//判断是否可以播放
					if( Audio.is_over() ){
						clearInterval( k_c_p_run );
						console.log("clear:k_c_p_run");
						Events.trigger("Kernel:Control:stop");
						
					}else if( !Audio.can_play() || !Board.can_play() ){//不能正常播放需要缓冲
						clearInterval( k_c_p_run );
						console.log("clear:k_c_p_run");
						Events.trigger("Kernel:Control:wait");
						
					}else if(this._code.pause == this._status ){//暂停了
						
						clearInterval( k_c_p_run );
						console.log("clear:k_c_p_run");
						
					}else{//可以正常播放
						
						var c_t = Audio.current_time();//当前播放到的事件
						var now_t = Math.ceil(c_t);
						if(this._last_time !== undefined){
							if( this._last_time != now_t ){
								if( now_t<this._last_time ){
									//清空画布
									Board.reset();
								}
								this._last_time = now_t;
								Events.trigger("Kernel:Control:timechange",now_t);
							}
							
						}else{
							this._last_time = now_t;
							Events.trigger("Kernel:Control:timechange",now_t);
						}
						Board.draw(c_t);
						
					}
					
				}.bind(this),100);
				
				
			},
			
			//暂停
			pause:function(success){
				Audio.pause();
				this.change_status(this._code.pause);
			},
			
			//缓冲
			wait:function(success){
				Audio.pause();
				this.change_status(this._code.wait);
				var k_c_w_run = setInterval(function(){
					if( this._last_status == this._code.play ){
						if( Audio.can_play() && Board.can_play() ){//能正常播放需要缓冲
							clearInterval(k_c_w_run);
							console.log("clear:k_c_w_run");
							Events.trigger("Kernel:Control:play");
							
						}
					}else{
						clearInterval(k_c_p_run);
						console.log("clear:k_c_p_run");
					}
					
				}.bind(this),50);
			},
			
			mute : function(val){
				if(val === true){
					Audio.mute();
				}else{
					Audio.unmute();
				}
				Events.trigger("Kernel:Control:mute_change",val);
			},
			
			
			set_volume : function(val){
				Audio.set_volume(val);
				Events.trigger("Kernel:Control:volume_change",val);
			},
			
			//设置播放进度
			seek_to:function(val, success){
				Audio.set_current_time(val);
				Events.trigger("Kernel:Control:seek_end",val);
			}
				
		}
		//control
	
	};
	return Kernel;
});