define(function (require, exports, module) {
	//var Events = require("pkg!Event");
	var config = require("pkg!config");
	//var Rs = require("./Rs");
	//console.log(config);
	var Painter = require("./Board/Painter");
	var Board = {
		reset:function(){
			console.group("board reset!!");
			this._index = 0;
			Painter.tool_clear.render();
			console.log("清空画布！");
			Painter.reset();
			console.log("painter reset!!");
			console.log("block_elem reset!!");
			console.groupEnd("board reset!!");
			
		},
		
		init:function(){
			
			var backId = config.config.canvas.backId;
			var frontId = config.config.canvas.frontId;
			this._c_back = document.getElementById(backId);
			this._c_front = document.getElementById(frontId);
			Painter.init(this._c_front, this._c_back);
		},

		//判断能否播放
		can_play : function(){
			
			if( Painter._block_elem ){//检测阻止播放的条件是否已经不存在
				if( Painter._block_elem.complete ){
					Painter._block_elem = void 0;
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
			console.group("set trail");
			console.log("records count:"+this._len);
			console.log("now index:"+this._index);
			console.groupEnd("set trail");
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
				if(  trail_class == "DRStrokeRecord" ){
					console.log("class:" + trail_class);
					Painter.read_and_parse( this._records[this._index] , win  );
					
				}else if(trail_class == "DRFileRecord" ){//插入图片，ppt，文件等
					
					console.log("class:" + trail_class);
					Painter.read_and_parse( this._records[this._index] , win , fail  );
					
				}else if( trail_class == "DRClearCanvasRecord" ){
					console.log("class:" + trail_class);
					Painter.read_and_parse( this._records[this._index] , win  );
					
				}else if(trail_class == "DRRevokeRecord" || trail_class == "DRRedoRecord" || trail_class == "DRContextRecord" ){//redo undo 
					console.log("class:" + trail_class);
					Painter.read_and_parse( this._records[this._index] , win , fail  );
					
				}else{
					this._index++;
				}
				
			}
		}
		
	};
	//board
		
	return Board;
	

	
});