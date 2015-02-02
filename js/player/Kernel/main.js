define(function (require, exports, module) {
	
	//var player = require("pkg!core");
	//console.log(palyer);
	//console.log(palyer.a);
	
	var Events = require("pkg!Event");
	
	var Kernel = {
		Events: Events,
		init : function( canvas_obj, audio_obj ){
			this.audio.init(audio_obj);
			this.board.init(canvas_obj);
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
				Kernel.board.reset();
				Kernel.audio.reset();
				Kernel.rs.reset();
				Kernel.rs.init(url);
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
						var now_t = Math.ceil(c_t);
						if(this._last_time !== undefined){
							if( this._last_time != now_t ){
								if( now_t<this._last_time ){
									//清空画布
									Kernel.board.reset();
								}
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
			seek_to:function(val, success){
				Kernel.audio.set_current_time(val);
				Events.trigger("Kernel:Control:seek_end",val);
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
					url:url+"/event.json",
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
				this._file_or_ppt = [];
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
			
			
			
		},
		//audio
		
		
		//白板
		board:{
			
			reset:function(){
				
				console.group("board reset!!");
				this._index = 0;
				this.painter.tool_clear.render();
				console.info("清空画布！");
				this.painter.reset();
				console.info("painter reset!!");
				this._block_elem && (this._block_elem = void 0 );
				console.info("block_elem reset!!");
				console.groupEnd("board reset!!");
				
			},
			
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
					this.tool_page.reset();
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
					reset : function(){
						this._pages = [];
					},
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
						return Kernel.rs.file_or_ppt;
					},
					
					//ppt翻页
					turn_page : function( obj, win, fail ){
						Kernel.board.painter.tool_page.next_page(obj,win,fail);
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
								Kernel.board._block_elem = img;
								(typeof fail == "function") && fail();
							}
							
						}else{//是文件或者ppt
							var fileId = obj.fileId;
							var file_or_ppt = this.files;
							var len = file_or_ppt.length;
							var img = null;
							for(var i = 0; i < len; i++){
								if(file_or_ppt[i].fileId == fileId){
									img = file_or_ppt[i];
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
								Kernel.board._block_elem = img;
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
						contxt.strokeStyle = "#FFFFFF";//颜色
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
						
						/*
						var contxt = this.get_context(data.strokeId);
						var w = Kernel.board.painter.painter_line_width();
						var x = data.x - w/2;
						var y = data.y - w/2;
						contxt.clearRect( x, y, w, w );
						if( data.phase == 2 ){							
							this.del_context(data.strokeId);
						}
						*/
						
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
	return Kernel;
});