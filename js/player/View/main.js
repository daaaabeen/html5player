define(function (require, exports, module) {
	//var Events = require("pkg!Event");
	var View = require("./View");
	var $ = require("jquery");
    
	
	var v =  View.extend({
		initialize:function(){
			var isTouch		  = 'ontouchstart' in window,
				eStart		  = isTouch ? 'touchstart'	: 'mousedown',
				eMove		  = isTouch ? 'touchmove'	: 'mousemove',
				eEnd		  = isTouch ? 'touchend'	: 'mouseup',
				eCancel		  = isTouch ? 'touchcancel'	: 'mouseup',
				secondsToTime = function( secs )
				{
					var hours = Math.floor( secs / 3600 ), minutes = Math.floor( secs % 3600 / 60 ), seconds = Math.ceil( secs % 3600 % 60 );
					return ( hours == 0 ? '' : hours > 0 && hours.toString().length < 2 ? '0'+hours+':' : hours+':' ) + ( minutes.toString().length < 2 ? '0'+minutes : minutes ) + ':' + ( seconds.toString().length < 2 ? '0'+seconds : seconds );
				};
			
			$("#play").click(function(){
				var s = this.status();
				if( s == "play" || s == "wait"){
					this.pause();
					
				}else{
					var url = "http://localhost/html5player/trail1411451320";
					this.play(url);
				}
				
			}.bind(this));

			var _seek_to =  function(e){
				var theRealEvent = isTouch ? e.originalEvent.touches[ 0 ] : e;
				var w =( ( theRealEvent.pageX ) - ( $("#timeline").offset().left ) ) / ( $("#timeline").width() );
				console.log(w);
				if( w < 0 ) w = 0;
				if(w>1) w = 1;
				//$("#current-time").width(w*100+"%");
				
				
				var c_t = Math.ceil( w * this.total_time() );
				console.log("moucemove time:"+c_t);
				
				
				var l = 0;
				var r = $("#timeline").width() - $("#show-time").width();
				var s_t_p = theRealEvent.pageX - $("#timeline").offset().left < l ? l : theRealEvent.pageX - $("#timeline").offset().left > r ? r : theRealEvent.pageX - $("#timeline").offset().left - ( $("#show-time").width() / 2 ) ;
				$("#show-time").stop().css("left",s_t_p);
				
				var h = Math.floor( c_t / 3600 ) ; //视频的时间 -小时
				var m = Math.floor( ( c_t % 3600  ) / 60 );//视频的时间 -分钟
				var s = Math.ceil(c_t % 60) ;//视频的时间 -秒数
				
				$("#show-time").html(h+":"+m+":"+s);
				
				
				this.seek_to(c_t);
			}.bind(this);
			
			
			$("#timeline").on( eStart,function(e){
				e.preventDefault();
				this._changeProcess = true;
				$("#show-time").show();
				_seek_to(e);
				
			}.bind(this));
			
		
			$(document).on( eCancel, function(e){
				//alert("22");
				e.preventDefault();
				if(this._changeProcess){
					_seek_to(e);
					$("#show-time").hide();
					this._changeProcess = void 0;
				}
			}.bind(this));
			
			
			$(document).on( eMove, function(e){
				e.preventDefault();
				if(this._changeProcess === true ){
					_seek_to(e);	
				}
				//$("span").text(e.pageX + ", " + e.pageY);
				
			}.bind(this));
			

			console.log("view--extend--init");
		},
		
		//在播放之前，当正在加载文件的时候
		on_start:function(){
			console.log("on_start");
			$("#current-time").css("width","0");
			$("#msg").html("正在加载！");
		},
		
		//当开始播放的时候
		on_play:function(){
			console.log("on_play");
			$("#play").attr("class","stop");
			$("#play").attr("title","暂停");
			$("#msg").html("播放中！");
		},
		
		//当播放结束的时候
		on_stop:function(){
			console.log("on_stop");
			$("#play").attr("class","play");
			$("#play").attr("title","播放");
			$("#msg").html("停止！");
		},
		
		//当出现缓冲的时候
		on_wait:function(){
			console.log("on_wait");
			$("#msg").html("正在缓冲！");
		},
		
		//当暂停的时候
		on_pause:function(){
			console.log("on_pause");
			$("#play").attr("class","play");
			$("#play").attr("title","播放");
			$("#msg").html("暂停！");
		},
		
		//当资源加载完毕
		on_rs_inited:function(){
			console.log("on_rs_inited");
			
			var len = Math.ceil( this.total_time() );
			var h = Math.floor( len / 3600 ) ; //视频的时间 -小时
			var m = Math.floor( (len % 3600) / 60 );//视频的时间 -分钟
			var s = (len % 60);//视频的时间 -秒数
			
			console.log("视频长度："+len+"->"+h+":"+m+":"+s );
			$("#total-time").html(h+":"+m+":"+s);
		},
		
		//当时间改变的时候
		on_time_change:function(now_time){
			//if(this._changeProcess)return ;
			console.log("on_time_change");
			console.log("new_time:"+now_time);
			var h = Math.floor( now_time / 3600 ) ; //视频的时间 -小时
			var m = Math.floor( ( now_time % 3600  ) / 60 );//视频的时间 -分钟
			var s = Math.ceil( now_time % 60 ) ;//视频的时间 -秒数
			$("#s").html(s);							
			$("#m").html(m);
			$("#h").html(h);
		
			var cct = now_time / this.total_time() * 100;
			if(cct>100){
				cct = 100;
			}
			$("#current-time").css({ width : cct+"%" });
		},
		
		/*
		on_mute_change:function(val){
			console.log("on_mute_change");
			console.log("new_status:"+val);
		},
		
		on_volume_change:function(val){
			console.log("on_volume_change");
			console.log("new_volume:"+val);
		},
		*/
	});
	
	return v;
});