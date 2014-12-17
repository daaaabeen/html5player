Html5CanvasPlayer v2.0
====================
Copyright (c) 2014 dianbin lee


对电子白板播放器进行了重构<br>
使用了全新的架构<br>
采用了消息机制<br>
player对象包含Events,View, Kernel三个对象和init方法<br>

使用者可以通过调用View对象的extend方法，来使用自己定义的播放器ui<br>
View提供了以下方法来提供对视频播放的控制：<br>
start() play() pause() mute() set_volume() status() current_time() total_time() <br>
<br>

在initialize:function(){},方法中使用者可以对UI上的功能按钮进行事件绑定<br>
通过重写View对象的以下方法来实现事件的反馈<br>
		on_start:function(){},<br>
		on_play:function(){},<br>
		on_stop:function(){},<br>
		on_wait:function(){},<br>
		on_pause:function(){},<br>
		on_rs_inited:function(){},<br>
		on_time_change:function(){},<br>
		on_mute_change:function(){},<br>
		on_volume_change:function(){},<br>
		
使用者通过init()方法进行player的初始化，要求传入两个参数，第一个canvas的id 第二个是audio的id
