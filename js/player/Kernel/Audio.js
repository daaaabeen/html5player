console.log("load audio");
define(function (require, exports, module) {
	var Events = require("pkg!Event");
	var config = require("pkg!config");
	//console.log(config);
	var Audio = {
		//初始化
		init:function(){
			//_p是audio播放器的对象
			var audioId = config.config.audio.audioId;
			this._p = document.getElementById(audioId);
			
			this._p.addEventListener( 'loadeddata', function(){
				//console.debug("loadedata");
				this._audio_loading_status  = void 0;
				console.info("audio:loadeddata");
				Events.trigger("Kernel:Control:play");
			}.bind(this));

			this._p.addEventListener( 'timeupdate', function(e){ //时间改变
				Events.trigger("Kernel:Control:timechange",this.current_time());
			}.bind(this));

			this._p.addEventListener( 'volumechange', function(e){ //音量改变
				console.info("audio:volumechange");
			});

			this._p.addEventListener( 'ended', function(e){
				//thePlayer.removeClass( cssClass.playing );
				console.info("audio:ended");
				Events.trigger("Kernel:Control:stop");
			});
			
			this._p.addEventListener( 'waiting', function(e){
				//thePlayer.removeClass( cssClass.playing );
				console.info("audio:wait");
				Events.trigger("Kernel:Control:wait");
				
			});
			
			this._p.addEventListener( 'canplay', function(e){
				console.info("audio:canplay");
			});
			
			this._p.addEventListener( 'pause', function(e){ 
				console.info("audio:pause");
			});
			
			this._p.addEventListener( 'play', function(e){
				//thePlayer.removeClass( cssClass.playing );
				console.info("audio:play");
			});
			this._p.addEventListener( 'playing', function(e){
				//thePlayer.removeClass( cssClass.playing );
				console.info("audio:playing");
				
			});
			
			this._p.addEventListener( 'progress', function(e){ //加载过程
				//console.info(e);
			});
			
			this._p.addEventListener( 'error', function(e){ //出错时
				Events.trigger("Kernel:Control:error","连接失败");
				console.info("加载音频出错了");
				//console.info(arguments);
			});
			
		},
		reset:function(){
			console.group("Audio reset!!");
			console.groupEnd("Audio reset!!");
			//this._p.currentTime = 0;
		},
		
		//设置播放资源的源地址
		set_src : function(src){
			console.log("set_src:"+src);
			this._p.src = src;
			this._p.load();
			this._audio_loading_status = true;
		//	console.debug("set_src");
			var check_audio_timeout = function(){
			//	console.debug("set_src1");
				if(this._audio_loading_status){
					this._audio_loading_status = void 0;
					this._p.src = "";
					Events.trigger("Kernel:Control:error","连接超时");
				}
			}.bind(this);
			setTimeout(check_audio_timeout,config.config.audio.load_audio_timeout);
		},
		
		//播放
		play : function(){
			this._p.play();
		},
		
		//暂停
		pause : function(){
			this._p.pause();
		},
		
		
		can_play : function(){
			return this._p.readyState == 4 ? true : false;
		},
		
		//当前时间
		current_time : function(){
			return this._p.currentTime;
		},
		
		total_time : function(){
			console.log("声音时长："+this._p.duration);
			//alert(this._p.duration);
			return this._p.duration;
		},
		
		
		set_current_time : function(t){
			this._p.currentTime = t;
		},
		
		//静音
		mute : function(){
			this._p.muted = true;
		},
		unmute : function(){
			this._p.muted = false;
		},
		
		//声音
		volume : function(){
			return this._p.volume;
		},
		set_volume : function(val){
			this._p.volume = val;
		},
		
		//判断是否结束
		is_over : function(){
			return this._p.ended;
		}	
	};
	
	return Audio;
	
});