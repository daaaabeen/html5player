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
				//console.log(win);
				this.push_obj_2_pages(obj);
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
				}else if( type == 4 ){//翻到下一页 
					this.tool_page.next_page( obj , this.turn_page_print.bind(this), success );
					
				}else if( type == 6 ){//幻灯片翻到上一页
					this.tool_page.pre_page( obj, this.turn_page_print.bind(this), success );
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
				success(obj);
			}else if( obj.class == "DRClearCanvasRecord" ){
				this.tool_clear.render();
				success(obj);
			}else if( obj.class == "DRFileRecord" ){
				this.tool_file.render( obj, success, fail );
			}else if( obj.class == "DRRevokeRecord" ){
				this.tool_redo_undo.undo(obj,this.redo_undo_print.bind(this),success);
			}else if( obj.class == "DRRedoRecord" ){
				this.tool_redo_undo.redo(obj,this.redo_undo_print.bind(this),success);
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
		
		//翻页后绘制页码中的
		turn_page_print : function(){
			this.tool_clear.render();
			var s = this.tool_page.get_current_page_data();
			var success = function(){
				this.push_obj_2_undo_stack(obj);
			}.bind(this);
			for( var i = 0; i < s.length; i++  ){
				var obj =  s[i];
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
					success(obj);
				}else if( obj.class == "DRClearCanvasRecord" ){
					this.tool_clear.render();
					success(obj);
				}else if( obj.class == "DRFileRecord" ){
					this.tool_file.render( obj, success, fail );
				}else if( obj.class == "DRRevokeRecord" ){
					this.tool_redo_undo.undo(obj,this.redo_undo_print.bind(this),success);
				}else if( obj.class == "DRRedoRecord" ){
					this.tool_redo_undo.redo(obj,this.redo_undo_print.bind(this),success);
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
		
		//将数据加入到页码列表中
		push_obj_2_pages: function(obj){
			
			if( obj.class == "DRContextRecord" ){
				if(obj.type > 3)return ;
			}
			this.tool_page.push_obj(obj);
		},
		
		//页码管理工具
		tool_page : {
			reset : function(){
				this._pages = [];
				this._current_page = 0;
			},
			
			//将数据插入到页码列表中
			push_obj : function(obj){
				
				this._pages || (this._pages = []);
				this._current_page ||  (this._current_page = 0);
				this._pages[this._current_page] || (this._pages[this._current_page] = []);
				this._pages[this._current_page].push(obj);
			
			},
			
			//获取当前页码的内容
			get_current_page_data : function(){
				this._pages || (this._pages = []);
				this._current_page ||  (this._current_page = 0);
				return this._pages[this._current_page] || (this._pages[this._current_page] = []);
				
			},
			
			//下一页
			next_page : function( obj,print,win,fail ){
				
				this._current_page++;
				print();
				(typeof win === "function") && win();
			
			},
			//上一页
			pre_page :function( obj,print,win ){
				( this._current_page > 0 ) && this._current_page--;
				print();
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
			
			compute_line_width_from_speed : function( base_width, obj ){
				var width = base_width;		
				var level = 1; //平滑度
				if( obj.phase != 0 ){
					var l = Math.sqrt( ( obj.x - this._last_x ) * ( obj.x - this._last_x ) + ( obj.y - this._last_y ) * ( obj.y - this._last_y ) ); 
					var v = ( obj.timestamp - this._last_t ) / l;//v的倒数
					this._base_v || (this._base_v = v);
					var p = v / this._base_v ; 
					for( var i = 0; i<level; p = Math.sqrt(p),i++ );
					
					var tmp_w = p * base_width;
					
					(width > tmp_w) && ( width = tmp_w );
					//console.info("width:", width ," x:", obj.x," y:",obj.y," l:",l," v:",v ); 
				} 
				if( obj.phase == 2 ){
					this._last_t = this._last_x = this._last_y = this._base_v = void 0;
				}else{
					this._last_t = obj.timestamp;
					this._last_x = obj.x;
					this._last_y = obj.y;
				}
				return width; 
				
			},
			
			render:function(data){
				
				var contxt = this.get_context(data.strokeId);
				contxt.lineWidth = this.compute_line_width_from_speed( Painter.painter_line_width() , data );
				if( data.phase == 0 ){
					//contxt.beginPath(); 
					//contxt.moveTo( data.x, data.y ); // 移动到坐标 50 50 
					this._last_render_x = data.x;
					this._last_render_y = data.y;
					
				}else if( data.phase == 1 ){
					contxt.beginPath(); 
					contxt.lineJoin="round";
					contxt.lineCap="round";
					contxt.moveTo( this._last_render_x, this._last_render_y ); // 移动到坐标 
					contxt.lineTo( data.x, data.y ); // 划出轨迹到 
					contxt.stroke();
					this._last_render_x = data.x;
					this._last_render_y = data.y;
				}else{
					contxt.beginPath(); 
					contxt.lineJoin="round";
					contxt.lineCap="round";
					contxt.moveTo( this._last_render_x, this._last_render_y ); // 移动到坐标 
					contxt.lineTo( data.x, data.y ); // 划出轨迹到 
					contxt.stroke();
					this._last_render_x = this._last_render_y = void 0;
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
				if(obj.type < 4){
					this._tmpObj || ( this._tmpObj = [] );
					this._tmpObj.push( obj );	
				}
			
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