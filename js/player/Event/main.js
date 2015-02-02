define(function (require, exports, module) {
	console.log("load event");
	//var player = require("pkg!core");
	//console.log(palyer);
	//palyer.a = 1;
	var Event =  {
			
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
	
	
	
	return Event;
	
});