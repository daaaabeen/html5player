define(function (require, exports, module) {
	
	var Rs = require("../Rs");
	var Painter = {
		init:function( f_canvas, b_canvas ){
			this.f_c = f_canvas;
			this.b_c = b_canvas;
			
		},
		
		reset:function(){
			this._painter_color = void 0;
			this._painter_line_width = void 0;
			this._painter_mode = void 0;
			this._block_elem && (this._block_elem = void 0 );
			this.tool_redo_undo.reset();
			this.tool_page.reset();
		},
			
		read_and_parse:function( obj , win ,fail ){
			
			var success = function(){
				this.push_obj_2_undo_stack(obj);
				( typeof win === "function" ) && win();
			}.bind(this);
			
			if( obj.class == "DRContextRecord" ){
				var type = obj.type;
				if(type == 1){//设置画笔颜色
					this.set_painter_color(obj.data);
					success();
				}else if( type == 2 ){//设置画笔粗细
					this.set_painter_line_width(obj.data);
					success();
				
				}else if( type == 3 ){//设置混合模式（正常或者擦除）
					this.set_painter_mode(obj.data);
					success();
				}else if( type == 4 ){//插入一个新的页面 
					this.tool_page.insert_page( obj , success );
					
				}else if( type == 5 ){//幻灯片翻到下一页
					this.tool_file.turn_page( obj, success, fail );
				}else{
					success();
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
				this.push_obj_2_undo_stack(obj);
				win();
			}else if( obj.class == "DRClearCanvasRecord" ){
				this.tool_clear.render();
				this.push_obj_2_undo_stack();
				win();
			}else if( obj.class == "DRFileRecord" ){
				var success = function(){
					console.info(obj);
					this.push_obj_2_undo_stack(obj);
					win();
				}.bind(this);
				this.tool_file.render( obj, success, fail );
			}else if( obj.class == "DRRevokeRecord" ){
				this.tool_redo_undo.undo(obj,this.redo_undo_print.bind(this),win);
			}else if( obj.class == "DRRedoRecord" ){
				this.tool_redo_undo.redo(obj,this.redo_undo_print.bind(this),win);
			}
				
		},
			
		//绘制undo列表中的
		redo_undo_print : function(){
			this.tool_clear.render();
			var s = this.tool_redo_undo.undo_stack.get_stack();
			for( var i = 0; i < s.length; i++  ){
				for(var j = 0; j<s[i].length; j++){	
					var obj = s[i][j];
					if( obj.class == "DRContextRecord" ){
						var type = obj.type;
						if(type == 1){//设置画笔颜色
							
							this.set_painter_color(obj.data);
							
						}else if( type == 2 ){//设置画笔粗细
							this.set_painter_line_width(obj.data);
							
						
						}else if( type == 3 ){//设置混合模式（正常或者擦除）
							this.set_painter_mode(obj.data);
							
						
						}else if( type == 4 ){//插入一个新的页面 
							this.tool_page.insert_page( obj  );
							
						}else if( type == 5 ){//幻灯片翻到下一页
							this.tool_file.turn_page( obj );
						}
						
					}else if( obj.class == "DRStrokeRecord" ){
						if( this.painter_mode() == "erase" ){
							this.tool_erase.render(obj);
						}else if( this.painter_mode() == "pencil" ){
							this.tool_pencil.render(obj);
						}
					}else if( obj.class == "DRClearCanvasRecord" ){
						this.tool_clear.render();
					}else if( obj.class == "DRFileRecord" ){
						this.tool_file.render(obj);
					}
				}
				
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
				var contxt = Painter.f_c.getContext("2d");
				var w = Painter.f_c.width;
				var h = Painter.f_c.height;
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
				
				var contxt = Painter.f_c.getContext("2d");
				var w = Painter.f_c.width;
				var h = Painter.f_c.height;
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
				
				var contxt = Painter.f_c.getContext("2d");
				contxt.lineWidth = Painter.painter_line_width();
				contxt.strokeStyle = Painter.painter_color();//颜色
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
				Painter.tool_page.next_page(obj,win,fail);
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
						
						var ctx=Painter.b_c.getContext("2d");
						ctx.drawImage( img, obj.x, obj.y, obj.width, obj.height );
						(typeof win == "function") && win();
					}
					else{
						Painter._block_elem = img;
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
						var canvas = Painter.b_c;
						var ctx= canvas.getContext("2d");
						ctx.clearRect( 0, 0, canvas.width, canvas.height );
						ctx.drawImage( img, obj.x, obj.y, obj.width, obj.height );
						(typeof win == "function") && win();
					}
					else{
						Painter._block_elem = img;
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
				
				var contxt = Painter.f_c.getContext("2d");
				contxt.lineWidth = Painter.painter_line_width();
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
				var canvas = Painter.f_c;
				var ctx = canvas.getContext("2d");
				ctx.clearRect( 0, 0, canvas.width, canvas.height );
				
				var canvas_back = Painter.b_c;
				var ctx_back = canvas_back.getContext("2d");
				ctx_back.clearRect( 0, 0, canvas_back.width, canvas_back.height );
			}
		},
		//tool_clear
		
		
		//将轨迹加入到栈中
		push_obj_2_undo_stack : function( obj ){
			 
			var trail_class = obj.class;
			if( trail_class == "DRStrokeRecord" ){
				this._tmpObj || ( this._tmpObj = [] );
				this._tmpObj.push( obj );
				if( obj.phase == "2" ){
					this.tool_redo_undo.undo_stack.push( this._tmpObj );
					this.tool_redo_undo.redo_stack.clear();
					this._tmpObj = void 0;
				}
			
			}else if( trail_class == "DRContextRecord" ){
				this._tmpObj || ( this._tmpObj = [] );
				this._tmpObj.push( obj );
			
			}else if( trail_class == "DRFileRecord" || trail_class == "DRClearCanvasRecord" ){
				this._tmpObj || ( this._tmpObj = [] );
				this._tmpObj.push( obj );
				this.tool_redo_undo.undo_stack.push( this._tmpObj );
				this.tool_redo_undo.redo_stack.clear();
				this._tmpObj = void 0;
			}
			 
		},
				
		tool_redo_undo:{
			reset:function(){
				this.redo_stack.clear();
				this.undo_stack.clear();
			},
			//撤回
			redo : function(obj,print,win){
				this.undo_stack.push( this.redo_stack.pop() );
				print();
				win();
			},
			
			//撤销
			undo : function(obj,print,win){
				this.redo_stack.push( this.undo_stack.pop() );
				print();
				win();
			},
			redo_stack : {
				push : function(obj){
					this._redo_stack || ( this._redo_stack = [] );
					return this._redo_stack.push(obj);
				},
				pop : function(){
					if(this._redo_stack){
						if( this._redo_stack.length > 0 ){
							return this._redo_stack.pop();
						}else{
							return false;
						}
					}else{
						return false;
					}
				},
				get_stack : function(){
					return this._redo_stack || [];
				},
				clear : function(){
					this._redo_stack = void 0;
				}
			},
			
			undo_stack : {
				
				push : function(obj){
					this._undo_stack || ( this._undo_stack = [] );
					return this._undo_stack.push(obj);
				},
				pop : function(){
					if(this._undo_stack){
						if( this._undo_stack.length > 0 ){
							return this._undo_stack.pop();
						}else{
							return false;
						}
					}else{
						return false;
					}
				},
				get_stack : function(){
					return this._undo_stack || [];
				},
				clear : function(){
					this._undo_stack = void 0;
				}
			}
		}
		//tool_redo_undo
	};
	return Painter;
});