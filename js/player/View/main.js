define(function (require, exports, module) {
	//var Events = require("pkg!Event");
	var View = require("./View");
	var $ = require("jquery");
    
	
	var v =  View.extend({
		initialize:function(){
			
			$("#play").click(function(){
				var s = this.status();
				if( s == "play" || s == "wait"){
					this.pause();
					
				}else{
					var url = "http://localhost/html5player/trail1411451320";
					this.play(url);
				}
				
			}.bind(this));
			/*
			$("#mute").click(function(){
				var o = $("#mute");
				if( o.attr("data") == "on" ){
					o.attr("data","off");
					o.html("声音");
					this.mute(true);
				}else{
					o.attr("data","on");
					o.html("静音");
					
					this.mute(false) ;
				}
			}.bind(this));
			
			$("#voice-bar").mousedown(function(e){
				this._changeVoice = true;
				//alert($("#voice-bar").position().left);
				
				var width = ( e.pageX ) - ( $("#voice-bar").position().left ) ;
				if( width< 0 ){
					width = 0; 
				}else if( width > $("#voice-bar").width() ){
					width = $("#voice-bar").width();
				}
				//alert(width);
				$("#current-voice").width( width );
				this.set_volume(width / $("#voice-bar").width());
				//alert(e.pageX + ", " + e.pageY);
			
			}.bind(this));
			*/
			$("#timeline").mousedown(function(e){
				this._changeProcess = true;
				console.log("#timeline mousedown");
				$("#show-time").show();
				
				var w =( ( e.pageX ) - ( $("#timeline").offset().left ) ) / ( $("#timeline").width() );
				console.log(w);
				if( w < 0 ) w = 0;
				if(w>1) w = 1;
				$("#current-time").width(w*100+"%");
				var c_t = Math.ceil( w * this.total_time() );
				console.log("moucemove time:"+c_t);
				
				
				var l = 0;
				var r = $("#timeline").width() - $("#show-time").width();
				var s_t_p = e.pageX - $("#timeline").offset().left < l ? l : e.pageX - $("#timeline").offset().left > r ? r : e.pageX - $("#timeline").offset().left - ( $("#show-time").width() / 2 ) ;
				
				
				$("#show-time").stop().css("left",s_t_p);
				var h = Math.floor( c_t / 3600 ) ; //视频的时间 -小时
				var m = Math.floor( ( c_t % 3600  ) / 60 );//视频的时间 -分钟
				var s = c_t % 60 ;//视频的时间 -秒数
				$("#show-time").html(h+":"+m+":"+s);
				
			}.bind(this));
			
		
			$(document).mouseup(function(e){
				e || ( e = window.Event );
				this._changeVoice && (this._changeVoice = void 0);
				//alert("22");
				if(this._changeProcess){
					$("#show-time").hide();
					var w = ( ( e.pageX ) - ( $("#timeline").offset().left ) ) / $("#timeline").width();
					$("#current-time").width(w*100+"%");
					var c_t = Math.ceil( w * this.total_time() );
					console.log("mouseup seek_to:"+c_t);
					this.seek_to(c_t);
					this._changeProcess = void 0;
				}
			}.bind(this));
			
			$(document).mousemove(function(e){
				//alert(p.changeVoice);
				if(this._changeVoice === true){
					//alert(33);
					//$("span").text(e.pageX + ", " + e.pageY);
					var width = ( e.pageX ) - ( $("#voice-bar").position().left ) ;
					if( width< 0 ){
						width = 0; 
					}else if( width > $("#voice-bar").width() ){
						width = $("#voice-bar").width();
					}
					//alert(width);
					$("#current-voice").width( width );
					this.set_volume( width / $("#voice-bar").width() ) ;
					
				}
				
				if(this._changeProcess === true ){
					var w =( ( e.pageX ) - ( $("#timeline").offset().left ) ) / ( $("#timeline").width() );
					console.log(w);
					if( w < 0 ) w = 0;
					if(w>1) w = 1;
					$("#current-time").stop().width(w*100+"%");
					var c_t = Math.ceil( w * this.total_time() );
					console.log("moucemove time:"+c_t);
					
					var l = 0;
					var r = $("#timeline").width() - $("#show-time").width();
					var s_t_p = e.pageX - $("#timeline").offset().left < l ? l : e.pageX - $("#timeline").offset().left > r ? r : e.pageX - $("#timeline").offset().left - ( $("#show-time").width() / 2 ) ;
					$("#show-time").css("left",s_t_p);
					var h = Math.floor( c_t / 3600 ) ; //视频的时间 -小时
					var m = Math.floor( ( c_t % 3600  ) / 60 );//视频的时间 -分钟
					var s = c_t % 60 ;//视频的时间 -秒数
					$("#show-time").html(h+":"+m+":"+s);
					$("#show-time").show();
					
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
			if(this._changeProcess)return ;
			console.log("on_time_change");
			console.log("new_time:"+now_time);
			var h = Math.floor( now_time / 3600 ) ; //视频的时间 -小时
			var m = Math.floor( ( now_time % 3600  ) / 60 );//视频的时间 -分钟
			var s = now_time % 60 ;//视频的时间 -秒数
			$("#s").html(s);							
			$("#m").html(m);
			$("#h").html(h);
		
			var cct = now_time / this.total_time() * 100;
			if(cct>100){
				cct = 100;
			}
			$("#current-time").animate({ width : cct+"%" },980);
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