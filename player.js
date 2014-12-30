/**
 * 
 * Html5CanvasPlayer v2.0
 * Copyright (c) 2014 dianbin lee
 *
 */


( function( window, $, undefined ){
	var html5Player = {};
	html5Player.version = "2.0";
	
	//使用这个对像实现消息绑定与触发
	var Events = html5Player.events = {
			
		/**
		 * 绑定某个方法到某个消息上
		 * name：消息名称  callback：回调函数  context：执行上下文，也就是调用此回调函数的对象
		 */
		on : function( name, callback, context ){
			this._events || ( this._events = [] );
			var events = this._events[name] || ( this._events[name] = [] );
			events.push({callback: callback, context: context, ctx: context || this});
			return this;
		},
		
		
		/**
		 * 删除某个绑定的事件，如果函数都为空则全部删除 ，如果只有name则指删除此name的事件
		 * @param name 消息名
		 * @param callback 回调函数
		 * @param context 上下文
		 * 
		 */
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
			
			// 查找剩余的事件
	        var remaining = [];
	        for (var j = 0, k = events.length; j < k; j++) {
	        	var event = events[j];
	        	
	        	//将事件不一样的保存下来
	        	if (  callback && callback !== event.callback   ||  context && context !== event.context  ) {
	        		remaining.push(event);
	        	}
	        	
	        }

	        // 将剩余的事件替换到_events列表中，若没有剩余则 全部清除
	        if (remaining.length) {
	          this._events[name] = remaining;
	        } else {
	          delete this._events[name];
	        }
			
	        return this;
			
		},
		
		/**
		 * 触发一个事件,异步的
		 * @param name
		 * @returns {___anonymous235_2220}
		 */
		trigger: function(name) {
			console.log("trigger->"+name);
			console.log(this._events);
		    if (!this._events) return this;
		    console.info(arguments);
		    var args = Array.prototype.slice.call(arguments,1);
		    var events = this._events[name];
		    if (events) triggerEvents(events, args);
		    return this;
		}
			
	};
	
	//异步的触发事件
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
			this._total_time && ( this._total_time = void 0 );
			this.initialize();
			//Events.on("Kernel:RS:inited",this.play);
			Events.on("Kernel:Control:start", View.on_start, View);
			Events.on("Kernel:Control:play", View.on_play, View);
			Events.on("Kernel:Control:stop", View.on_stop, View);
			Events.on("Kernel:Control:wait", View.on_wait, View);
			Events.on("Kernel:Control:pause", View.on_pause, View);
			Events.on("Kernel:rs:inited",View.on_rs_inited,View);
			Events.on("Kernel:Control:timechange",View.on_time_change,View);
			Events.on("Kernel:Control:mute_change",View.on_mute_change,View);
			Events.on("Kernel:Control:volume_change",View.on_volume_change,View);
			
		},
		
		initialize:function(){},
		on_start:function(){},
		on_play:function(){},
		on_stop:function(){},
		on_wait:function(){},
		on_pause:function(){},
		on_rs_inited:function(){},
		on_time_change:function(){},
		on_mute_change:function(){},
		on_volume_change:function(){},
		
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
			
			var fun = function(){
				this.play();
			}.bind(this);
			
			Events.trigger("Kernel:Control:start",url,fun);
		},
		
		play:function(url){
			
			if( Kernel.status() == "nostatus"){
				this.start(url);
			}else{
				Events.trigger("Kernel:Control:play");
			}
			
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
	
	
	
	
	//播放器的内核，用于解析html
	var Kernel = html5Player.kernel = {
		
		
		init : function( canvas_obj, audio_obj ){
			this.audio.init(audio_obj);
			this.board.init(canvas_obj);
			Events.on("Kernel:Control:start", Kernel.control.start, Kernel.control);
			Events.on("Kernel:Control:play", Kernel.control.play, Kernel.control);
			Events.on("Kernel:Control:stop", Kernel.control.stop, Kernel.control);
			Events.on("Kernel:Control:wait", Kernel.control.wait, Kernel.control);
			Events.on("Kernel:Control:pause", Kernel.control.pause, Kernel.control);
			Events.on("Kernel:Control:mute", Kernel.control.mute, Kernel.control);
			Events.on("Kernel:Control:set_volume", Kernel.control.set_volume, Kernel.control);
			
		},
		
		status:function(){
			return this.control.status();
		},
		
		//当前播放的事件
		current_time : function(){
			return this.audio.current_time();
		},
		
		total_time : function(){
			return this.audio.total_time();
		},
		
		mute : function(val){
			if(val === true){
				this.audio.mute();
			}else{
				this.audio.unmute();
			}
		},
		
		
		set_volume : function(val){
			this.audio.set_volume(val);
		},
		
		volume : function(){
			return this.audio.volume();
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
				Kernel.rs.init(url);
				if( success !== undefined ) success();
			
			},
			
			//停止
			stop:function(success){
				this.change_status(this._code.stop);
			},
			
			//播放
			play:function(success){
				this.change_status(this._code.play);
				console.log("调用：Kernel.Control.play");
				Kernel.audio.play();
				var k_c_p_run = setInterval(function(){
					//判断是否可以播放
					if( Kernel.audio.is_over() ){
						clearInterval( k_c_p_run );
						console.log("clear:k_c_p_run");
						Events.trigger("Kernel:Control:stop");
						
					}else if( !Kernel.audio.can_play() || !Kernel.board.can_play() ){//不能正常播放需要缓冲
						clearInterval( k_c_p_run );
						console.log("clear:k_c_p_run");
						Events.trigger("Kernel:Control:wait");
						
					}else if(this._code.pause == this._status ){//暂停了
						
						clearInterval( k_c_p_run );
						console.log("clear:k_c_p_run");
						
					}else{//可以正常播放
						
						var c_t = Kernel.audio.current_time();//当前播放到的事件
						var now_t = Math.floor(c_t);
						if(this._last_time !== undefined){
							if( this._last_time != now_t ){
								this._last_time = now_t;
								Events.trigger("Kernel:Control:timechange",now_t);
							}
							
						}else{
							this._last_time = now_t;
							Events.trigger("Kernel:Control:timechange",now_t);
						}
						Kernel.board.draw(c_t);
						
					}
					
				}.bind(this),100);
				
				
			},
			
			//暂停
			pause:function(success){
				Kernel.audio.pause();
				this.change_status(this._code.pause);
			},
			
			//缓冲
			wait:function(success){
				Kernel.audio.pause();
				this.change_status(this._code.wait);
				var k_c_w_run = setInterval(function(){
					if( this._last_status == this._code.play ){
						if( Kernel.audio.can_play() && Kernel.board.can_play() ){//能正常播放需要缓冲
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
					Kernel.audio.mute();
				}else{
					Kernel.audio.unmute();
				}
				Events.trigger("Kernel:Control:mute_change",val);
			},
			
			
			set_volume : function(val){
				Kernel.audio.set_volume(val);
				Events.trigger("Kernel:Control:volume_change",val);
			},
			
			//设置播放进度
			set_process:function(val, success){
				
			}
				
		},
		//control
		
		
		//资源 用于加载图片等资源
		rs : {
			
			get img(){
				this._img || ( this._img=[] );
				return this._img; 
			},
			get file_or_ppt(){ 
				this._file_or_ppt || ( this._file_or_ppt = [] ); 
				return this._file_or_ppt; 
			},
			init:function(url){
				
				if(this._hasinited)return ;
				console.log("src=\""+url+"/audio.mp3\"");
				Kernel.audio.set_src( url+"/audio.mp3" );
				
				$.ajax({
					url:url+"/trail.json",
					dataType:"json",
					async : false,
					success:function(data){
						console.log(data);
						Kernel.board.set_trail( data );
						//图片预加载-----------------------------------------
						var k_rs_preload = function(record){
							var len = record.length;
							var i = 0;
							var imgobj = null;
							while( i < len ){
								
								if( record[i].class == "DRFileRecord"){//如果是图片 ppt file 类资源
									if(record[i].fileType == 1){//如果是图片
										imgobj = new Image();
										//imgobj.src = record[i].relativeSourcePath + "/" + record[i].pageIndex + ".png";
										imgobj.src = url +"/"+ record[i].relativeSourcePath;
										imgobj.fileId = record[i].fileId;
										Kernel.rs.img.push(imgobj);
									
									}else{//如果是 ppt 或 文件 type == ppt or file
										
										imgobj = new Image();
										//imgobj.src = record[i].relativeSourcePath + "/" + record[i].pageIndex + ".png";
										imgobj.src = url +"/"+ record[i].relativeSourcePath;
										imgobj.fileId = record[i].fileId;
										imgobj.pageIndex = record[i].pageIndex;
										Kernel.rs.file_or_ppt.push(imgobj);
										
									}
									
								}
								i++;
							}
							
						}(data.records);
						setTimeout(k_rs_preload,0);
						//图片预加载----------------------------------------
					}
				});
				
				
				
				var k_rs_inited = setInterval(function(){
					if(Kernel.audio.can_play()){
						this._hasinited = true;
						Events.trigger("Kernel:rs:inited");
						clearInterval(k_rs_inited);
					}
					
				}.bind(this),50);
				
			},
			
			reset:function(){
				this._hasinited = void 0;
				this._img = [];
			}
			
		},
		//rs
		
		//声音
		audio:{
			//初始化
			init:function(audio_obj){
				//_p是audio播放器的对象
				this._p = audio_obj;
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
			
			
			
		},
		//audio
		
		
		//白板
		board:{
			
			init:function(canvas_obj){
				this._p = canvas_obj;
				
			},
			
			//判断能否播放
			can_play : function(){
				
				if( this._block_elem ){//检测阻止播放的条件是否已经不存在
					if( this._block_elem.complete ){
						this._block_elem = void 0;
						return true;
					}else{
						return false;
					}
					
				} 
				return true;
			},
			
			//获取画板
			canvas:function(){
				return this._p;
			},
			
			//设置轨迹
			set_trail : function(data){
				this._trail = data;
				this._records = this._trail.records;
				this._index = 0;
				this._len = this._records.length;
				console.log("-------trail info---------");
				console.log("records count:"+this._len);
				console.log("now index:"+this._index);
				console.log("-------trail info end---------");
			},
			//播放到这个时间点
			draw : function( t ){
				
				
				var win = function(){
					console.log("render success!");
					this._index++;
					console.log(this._index);
				}.bind(this);
				
				var fail = function(){
					console.log("render fail!");
					console.log(this._index);	
				}.bind(this);
				
				var trail_class = null;
				
				while( this.can_play() && this._index < this._len && this._records[this._index].timestamp < t  ){
					//class: DRContextRecord / DRStrokeRecord
					
					trail_class = this._records[this._index].class;
					if( trail_class == "DRContextRecord" || trail_class == "DRStrokeRecord" || trail_class == "DRClearCanvasRecord" ){
						
						console.log("class:" + trail_class);
						this.painter.read_and_parse( this._records[this._index] , win  );
						
					}else if(trail_class == "DRFileRecord" ){//插入图片，ppt，文件等
						
						console.log("class:" + trail_class);
						this.painter.read_and_parse( this._records[this._index] , win , fail  );
						
					}else{
						this._index++;
					}
					
				}
			},
			
			painter:{
				
				reset:function(){
					this._painter_color = void 0;
					this._painter_line_width = void 0;
					this._painter_mode = void 0;
				},
				
				
				read_and_parse:function( obj , win ,fail ){
					if( obj.class == "DRContextRecord" ){
						var type = obj.type;
						if(type == 1){//设置画笔颜色
							
							this.set_painter_color(obj.data);
							( typeof win === "function" ) && win();
						}else if( type == 2 ){//设置画笔粗细
							this.set_painter_line_width(obj.data);
							( typeof win === "function" ) && win();
						
						}else if( type == 3 ){//设置混合模式（正常或者擦除）
							this.set_painter_mode(obj.data);
							( typeof win === "function" ) && win();
						
						}else if( type == 4 ){//插入一个新的页面 
							this.tool_page.insert_page( obj , win );
							
						}else if( type == 5 ){//幻灯片翻到下一页
							this.tool_file.turn_page( obj, win, fail );
						}
						
					}else if( obj.class == "DRStrokeRecord" ){
						if( this.painter_mode() == "erase" ){
							this.tool_erase.render(obj);
						}else if( this.painter_mode() == "pencil" ){
							this.tool_pencil.render(obj);
						}else {
							console.log("未定义的工具！");
							console.log(obj);
						}
						win();
					}else if( obj.class == "DRClearCanvasRecord" ){
						this.tool_clear.render();
						win();
					}else if( obj.class == "DRFileRecord" ){
						this.tool_file.render(obj,win,fail);
					}
					
					
					
				},
				
				//设置画笔的颜色
				set_painter_color:function( data , win ){
					var decimal = Math.floor( Number(data.r) * 255 ) * 65536 + Math.floor(Number(data.g) * 255 ) * 256 + Math.floor(Number(data.b) * 255 );
					if(isNaN(decimal))decimal = 0;
					var num = decimal.toString(16);
					while (num.length < 6) num = "0" + num;
					this._painter_color = "#" + num;
					console.log("设置画笔颜色："+this._painter_color);
					( typeof win === "function" ) && win();
				},
				//获取画笔颜色
				painter_color : function(){
					return this._painter_color ? this._painter_color : "#000000";
				},
				
				//设置画笔的粗细
				set_painter_line_width:function(data){
					this._painter_line_width = data;
					console.log("设置画笔粗细："+this._painter_line_width);
				},
				painter_line_width:function(){
					return this._painter_line_width ? this._painter_line_width : "1";
				},
				
				//设置当前的混合模式  铅笔还是橡皮
				set_painter_mode:function(data){
					if(data == 16){
						this._painter_mode = "erase";
					}else{
						this._painter_mode = "pencil";
					}
					console.log("设置混合模式："+this._painter_mode);
					
				},
				painter_mode:function(){
					return this._painter_mode ? this._painter_mode : "pencil";
				},
				
				//页码管理工具
				tool_page : {
					
					//存放page的列表
					_pages : [],
					
					get current_page(){
						(this._current_page == undefined)  || (this._current_page = 0 ); 
						return this._current_page;
					},
					set current_page(value){
						this._current_page = value;
					},
					
					//插入一个页面
					insert_page : function(data , win, fail ){
						
						page = data.data;
						var contxt = Kernel.board.canvas().getContext("2d");
						var w = Kernel.board.canvas().width;
						var h = Kernel.board.canvas().height;
						var imgData = contxt.getImageData( 0, 0, w, h );
						this._pages[ this.current_page ] = imgData;
						contxt.clearRect( 0, 0, w , h );
						
						for(var i = this._pages.length-1 ; i >= page-1; i--  ){
							this._pages[i+1] = this._pages[i]; 
						}
						this._pages[ page-1 ] = contxt.getImageData( 0, 0, w, h );
						this.current_page = page-1;
						(typeof win === "function") && win();
						
					},
					
					//下一页
					next_page : function(obj,win,fail){
						
						var contxt = Kernel.board.canvas().getContext("2d");
						var w = Kernel.board.canvas().width;
						var h = Kernel.board.canvas().height;
						var imgData = contxt.getImageData( 0, 0, w, h );
						this._pages[ this.current_page ] = imgData;
						contxt.clearRect( 0, 0, w , h );
						this.current_page++;
						imgData = null;
						this._pages[this.current_page] || ( imgData = this._pages[this.current_page] )  ;
						
						if(imgData) contxt.drawImage( imgData, 0, 0, w, h );
						(typeof win === "function") && win();
					
					}
				
				},
				
				
				//画笔工具
				tool_pencil:{
					
					get_context:function(stroke_id){
						this._ctx_arr || ( this._ctx_arr = [] );
						
						var x;
						for( x in this._ctx_arr ){
							if( this._ctx_arr[x] == stroke_id ){
								return this._ctx_arr[x];
							}
						}
						
						var contxt = Kernel.board.canvas().getContext("2d");
						contxt.lineWidth = Kernel.board.painter.painter_line_width();
						contxt.strokeStyle = Kernel.board.painter.painter_color();//颜色
						contxt.strokeId = stroke_id;
						this._ctx_arr.push(contxt);
						return contxt;
						
					},
					
					del_context:function(stroke_id){
						 
						var remaining = [];
						var x;
						for(x in this._ctx_arr ){
							var contxt = this._ctx_arr[x];
							if( contxt.strokeId != stroke_id ){
								remaining.push(contxt);
							}
						}
						
						if (remaining.length) {
							this._ctx_arr = remaining;
					    } else {
					    	delete this._ctx_arr;
					    }
			
					},
					
					render:function(data){
						/*
							{"class":"DRStrokeRecord", "timestamp":5.132204, "strokeId":6175405760, "phase":0, "x":561.000000, "y":229.500000},
    				     */
						var contxt = this.get_context(data.strokeId);
						if( data.phase == 0 ){
							contxt.beginPath(); 
							contxt.moveTo( data.x, data.y ); // 移动到坐标 50 50 
						}else if( data.phase == 1 ){
							contxt.lineTo( data.x, data.y ); // 划出轨迹到 150 150
							contxt.stroke();
						}else{
							contxt.lineTo( data.x, data.y ); // 划出轨迹到 150 150
							contxt.stroke();
							this.del_context(data.strokeId);
						}
						
					},
					
				},
				
				//文件工具
				tool_file : {
					
					get imgs(){
						return Kernel.rs.img;
					},
					get files(){
						return Kernel.file_or_ppt;
					},
					
					//ppt翻页
					turn_page : function( obj, win, fail ){
						Kernel.board.tool_page.next_page(obj,win,fail);
					},
					
					//绘制图片
					render : function( obj, win, fail ){
						
						if( obj.fileType == 1 ){//1是图片
							var fileId = obj.fileId;
							var imgs = this.imgs;
							var len = imgs.length;
							var img = null;
							for(var i = 0; i < len; i++){
								if(imgs[i].fileId == fileId){
									img = imgs[i];
									break;
								}
							}
							if( img.complete ){
								
								var ctx=Kernel.board.canvas().getContext("2d");
								ctx.drawImage( img, obj.x, obj.y, obj.width, obj.height );
								(typeof win == "function") && win();
							}
							else{
								this._block_elem = img;
								(typeof fail == "function") && fail();
							}
							
						}else{//是文件或者ppt
							var fileId = obj.fileId;
							var file_or_ppt = this.files;
							var len = file_or_ppt.length;
							var img = null;
							for(var i = 0; i < len; i++){
								if(file_or_ppt[i].fileId == fileId){
									img = imgs[i];
									break;
								}
							}
							if( img.complete ){
								var canvas = Kernel.board.canvas();
								var ctx= canvas.getContext("2d");
								ctx.clearRect( 0, 0, canvas.width, canvas.height );
								ctx.drawImage( img, obj.x, obj.y, obj.width, obj.height );
								(typeof win == "function") && win();
							}
							else{
								this._block_elem = img;
								(typeof fail == "function") && fail();
							}
						}
						
						
					},
				},
				//toll_file
				
				
				//橡皮工具
				tool_erase:{
					
					//获取画笔
					get_context:function(stroke_id){
						this._ctx_arr || ( this._ctx_arr = [] );
						
						var x;
						for( x in this._ctx_arr ){
							if( this._ctx_arr[x] == stroke_id ){
								return this._ctx_arr[x];
							}
						}
						
						var contxt = Kernel.board.canvas().getContext("2d");
						contxt.lineWidth = Kernel.board.painter.painter_line_width();
						//contxt.strokeStyle = "#FFFFFF";//颜色
						contxt.strokeId = stroke_id;
						this._ctx_arr.push(contxt);
						return contxt;
						
					},
					
					del_context:function(stroke_id){
						 
						var remaining = [];
						var x;
						for(x in this._ctx_arr ){
							var contxt = this._ctx_arr[x];
							if( contxt.strokeId != stroke_id ){
								remaining.push(contxt);
							}
						}
						
						if (remaining.length) {
							this._ctx_arr = remaining;
					    } else {
					    	delete this._ctx_arr;
					    }
			
					},
					
					
					render:function(data){
						
						var contxt = this.get_context(data.strokeId);
						var w = Kernel.board.painter.painter_line_width();
						var x = data.x - w/2;
						var y = data.y - w/2;
						contxt.clearRect( x, y, w, w );
						if( data.phase == 2 ){							
							this.del_context(data.strokeId);
						}
						
						
					}
				},
				//tool_erase
				
				tool_clear : {
					render:function(){
						var canvas = Kernel.board.canvas();
						var ctx = canvas.getContext("2d");
						ctx.clearRect( 0, 0, canvas.width, canvas.height );
					}
				},
				//tool_clear
				
				
				
				
			}
			//painter
			
			
		}
		//board
		
		
	};
	
	
	
	//应用程序的入口 
	var run  = html5Player.init = function( canvas_id ,audio_id ){
		
		View.init();
		Kernel.init( document.getElementById( canvas_id ), document.getElementById( audio_id ) );
	
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
	
	View.extend = Events.extend = Extend;
	
	window.player = html5Player;
   
} )( window, $);

//----------------------------------


player.view.extend({
	initialize:function(){
		
		$("#play").click(function(){
			var s = this.status();
			if( s == "play" || s == "wait"){
				this.pause();
				
			}else{
				var url = "./trail1411451320";
				this.play(url);
			}
			
		}.bind(this));
		
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
		
		$(document).mouseup(function(){
			this._changeVoice = void 0;
			//alert("22");
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
			//$("span").text(e.pageX + ", " + e.pageY);
			
		}.bind(this));
		

		console.log("view--extend--init");
	},
	
	//在播放之前，当正在加载文件的时候
	on_start:function(){
		console.log("on_start");
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
		var len = Math.floor( this.total_time() );
		var h = Math.floor( len / 3600 ) ; //视频的时间 -小时
		var m = Math.floor( (len % 3600) / 60 );//视频的时间 -分钟
		var s = (len % 60);//视频的时间 -秒数
		
		console.log("视频长度："+len+"->"+h+":"+m+":"+s );
		$("#total-time").html(h+":"+m+":"+s);
	},
	
	//当时间改变的时候
	on_time_change:function(now_time){
		console.log("on_time_change");
		console.log("new_time:"+now_time);
		var h = Math.floor( now_time / 3600 ) ; //视频的时间 -小时
		var m = Math.floor( ( now_time % 3600  ) / 60 );//视频的时间 -分钟
		var s = Math.floor( now_time  % 60 );//视频的时间 -秒数
		$("#s").html(s);							
		$("#m").html(m);
		$("#h").html(h);
	
		var cct = now_time / this.total_time() * 100;
		if(cct>100){
			cct = 100;
		}
		
		$("#current-time").animate({ width : cct+"%" },980);
	},
	
	on_mute_change:function(val){
		console.log("on_mute_change");
		console.log("new_status:"+val);
	},
	
	on_volume_change:function(val){
		console.log("on_volume_change");
		console.log("new_volume:"+val);
	},
	
	
});

player.init("myCanvas","audio");


function android_play(){
	if(player.view.status ()!= "play"){
		$("#play").click();
	}
	
}

function android_pause(){
	if(player.view.status ()!= "pause"){
		$("#play").click();
	}
}


/*
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
*/


