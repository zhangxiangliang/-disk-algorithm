"use strict";
// 全局变量
var sequence = []; 					// 磁盘序列
var direction = 'asc';				// 磁盘方向
var index;							// 磁头位置
var path = [];						// 访问路径
var runid;							// 正在运行的 id
var cache = {
	comment: $('.comment'),			// 提示消息
	text: $('.header .sequence'),	// 输入框
	boxs: $('#boxs'),				// 序列容器
	index: '',						// 磁头对象
	sequenceBox: '',				// 缓存序列容器
};									// 缓存数据减少 DOM 访问

// 加载后显示 box
$('#boxs').mixItUp({
	selectors: {
		target: '.box'
	}
});

// 创建序列
function init() {
	// 消息提示
	message("# 正在初始化 ...");
	sequence = []; 					// 磁盘序列
	direction = 'asc';				// 磁盘方向
	index;							// 磁头位置
	path = [];						// 访问路径
	runid;							// 正在运行的 id
	$('.result .boxs').html("<div class='box' style='padding: 0 15px;'>暂无结果</div>");
	// 初始化 序列数组
	var arr = cache.text.val().trim();
	sequence = arr.split(' ');
	for(var i = 0; i < sequence.length; i++) {
		sequence[i] = parseInt(sequence[i]);
	}
	// console.log(["当前序列:", sequence].join(' '));
	createBox();
}

// 创建和渲染 box
function createBox() {
	// 消息提示
	message("# 点击设置当前磁头位置");

	// 创建和渲染 box
	$('#boxs').html("");
	for(var i = 0; i < sequence.length; i++) {
		var box = $("<div/>").attr("data-number", i)
					.addClass("box").html(sequence[i])
					.on('click', function() {
						if(index != undefined) {
							cache.index.className = 'box';
						}
						index = this.getAttribute("data-number");
						this.className = 'box red';
						cache.index = this;
					});
		$('#boxs').append(box);
	}
	$('#boxs').mixItUp('changeLayout', 'inline-block');
	cache.sequenceBox = $('#boxs .box');
	// 消息提醒
	direction = 'asc';
	message("# 点击设置当前磁头位置，磁头方向为向内");
}

// 运行
function run() {
	var arrBoxs = [];
	var boxs = cache.sequenceBox;
	var result = $('.result .boxs').html('');
	console.log(boxs);
	for(var i = 0; i < boxs.length; i++) {
		arrBoxs[i] = boxs[i];
	}
	var i = 0;
	runid = setInterval(function() {
		if(i == path.length) {
			result.append(arrBoxs[path[i]]);
			 var div = $('<div/>').addClass('box green')
			 			.attr('style', "display: inline-block;")
			 			.text("调度已完成");
			$('#boxs').append(div);
		} else {
			if(path.length - i == 1) {
				arrBoxs[path[i]].className = 'red box';
			}else {
				arrBoxs[path[i]].className = 'red box';
				arrBoxs[path[i+1]].className = 'yellow box';
			}
			result.append(arrBoxs[path[i]]);
			i++;
		}
	}, 1000);
	setTimeout(function() {
		window.clearInterval(runid);
	},1000 * (path.length+1));
}

// 重置
function clearAll() {
	message("# 请创建磁盘序列");
	sequence = []; 					// 磁盘序列
	direction='asc';						// 磁盘方向
	index = 0;							// 磁头位置
	path = [];						// 访问路径
	runid = 0;							// 正在运行的 id
	$('.result .boxs').html("<div class='box' style='padding: 0 15px;'>暂无结果</div>");
	$('#boxs').html("<div class='box red' style='display:inline-block'>当前磁盘序列为空</div>");
}

// 恢复
function reset() {
	window.clearInterval(runid);
	path = [];						// 访问路径
	runid;							// 正在运行的 id
	$('.result .boxs').html("<div class='box' style='padding: 0 15px;'>暂无结果</div>");
	createBox();
}

// 停止
function closeRun() {
	window.clearInterval(runid);
}

// 调度算法 SSTF
function SSTF() {
	message("# 正在使用 SSTF 进行磁盘调度");
	path = [];
	var arr = sequence.concat();
	var now = sequence[index];
	arr[index] = -1;

	var flogIndex = parseInt(index);
	path.push(flogIndex);
	for(var i = 0, length = arr.length; i < length - 1; i++) {
		var flog = 9999;
		for(var j = 0; j < arr.length; j++) {
			var result = Math.abs(now - arr[j]);
			if(result < flog && arr[j] >= 0) {
				flog = result;
				flogIndex = j;
			}
		}
		now = arr[flogIndex];
		arr[flogIndex] = -1;
		path.push(flogIndex);
	}
	run();
}

// 调度算法 SCAN
function SCAN() {
	message("# 正在使用 SSTF 进行磁盘调度");
	path = [];
	var arr = replace();
	var flogIndex;
	if(direction == 'asc') {
		arr.sort(function(a, b) {
			return a.value - b.value;
		});
	} else if(direction == 'desc') {
		arr.sort(function(a, b) {
			return b.value - a.value;
		});
		console.log('a');
	}
	console.log(arr);
	for(var j = 0; j < arr.length; j++) {
		if(arr[j].index == index){
			flogIndex = j;
			break;
		}
	}
	var j=0;
	for(var i = flogIndex; i >= 0; i--) {
		path[j] = arr[i].index;
		j++;
	}
	for(var i = flogIndex + 1; i < arr.length; i++) {
		path[j] = arr[i].index;
		j++;
	}
	console.log(path + '   ' + flogIndex + ' length: ' + arr.length);
	run();
}

// 生成替身
function replace() {
	var arr = [];
	for(var i = 0; i < sequence.length; i++) {
		arr[i] = {
			index: i,
			value: sequence[i], 
			visited: false
		};
	}
	return arr;
}

// 磁头方向：向内
function asc() {
	if(direction == 'asc')
		return;
	message("# 当前磁头位置已设定，磁头方向为向内");
	direction = 'asc';
	$('#boxs').mixItUp('sort', 'number:asc');
}

// 磁头方向：向外
function desc() {
	if(direction == 'desc')
		return;
	message("# 当前磁头位置已设定，磁头方向为向外");
	direction = 'desc';
	$('#boxs').mixItUp('sort', 'number:desc');
}

// 消息通知
function message(comment) {
	cache.comment.text(comment);
}