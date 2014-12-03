/**
 * 
 * Html5CanvasPlayer v2.0
 * Copyright (c) 2014 dianbin lee
 *
 */


( function( window, $, undefined ){
	var html5Player = {};
	html5Player.version = "2.0";
	
	
	var Events = html5Player.events = {
		on : function( name, callback, context ){
			this._events || ( this._events = [] );
			var events = this._events[name] || ( this._events[name] = [] );
			events.push({callback: callback, context: context, ctx: context || this});
			return this;
		},
		
		off : function(name, callback, context){
			if (!this._events ) return this;
			
			//如果参数为空则删除所有事件
			if (!name && !callback && !context) {
				this._events = void 0;
				return this;
			}
			
			//如果没有此name的事件，则返回
			var events = this._events[name];
			if(!events) return this;
			
			//如果只有name则删除此name的所有事件
			if(!callback && !context){
				delete this._events[name];
				return this;
			}
			
			 // Find any remaining events.
	        var remaining = [];
	        for (var j = 0, k = events.length; j < k; j++) {
	        	var event = events[j];
	        	
	        	
	        	//这的判断有问题
	        	if (  callback && callback !== event.callback   ||  context && context !== event.context  ) {
	        		remaining.push(event);
	        	}
	        	
	        }

	        // Replace events if there are any remaining.  Otherwise, clean up.
	        if (remaining.length) {
	          this._events[name] = remaining;
	        } else {
	          delete this._events[name];
	        }
			
	        return this;
			
		},
		
		//触发事件
		trigger: function(name) {
		    if (!this._events) return this;
		    console.info(arguments);
		    var args = Array.prototype.slice.call(arguments,1);
		    //if (!eventsApi(this, 'trigger', name, args)) return this;
		    var events = this._events[name];
		    //var allEvents = this._events.all;
		    if (events) triggerEvents(events, args);
		    //if (allEvents) triggerEvents(allEvents, arguments);
		    return this;
		}
			
	};
	
	//触发事件
	var triggerEvents = function(events, args) {
		var i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
	    
		switch (args.length) {
			case 0: 
				while (++i < l){
					var f = function(ev){
						return function(){ ev.callback.call(ev.ctx); };
					}(events[i]);
					setTimeout(f,0);
	      		} 	
				return;
				
			case 1: 
				while (++i < l){
					var f = function(ev,a1){
						return function(){ 
							ev.callback.call(ev.ctx, a1); 
						};
					}(events[i],a1);
					setTimeout(f,0);
				}  
				return;
			case 2: 
				while (++i < l){
					var f = function(ev,a1,a2){
						return function(){ 
							ev.callback.call(ev.ctx, a1, a2); 
						};
					}(events[i],a1,a2);
					setTimeout(f,0);
				} 
				return;
			case 3: 
				while (++i < l){
					var f = function(ev, a1, a2, a3){
						return function(){ 
							ev.callback.call(ev.ctx, a1, a2, a3); 
						};
					}(events[i],a1,a2,a3);
					setTimeout(f,0);
				} 
				return;
			default: 
				while (++i < l){
					var f = function(ev, args){
						return function(){ 
							ev.callback.apply(ev.ctx, args); 
						};
					}(events[i],args);
					setTimeout(f,0);
				}  
				return;
	    }
	};
	
	
	
	var View = html5Player.view = {
		init:function(){
			this.initialize();
		},
		initialize:function(){
			
		}
	
	};
	
	//资源 用于加载图片等资源
	var RS = html5Player.rs = {
		init:function(){
			this.initialize();
		},
		initialize:function(){
			
		}
	
	};
	
	
	//播放器的内核，用于解析html
	var Kernel = html5Player.kernel = {
		
	};
	
	
	
	//应用程序的入口 
	var run  = html5Player.init = function(){
		View.init();
		RS.init();
	};
	
	//继承方法
	var Extend =  function ( source ) {
		var target = this;
		for (var p in source) {
			if (source.hasOwnProperty(p)) {
				target[p] = source[p];
		    }
		}	    
		return target;
	};
	
	View.extend = RS.extend = Events.extend = Extend;
	
	window.player = html5Player;
   
} )( window, $);
//----------------------------------

player.view.extend({
	initialize:function(){
		alert("view--extend--init");
	}
});
player.rs.extend({
	initialize:function(){
		alert("RS--extend--init");
	}
});



player.init();


console.log("----test-----");
var fun = function(a){console.log(a+6);};

player.events.on("pause",function(a){console.log(a+1);});
player.events.on("aaa",function(a){console.log(a+2);});
player.events.on("start",function(a){for(var i=0;i<100000;i++);console.log(a+3);});
player.events.on("stop",function(a){console.log(a+4);});
player.events.on("over",function(a){console.log(a+5);});

player.events.on("aaa",fun,fun);

//player.events.trigger("pause",1);
//player.events.trigger("start",1);
//player.events.trigger("stop",111);
player.events.trigger("aaa",10);
player.events.off("aaa",fun,window);
console.log("-----");
player.events.trigger("aaa",10);
console.log("----test--end---");



//旧版代码
/*
function player(viewId,audioId){
	var p = this;
	this.version = "1.1";
	this.header=getData().header;
	this.data = getData().data;//播放数据
	this.view = document.getElementById(viewId);//屏幕
	this.audio = document.getElementById(audioId);//声音播放器
	
	
	
	
	
	this.RS ={
		it : 0,
		imgCount : 0 ,
		imgList : new Array,
		getImg : function(){
			if(p.RS.it < p.RS.imgCount){
				return p.RS.imgList[p.RS.it++];
			}
			return null;
		},
		putImg : function( imgObj ){
			p.RS.imgList[p.RS.imgCount++] = imgObj;
		},
		loadAudio : function(){
			p.audio.src = p.header.voice;
			p.audio.load();
			
		},
		audioCanPlay : function(){
			if( p.audio.canPlayType("audio/mpeg")=="" ){
				return true;
			}else{
				if(p.audio.readyState == 4){
					return true;
				}else{
					return false;
				}
			}
		}
	};
	
	
	// 播放器内置的两个数据集
	this.lineSize =[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];//线条宽度
	this.colors =[ "#FF0000", "#0000FF","#FFFF00","#00FF00","#000000","#ffffff"];
	this.bgcolor = "#ffffff";
	
	
	//运行时的一些状态
	this.flag = -1 ;// -1 刚加载完毕    0停止  1播放中 2播放完成  3缓冲中
	this.currentData = null;//当前要绘制的数据
	this.it = 0;//当前数据集的位置
	this.step = 0;//空白时间
	this.currentTime = 0;//当前播放到的时间点
	this.totalTime = 0;//视频的时长 
	this.speed = 1;
	this.runpos = 0;//运行到哪了(两种类型 idle表示空闲状态不绘图，drawpic表示当前处在绘图状态) 0：idle，1：drawpic
	this.changeVoice = false;//是否在修改声音
	//初始化播放器
	this.init = function(){
		
		$("#current-time").css("width","0%");
		p.flag = 0;//播放状态
		p.currentData = null;
		p.it = 0;
		p.step =  p.data[p.it].startTime*1000;//设置第一次空白时间
		p.currentTime = 0;//当前播放到的时间点
		p.totalTime = p.header.length * 1000;//视频的时长
		p.totalTimeS = Math.ceil( p.totalTime / 1000 );//视频时长以秒为单位
		p.h = Math.floor( p.totalTimeS / 3600 ) ; //视频的时间 -小时
		p.m = Math.floor( (p.totalTimeS % 3600) / 60 );//视频的时间 -分钟
		p.s = (p.totalTimeS % 60);//视频的时间 -秒数
		$("#total-time").html(p.h+":"+p.m+":"+p.s);
		p.initRS();
	};
	
	this.initRS = function(){
		
		$(p.data).each(function(i,item){
			if(item.type == "image"){
				var a = new Image();
				a.src = item.imgName;
				p.RS.putImg(a);
				p.RS.loadAudio();
				//$("#data-store-img").append("<img src=\""+item.imgName+"\"/>");
			}
		});
		
	};
	
	//初始化控制界面
	this.initView = function(){

		$("#play,#myCanvas").click(function(){
			if(p.flag == 2){
				//清空画布
				var cantxt = p.view.getContext("2d");
				cantxt.clearRect(0,0,$(p.view).width(),$(p.view).height());
				p.init();
				p.changeState("play");
			}else if( p.flag == 1 ){
				p.changeState("stop");
			}else if(p.flag == -1){
				p.init();
				p.changeState("play");
			}
			else{
				p.changeState("play");
			}
			
		});
		$(".bg-item").click(function(){
			p.bgcolor = $(this).attr("data");
			$(p.view).css("background",p.bgcolor);
		});
		
		$("#mute").click(function(){
			if( $(this).attr("data") == "on" ){
				$(this).attr("data","off");
				$(this).html("声音");
				p.audio.muted=true;
			}else{
				$(this).attr("data","on");
				$(this).html("静音");
				
				p.audio.muted=false ;
			}
		});
		$("#voice-bar").mousedown(function(e){
			p.changeVoice = true;
			//alert($("#voice-bar").position().left);
			
			var width = ( e.pageX ) - ( $("#voice-bar").position().left ) ;
			if( width< 0 ){
				width = 0; 
			}else if( width > $("#voice-bar").width() ){
				width = $("#voice-bar").width();
			}
			//alert(width);
			$("#current-voice").width( width );
			p.audio.volume= width / $("#voice-bar").width() ;
			//alert(e.pageX + ", " + e.pageY);
		
		});
		
		$(document).mouseup(function(){
			p.changeVoice = false;
			//alert("22");
		});
		$(document).mousemove(function(e){
			//alert(p.changeVoice);
			if(p.changeVoice == true){
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
				p.audio.volume= width / $("#voice-bar").width() ;
				
			}
			//$("span").text(e.pageX + ", " + e.pageY);
			
		});
	};
	
	
	this.run = function(){
		//alert(step);
		if( p.flag == 1 ){//如果是播放状态
			
				if( p.it < $(p.data).size() ){//如果现在还有等待播放的数据
					if( p.runpos == 0 && p.step <= 0){//判断是否进入下一个idle
						if( p.it > 0 ){//
							//alert(p.data[p.it-1].endTime);
							if( p.data[p.it-1].endTime ){
								p.step = ( p.data[p.it].startTime - p.data[p.it-1].endTime ) * 1000;
							}else{
								p.step = ( p.data[p.it].startTime - p.data[p.it-1].startTime ) * 1000;
							}
						}
					}
					
					
					var idle = setInterval(function(){
						if(p.flag ==1 ){
							if( p.RS.audioCanPlay() ){
								p.step -= 20;
								if( p.step <= 0 ){ //如果空闲时间走完
									clearInterval(idle);
									p.drawPic();
								}
							}else{
								clearInterval(idle);
								p.changeState("wait");
								p.run();
							}
							
						}else{
							clearInterval(idle);
							p.run();
						}
					},20 );	
					//end idle
					
				}else{
					//没有播放的数据了
					var idle = setInterval(function(){
						if(p.flag == 2 ){
							clearInterval(idle);
						}
					},20 );	
				}
			
		}else if( p.flag == 3 ){//缓冲
			
			var wait = setInterval(function(){
				if(p.flag == 3 ){
					if(p.RS.audioCanPlay()){//可以播放
						p.changeState("play");
						clearInterval(wait);
						p.run();
						
					}else{
						//继续下一圈
					}
					
				}else{
					clearInterval(wait);
					p.run();
				}
			},20 );	
			//end idle
		}else{
			
		}
		
		
	};
	
	this.changeState = function(state){
		if(state == "play"){
			if(p.flag == 3){
				p.flag = 1;
				p.timer();
				$("#msg").html("播放中！");
			}else{
				$("#play").attr("class","stop");
				$("#play").attr("title","暂停");
				p.flag = 1;
				p.timer();
				p.audio.play();//播放声音
				$("#msg").html("播放中！");
				p.run();
			}
			
			
		}else if(state == "over"){
			$("#play").attr("class","play");
			$("#play").attr("title","播放");
			p.flag = 2;
			$("#msg").html("停止！");
		
		}else if(state == "stop"){
			
			$("#play").attr("class","play");
			$("#play").attr("title","播放");
			p.flag = 0;
			p.audio.pause();//播放声音
			$("#msg").html("暂停！");
		
		}else if(state == "wait"){
			//p.audio.pause();//停止播放声音
			p.flag = 3;
			$("#msg").html("正在缓冲！");
		}else{
			
		}
	};
	
	this.timer = function(){
		var pt = setInterval(function(){
			if(p.flag == 1){
				if( Math.floor( p.currentTime/1000  ) >= Math.ceil( p.totalTime / 1000 ) ){
					//alert("完成");
					p.changeState("over");
					clearInterval(pt);
				}else{
					p.currentTime += 20;
					if( p.currentTime % 1000 == 0 ){
						var h = Math.floor( p.currentTime /1000 / 3600 ) ; //视频的时间 -小时
						var m = Math.floor( ( p.currentTime /1000 % 3600  ) / 60 );//视频的时间 -分钟
						var s = Math.floor( p.currentTime /1000  % 60 );//视频的时间 -秒数
						$("#s").html(s);							
						$("#m").html(m);
						$("#h").html(h);
					}
					var cct = p.currentTime / p.totalTime * 100;
					if(cct>100){
						cct=100;
					}
					
					$("#current-time").width(cct+"%");
				}
				
			}else{
				clearInterval(pt);
			}
			
		},20);
	};
	
	this.drawPic =  function(){
		
		p.runpos = 1;
		
		if(p.data[p.it].type=="stroke"){//画线
			//alert("stroke");
			p.painter.history.add();
			p.painter.stroke.render();
				
		}else if(p.data[p.it].type=="clear"){//清屏
			//alert("clear");
			p.painter.history.reset();
			p.painter.clear.render();
		}else if(p.data[p.it].type=="text"){//文字
			//alert("text");
			p.painter.history.add();
			p.painter.text.render();
		
		}else if(p.data[p.it].type=="undo"){//撤销上一步操作
			//alert("undo");
			p.painter.undo.render();
		}else if(p.data[p.it].type == "image"){
			//kong
			//alert("image");
			p.painter.history.add();
			p.painter.image.render();
			
		}else if(p.data[p.it].type=="eraser"){//擦除
			//alert("eraser");
			p.painter.history.add();
			p.painter.eraser.render();
		}else{
			p.it++;//将指针指向下一个动作集合
			p.runpos = 0;//切换到外层运行
			p.run();
		}
		
	};
	
	this.painter = {
		over : function(){//绘图完毕调用
			p.it++;//将指针指向下一个动作集合
			p.runpos = 0;//切换到外层运行
			p.run();
		},
		history : {//历史记录
			it : 0,
			count:0,
			list : new Array(5),
			add : function(){
				var cantxt = p.view.getContext("2d");
				p.painter.history.list[p.painter.history.it] = cantxt.getImageData( 0, 0, $(p.view).width(), $(p.view).height() );
				p.painter.history.it = ( p.painter.history.it+1 ) % 5 ;
				if(p.painter.history.count < 5){
					p.painter.history.count++;
				}
				//ctx.putImageData(imgData,10,70);
			},
			undo : function(){
				if( p.painter.history.count > 0 ){
					p.painter.history.count--;
					p.painter.history.it = ( ( p.painter.history.it + 5 ) - 1 ) % 5;
					var cantxt = p.view.getContext("2d");
					cantxt.clearRect(0,0,$(p.view).width(),$(p.view).height());
					cantxt.putImageData(p.painter.history.list[p.painter.history.it],0,0);
					delete p.painter.history.list[p.painter.history.it];
				}
				
			},
			reset : function(){
				p.painter.history.it=0;
				p.painter.history.count=0;
				delete p.painter.history.list;
				p.painter.history.list = new Array(5);
			}
			
		},
		
		
		
		stroke : {//画线
			index : 0,
			avgStep : function(){
				return  ( p.data[p.it].endTime - p.data[p.it].startTime )*1000 / $(p.data[p.it].line).length;
			},
			render : function(){
				
				if( p.data[p.it].line !=null ){
					var t = p.painter.stroke.avgStep();
					//alert(t);
					var draw = setInterval(function(){
						//alert(p.painter.index);
						
						if(p.flag == 1 ){
							if( !p.RS.audioCanPlay() ){
								p.changeState("wait");
								clearInterval(draw);
								p.run();
							}else{
								if(p.painter.stroke.index ==0 ){
									//alert("画一个点："+ data[it].line[index][0]+","+ data[it].line[index][1]);
								}
								else{
									var cantxt = p.view.getContext("2d");
									cantxt.lineWidth =  p.lineSize[ p.data[p.it].size ] ;
									cantxt.strokeStyle = p.colors[p.data[p.it].color];//颜色
									cantxt.beginPath(); 
									cantxt.moveTo(p.data[p.it].line[p.painter.stroke.index-1][0],p.data[p.it].line[p.painter.stroke.index-1][1]); // 移动到坐标 50 50 
									cantxt.lineTo(p.data[p.it].line[p.painter.stroke.index][0],p.data[p.it].line[p.painter.stroke.index][1]); // 划出轨迹到 150 150
									//;//宽度
									cantxt.stroke(); // 以线条显示轨迹
									cantxt.closePath();
									
								}
								p.painter.stroke.index++;
								if( p.painter.stroke.index >= $(p.data[p.it].line).length ){
									//停止绘图
									p.painter.stroke.index =0;
									clearInterval(draw);
									p.painter.over();
									
								}
							}
							
						}else{	
							clearInterval(draw);
							p.run();
						}
					},t);
				}else{
					p.painter.over();
				}
				//end draw
			},
			reset : function(){
				p.painter.stroke.index = 0;
			}
		},
		
		
		clear : {//清理屏幕
			render : function(){
				var cantxt = p.view.getContext("2d");
				cantxt.clearRect(0,0,$(p.view).width(),$(p.view).height());
				p.painter.over();
			}
		},
		
		text : {//插入文字
			render : function(){
				var cantxt = p.view.getContext("2d");
				var txt = p.data[p.it].text; 
				cantxt.font=""+p.data[p.it].size+"px Arial";
				cantxt.fillText(txt, p.data[p.it].x, p.data[p.it].y , p.data[p.it].w ); 
				
				p.painter.over();
			}
		},
		
		undo : {//撤销
			render : function(){
				
				p.painter.history.undo();
				
				p.painter.over();
				
			}
		},
		
		image : {//插入图片
			render : function(){
				
				var img = p.RS.getImg();
				//img.onload(fu)
				var cantxt = p.view.getContext("2d");
				cantxt.drawImage( img, p.data[p.it].x, p.data[p.it].y, p.data[p.it].w, p.data[p.it].h );
				
				p.painter.over();
				
				
			}
		},
		eraser : {
			index : 0,
			avgStep : function(){
				return  ( p.data[p.it].endTime - p.data[p.it].startTime )*1000 / $(p.data[p.it].line).length;
			},
			
			render : function(){
			
				if( p.data[p.it].line !=null ){
					var draw = setInterval(function(){
						
						if(p.flag == 1 ){
							if(!p.RS.audioCanPlay()){
								p.changeState("wait");
								clearInterval(draw);
								p.run();
							}else{
								var cantxt = p.view.getContext("2d");
								cantxt.clearRect( p.data[p.it].line[p.painter.eraser.index][0]-(p.lineSize[ p.data[p.it].size ] /2), 
												p.data[p.it].line[p.painter.eraser.index][1]-+(p.lineSize[ p.data[p.it].size ] /2),
												p.data[p.it].line[p.painter.eraser.index][0]+(p.lineSize[ p.data[p.it].size ] /2),
												p.data[p.it].line[p.painter.eraser.index][1]+(p.lineSize[ p.data[p.it].size ]/2)
											);
							
								p.painter.eraser.index++;
								if( p.painter.eraser.index == $(p.data[p.it].line).length ){
									//停止绘图
									clearInterval(draw);
									p.painter.eraser.index = 0;
									p.painter.over();
									
								}
							}
							
						}else{		
							clearInterval(draw);
							p.run();
						}
					}, p.painter.eraser.avgStep() );
				}else{
					p.painter.over();
				}
				//end draw
				
			},//end render
			
			reset : function(){
				p.painter.eraser.index = 0;
			}
			
		}//end eraser
		
	};//end painter
	
	p.initView();
};
*/