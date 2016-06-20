// 全局变量
var memoryNumber = 7;
var pageLost = 0;
var stack = [];
var memoryStack = [];
var method = 'fifo';
var runid = '';
var cache = {
	memoryNumberInput: $('#memoryNumber'),
	stackInput: $('#stack'),
	stackWait: $('#stackWait'),
	stackFinish: $('#stackFinish'),
	stackStatus: $('#manages .stack .content'),
	methodStatus: $('#manages .method .content'),
	loseStatus: $('#manages .lose .content'),
	cpuStatus: $('#manages .cpu .content'),
	boxs: $('#boxs')
}; // 缓存DOM

// 页块数 初始化
function initMemoryNumber() {

	// 设置页块数
	var _memoryNumber = parseInt(cache.memoryNumberInput.val().trim());
	memoryNumber =_memoryNumber;
	if(isNaN(_memoryNumber))
		memoryNumber = 7;

	// 渲染页块
	var boxs = cache.boxs;
	var width = (480 / memoryNumber) + 'px';
	boxs.html("");
	for(var i = 0; i < memoryNumber; i++) {
		var box = $('<div/>').addClass('box').attr('width', width);
		box.html("空闲");
		boxs.append(box);
	}
	flashPage();
}

// 队列 初始化
function initStack() {
	// 清空队列
	cache.stackWait.html("");
	cache.stackFinish.html("");
	clearStatus();
	// 设置队列 
	var _stack = cache.stackInput.val().trim().split(' ');
	for(var i = 0; i < _stack.length; i++) {
		_stack[i] = parseInt(_stack[i]);
	}
	stack = _stack.concat();

	// 渲染等待队列
	var stackWait = cache.stackWait;
	stackWait.html("");
	for(var i = 0; i < stack.length; i++) {
		var span = $("<span/>").addClass("button yellow").html(stack[i])
					.attr('style', 'margin-left: 9px; display: none;');
		stackWait.append(span);
		memoryStack[i] = -1;
	}

	// 渲染队列状态
	cache.stackStatus.html(stack.length);
	$('.manage.stack').attr('class', 'stack yellow manage');
	$('#stackWait').mixItUp('changeLayout', 'inline');
}

// 重置
function clearAll() {
	stopAll();
	memoryNumber = 7;
	pageLost = 0;
	stack = [];
	memoryStack = [];
	method = 'fifo';
	clearMemory();
	cache.stackWait.html("");
	cache.stackFinish.html("");
	clearStatus();
}

function clearStatus() {
	cache.cpuStatus.html("0");
	$('#manages .cpu').attr('class', 'manage cpu blue');
	cache.loseStatus.html("0");
	$('#manages .lose').attr('class', 'manage lose blue');
	cache.stackStatus.html("0");
	$('#manages .stack').attr('class', 'manage stack blue');
	cache.methodStatus.html("FIFO");
	$('#manages .method').attr('class', 'manage method blue');
}

function clearMemory() {
	var boxs = cache.boxs;
	boxs.html("");
	for(var i = 0; i < memoryNumber; i++) {
		var box = $('<div/>').addClass('box');
		box.html("空闲");
		boxs.append(box);
	}
	flashPage();
	console.log('clear');
}


function stopAll() {
	window.clearInterval(runid);
}

// 运行程序 
function run() {
	memoryStackReset();
	if(method == 'fifo') {
		FIFO();
	} else if(method == 'lru') {
		LRU();
	} else if(method == 'nur'){
		NUR();
	}
}

// 重置缓存数组
function memoryStackReset() {
	for(var i = 0; i < memoryNumber; i++) {
		memoryStack[i] = -1;
	}
}

// 内存更新
function cpuUpdate() {
	var use = 0;
	var box = $('#boxs .box');
	for(var k = 0; k < box.length; k++) {
		if(box[k].innerHTML != '空闲') {
			use++;
		}
	}
	var num = parseInt(use / memoryNumber * 100)
	cache.cpuStatus.html(num + '%');
	if(num < 33){
		$('#manages .cpu').attr('class', 'manage cpu blue');
	} else if (num < 66) {
		$('#manages .cpu').attr('class', 'manage cpu yellow');
	} else if (num <= 100) {
		$('#manages .cpu').attr('class', 'manage cpu red');
	}
}
function stackFinishUpdate() {
	var box = $('#boxs .box');
	for(var k = 0; k < box.length; k++) {
		var span = $('<span/>').addClass('button').text(box[k].innerHTML).attr('style', 'display:inline; margin-left: 9px;');
		cache.stackFinish.append(span);
	}
	var br = $('<br/>');
	cache.stackFinish.append(br);
}

// FIFO 算法
function FIFO() {
	var length = stack.length;
	var _stack = stack.concat();
	var j = 0;
	var i = 0;
	var resetid;
	var stackStatus = cache.stackStatus;
	var loseStatus = cache.loseStatus;
	var flog = 0;
	var flogTime = 0;
	var use = 0;
	cache.stackFinish.html("");
	runid = setInterval(function() {
		if(i != length) {
			flog = 0;
			stackStatus.html(length - i - 1);
			loseStatus.html(parseInt(((i - flogTime + 1) / stack.length)* 100) + '%');
			if((length - i - 1) == 0) 
				$('.manage.stack').attr('class', 'stack green manage');
			var box = $('#boxs .box');
			for(var k = 0; k < box.length; k++) {
				if(box[k].innerHTML == _stack[i]) {
					flog = 1;
					flogTime ++;
					box[k].className = 'box blue';
				}
			}
			if(flog != 1) {
				var div = $('<div/>').addClass('box yellow').text(_stack[i]).attr('style', 'display:inline-block');
				cache.boxs.append(div);
				box[0].remove();
				box = $('#boxs .box');
			}
			i++;
		} else {
			var box = $('#boxs .box');
			var div = $('<div/>').addClass('box green').text("空闲").attr('style', 'display:inline-block');
			cache.boxs.append(div);
			box[0].remove();
		}
		cpuUpdate();
		stackFinishUpdate();
	}, 1000);
	setTimeout(function() {
		window.clearInterval(runid);
	}, (length + memoryNumber + 1) * 1000);
}

// 算法选择
function setMethod(event) {
	var color = '';
	cache.methodStatus.html(event.innerHTML);
	method = event.innerHTML.toLowerCase();
	if(method == 'fifo') {
		color = 'method blue manage';
	} else if(method == 'lru') {
		color = 'method green manage';
	} else {
		color = 'method yellow manage';
	}
	$('#manages .method').attr('class', color);
}

// 刷新效果
function flashPage() {
	cache.boxs.mixItUp('changeLayout', 'inline-block');
}

// 初始化效果
$('#manages').mixItUp({
	selectors: {
		target: '.manage'
	}
});
$('#stackWait').mixItUp({
	selectors: {
		target: '.button',
	},
	layout: {
		display: 'inline'
	}
});
$('#boxs').mixItUp({
	selectors: {
		target: '.box'
	}
});
setTimeout(function() {
	$('#minis').mixItUp({
		selectors: {
			target: '.mini'
		}
	});
}, 1000);