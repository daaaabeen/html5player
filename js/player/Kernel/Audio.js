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
				
			});

			this._p.addEventListener( 'timeupdate', function(){ //时间改变
				Events.trigger("Kernel:Control:timechange",this.current_time());
			}.bind(this));

			this._p.addEventListener( 'volumechange', function(){ //音量改变
				
			});

			this._p.addEventListener( 'ended', function(){
				//thePlayer.removeClass( cssClass.playing );
			});
			
			
		},
		reset:function(){
			this._p.currentTime = 0;
		},
		
		//设置播放资源的源地址
		set_src : function(src){
			console.log("set_src:"+src);
			this._p.src = src;
			this._p.load();
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