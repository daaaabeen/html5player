define(function (require, exports, module) {
	var Events = require("pkg!Event");
	var config = require("pkg!config");
	var Rs = require("./Rs");
	//console.log(config);
	
	var Board = {
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
		
		init:function(){
			
			var backId = config.config.canvas.backId;
			var frontId = config.config.canvas.frontId;
			this._c_back = document.getElementById(backId);
			this._c_front = document.getElementById(frontId);
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
		canvas:function(pos){
			if( pos && pos == "back")
				return this._c_back;
			return this._c_front;
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
					var contxt = Board.canvas().getContext("2d");
					var w = Board.canvas().width;
					var h = Board.canvas().height;
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
					
					var contxt = Board.canvas().getContext("2d");
					var w = Board.canvas().width;
					var h = Board.canvas().height;
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
					
					var contxt = Board.canvas().getContext("2d");
					contxt.lineWidth = Board.painter.painter_line_width();
					contxt.strokeStyle = Board.painter.painter_color();//颜色
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
					return Rs.img;
				},
				get files(){
					return Rs.file_or_ppt;
				},
				
				//ppt翻页
				turn_page : function( obj, win, fail ){
					Board.painter.tool_page.next_page(obj,win,fail);
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
							
							var ctx=Board.canvas("back").getContext("2d");
							ctx.drawImage( img, obj.x, obj.y, obj.width, obj.height );
							(typeof win == "function") && win();
						}
						else{
							Board._block_elem = img;
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
							var canvas = Board.canvas("back");
							var ctx= canvas.getContext("2d");
							ctx.clearRect( 0, 0, canvas.width, canvas.height );
							ctx.drawImage( img, obj.x, obj.y, obj.width, obj.height );
							(typeof win == "function") && win();
						}
						else{
							Board._block_elem = img;
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
					
					var contxt = Board.canvas().getContext("2d");
					contxt.lineWidth = Board.painter.painter_line_width();
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
					
				}
			},
			//tool_erase
			
			tool_clear : {
				render:function(){
					var canvas = Board.canvas();
					var ctx = canvas.getContext("2d");
					ctx.clearRect( 0, 0, canvas.width, canvas.height );
					
					var canvas_back = Board.canvas("back");
					var ctx_back = canvas_back.getContext("2d");
					ctx_back.clearRect( 0, 0, canvas_back.width, canvas_back.height );
				}
			},
			//tool_clear
				
		}
		//painter
		
	};
	//board
		
	return Board;
	
});