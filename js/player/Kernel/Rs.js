define(function (require, exports, module) {
	var Events = require("pkg!Event");
	var config = require("pkg!config");
	var $ = require("jquery");

	//资源 用于加载图片等资源
	var Rs ={	
		get img(){
			this._img || ( this._img=[] );
			return this._img; 
		},
		get file_or_ppt(){ 
			this._file_or_ppt || ( this._file_or_ppt = [] ); 
			return this._file_or_ppt; 
		},
		init:function( url, Audio_set_src, Board_set_trail , Audio_can_play){
			
			if(this._hasinited)return ;
			console.log("src=\""+url+"/audio.mp3\"");
			Audio_set_src( url+"/audio.mp3" );
			
			$.ajax({
				url:url+"/event.json",
				dataType:"json",
				async : false,
				success:function(data){
					console.log(data);
					Board_set_trail( data );
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
									Rs.img.push(imgobj);
								
								}else{//如果是 ppt 或 文件 type == ppt or file
									
									imgobj = new Image();
									//imgobj.src = record[i].relativeSourcePath + "/" + record[i].pageIndex + ".png";
									imgobj.src = url +"/"+ record[i].relativeSourcePath;
									imgobj.fileId = record[i].fileId;
									imgobj.pageIndex = record[i].pageIndex;
									Rs.file_or_ppt.push(imgobj);
									
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
				if(Audio_can_play()){
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
		
	};
	//rs
	
	
	return Rs;
	
});