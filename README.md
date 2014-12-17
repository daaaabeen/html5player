html5player V2.0
===========

对电子白板播放器进行了重构
使用了全新的架构
采用了消息机制
player对象包含Events,View, Kernel三个对象和init方法
使用者可以通过调用View对象的extend方法，来使用自己定义的播放器ui
View提供了以下方法来提供对视频播放的控制：
start() play() pause() mute() set_volume() status() current_time() total_time() 

在initialize:function(){},方法中使用者可以对UI上的功能按钮进行事件绑定

通过重写View对象的以下方法来实现事件的反馈
		on_start:function(){},
		on_play:function(){},
		on_stop:function(){},
		on_wait:function(){},
		on_pause:function(){},
		on_rs_inited:function(){},
		on_time_change:function(){},
		on_mute_change:function(){},
		on_volume_change:function(){},
