$(function() {
	$("<button id='start'>start</button>").appendTo('body');
	$("<button id='stop'>stop</button>").appendTo('body');
	$("<button id='restart'>restart</button>").appendTo('body');
	$("<br/>").appendTo('body');
	$("<canvas id='myCanvas' width='600' height='400'></canvas>").appendTo(
			'body');

	$("#start").bind("click", function() {
		SnakeGame.start();
	});
	$("#stop").bind("click", function() {
		SnakeGame.stop();
	});

	$("#restart").bind("click", function() {
		SnakeGame.restart();
	});

	$("*").bind(
			"keydown",
			function(evn) {
				// console.log("which--------->", evn.which);
				if (evn.which > 36 && evn.which < 41
						&& Math.abs(Snake.direction - evn.which) != 2) {
					Snake.direction = evn.which;
				}
				if (evn.which == 32) {
					SnakeGame.stop();
				}
			});
});
var Constant = {
	UNIT_LEN : 20,// 单位长度
	HEAD_COLOR : 'red',
	EYE_COLOR : 'white',
	BODY_COLOR : 'orange',
	TAIL_COLOR : 'pink',
	FOOD_COLOR : 'blank',
	/**
	 * 返回符合区间范围的数组
	 * 
	 * @param min
	 *            {Number} 数组最小值
	 * @param max
	 *            {Number} 数组最大值
	 * @param factor
	 *            {Number} 数组除数因子
	 * @returns {Array} [min,max)
	 */
	CreateArray : function(min, max, factor) {
		var _array_ = [];
		for ( var n = min; n < max; n++) {
			if (n % factor == 0) {
				_array_.push(n);
			}
		}
		// console.log("CreateArray: ",_array_);
		return _array_;
	},
	/**
	 * 目标数组是否存在于数组集合中
	 * 
	 * @param aTarget
	 *            目标数组
	 * @param arraySet
	 *            数组集合
	 * @returns {Boolean} 存在返回true,否则返回false
	 */
	TargerArrayIsInArraySet : function(aTarget, arraySet) {
		// console.log("-->",aTarget,arraySet);
		var _iLen_ = arraySet.length;
		var _tar_ = aTarget.join("");
		var _sameItem_ = false;
		for ( var i = 0; i < _iLen_; i++) {
			if (_tar_ == arraySet[i].join("")) {
				_sameItem_ = true;
				break;
			}
		}
		return _sameItem_;
	}
};

// 游戏常量
var SnakeGameConstant = {
	INIT : 'init',
	START : 'start',
	STOP : 'stop',
	GAMEOVER : 'game over',
	SPEDDUP : 'speed up'
};

var SnakeGame = {
	speed : 1000,// 游戏速度
	score : 0, // 分数
	status : null,// 游戏状态
	ctx : null,// 画布
	canvas_width : 0,// 画布宽[x轴]
	canvas_height : 0,// 画布高[y轴]
	timeclock : null,// 动画时钟
	snake : null,
	food : null,
	/**
	 * 构造SnakeGame对象。
	 * 
	 * @param canvasId
	 *            {String} <canvas/>元素ID
	 * @param speed
	 *            {Number} 游戏速度。默认1000
	 * @param score
	 *            {Number} 游戏得分。默认0
	 * @returns {Object} SnakeGame对象
	 */
	init : function(canvasId, speed, score) {
		var _canvas_ = document.getElementById(canvasId);
		this.ctx = _canvas_.getContext('2d');
		this.canvas_width = _canvas_.attributes['width'].value; // 获取画布宽 x 轴
		this.canvas_height = _canvas_.attributes['height'].value; // 获取画布高 y 轴
		this.snake = Snake.randomInit(this.canvas_width, this.canvas_height);
		this.food = Food.randomInit(this.canvas_width, this.canvas_height);
		this.speed = speed;
		this.score = score;
		this.status = SnakeGameConstant.INIT;
		this.frameSubtitle("Welcome Play Snake!");
		return this;
	},
	destroy : function() {
		this.speed = 1000;
		this.score = 0;
		this.status = null;
		if (this.timeclock) {
			clearTimeout(this.timeclock);
			this.timeclock = null;
		}
		this.snake.randomInit(this.canvas_width, this.canvas_height);
		this.food.randomInit(this.canvas_width, this.canvas_height);
	},
	/**
	 * 渲染SnakeGame
	 */
	renderCanvas : function() {
		this.ctx.globalAlpha = 1;// 透明度
		this.ctx.save();
		this.ctx.clearRect(0, 0, this.canvas_width, this.canvas_height);
		this.snake.render(this.ctx);
		this.food.render(this.ctx);
		this.ctx.restore();
	},
	/**
	 * 游戏结束判定
	 */
	gameover : function() {
		var _edge_ = this.snake.head[0] >= 0
				&& this.snake.head[0] < this.canvas_width
				&& this.snake.head[1] >= 0
				&& this.snake.head[1] < this.canvas_height;
		this.snake.body.push(this.snake.tail);
		var _sameItem_ = Constant.TargerArrayIsInArraySet(this.snake.head,
				this.snake.body);
		this.snake.body.pop();
		if (!_edge_ || _sameItem_) {
			this.status = SnakeGameConstant.GAMEOVER;
		}
	},
	/**
	 * 清理<canvas/>上渲染的图像
	 */
	cleanCanvas : function() {
		this.ctx.clearRect(0, 0, this.canvas_width, this.canvas_height);
	},
	maskLayer : function() {
		this.ctx.save();
		this.ctx.fillStyle = 'rgba(25,25,25,0.7)';
		this.ctx.fillRect(0, 0, this.canvas_width, this.canvas_height);
		this.ctx.restore();
	},
	/**
	 * 帧字幕
	 * @param text {string} 要显示的字符
	 */
	frameSubtitle : function(text) {
		this.maskLayer();
		this.ctx.save();
		this.ctx.shadowOffsetX = 7;
		this.ctx.shadowOffsetY = -1;
		this.ctx.shadowBlur = 1;// 阴影模糊程度
		this.ctx.shadowColor = "rgba(0, 0, 0, 1)";
		this.ctx.font = "40pt Times New Roman";
		this.ctx.fillStyle = 'rgb(255,255,255)';
		this.ctx.fillText(text, this.canvas_width / 2 - 10 * text.length,
				this.canvas_height / 2);
		this.ctx.restore();
	},

	/**
	 * 动画帧
	 */
	frame : function() {
		this.renderCanvas();
		var iFood = this.snake.moveAndEat(this.food, this.canvas_width,
				this.canvas_height);
		this.scoreAndSpeed(iFood);
		this.gameover();
		if (this.status == SnakeGameConstant.GAMEOVER) {
			this.frameSubtitle("G A M E   O V E R !");
			this.destroy();
			return;
		}
		this.renderCanvas();

		if (this.status == SnakeGameConstant.INIT
				| this.status == SnakeGameConstant.STOP) {
			this.status = SnakeGameConstant.START;
			this.timeclock = setInterval("SnakeGame.frame('myCanvas')",
					this.speed);
			// console.log("start up ");
		}
		if (this.status == SnakeGameConstant.SPEDDUP) {
			clearTimeout(this.timeclock);
			this.status = SnakeGameConstant.START;
			this.timeclock = setInterval("SnakeGame.frame('myCanvas')",
					this.speed);
			// console.log("speed up ");
		}

	},
	/**
	 * 游戏分数及游戏速度
	 * 
	 * @param iFood
	 */
	scoreAndSpeed : function(iFood) {
		if (iFood != 0) {
			this.score = this.score + iFood * 100;
			if (this.score % 500 == 0) {
				this.speed = this.speed - 100;
				this.status = SnakeGameConstant.SPEDDUP;
			}
			console.log("speed -->" + this.speed, "  score--->" + this.score);
		}
	},
	/**
	 * 游戏开始事件
	 */
	start : function() {
		console.log("snakegame status --> ", this.status);
		if (!this.status) {
			this.init('myCanvas', this.speed, 0).frame();
		}
		if (this.status == SnakeGameConstant.STOP) {
			this.frame();
		}
	},

	/**
	 * 游戏暂停事件
	 */
	stop : function() {
		if (this.status != SnakeGameConstant.STOP) {
			this.maskLayer();
			clearTimeout(this.timeclock);
			this.status = SnakeGameConstant.STOP;
		}
	},
	/**
	 * 重新开始游戏事件
	 */
	restart : function() {
		this.destroy();
		this.status = SnakeGameConstant.INIT;
		this.frame();
	}
};

// 定义snake
var Snake = {
	head : [ 80, 20 ], // 头
	tail : [ 20, 20 ],// 尾
	body : [ [ 40, 20 ], [ 60, 20 ] ],// 身体
	direction : 39,// 方向
	/**
	 * 构造Snake对象。
	 * 
	 * @param head
	 *            {Array} Snake head's Coordinates
	 * @param tail
	 *            {Array} Snake tail's Coordinates
	 * @param body {
	 *            Array<Array> } Snake body's Coordinates Sequences
	 * @param direction
	 *            {Number} Snake的运动方向[37:left,38:up,39:right,40:down]
	 */
	init : function(head, tail, body, direction) {
		this.head = head;
		this.tail = tail;
		this.body = body;
		this.direction = direction;
	},
	destroy : function() {
		this.head = null;
		this.tail = null;
		this.body = null;
		this.direction = null;
		return null;
	},
	randomInit : function(offsetX, offsetY) {
		var _aX_ = Constant.CreateArray(0, offsetX, Constant.UNIT_LEN);
		var _aY_ = Constant.CreateArray(0, offsetY, Constant.UNIT_LEN);

		this.head = [ _aX_[5], _aY_[6] ];
		this.body = [ [ _aX_[3], _aY_[6] ], [ _aX_[4], _aY_[6] ] ];
		this.tail = [ _aX_[2], _aY_[6] ];
		this.direction = 39;
		return this;
	},
	/**
	 * 移动snake.如果有Food进行'eat'操作并生成新的Food,否则只进行移动
	 * 
	 * @param food
	 *            {Object} Food对象
	 * @param offsetX
	 *            {Number} Food所在坐标点X轴
	 * @param offsetY
	 *            {Number} Food所在坐标点Y轴
	 * @returns {Number} 吃的Food个数.默认0
	 */
	moveAndEat : function(food, offsetX, offsetY) {
		var _foods_ = 0;
		var _head = this.head;
		switch (this.direction) {
		case 37: // left
			this.head = [ _head[0] - Constant.UNIT_LEN, _head[1] ];
			break;
		case 39:// right
			this.head = [ _head[0] + Constant.UNIT_LEN, _head[1] ];
			break;
		case 38:// up
			this.head = [ _head[0], _head[1] - Constant.UNIT_LEN ];
			break;
		case 40:// down
			this.head = [ _head[0], _head[1] + Constant.UNIT_LEN ];
			break;
		}
		this.body.push(_head);
		if (food && _head[0] == food.X && _head[1] == food.Y) {
			_foods_ = 1;
			// console.log("snake body ", this.head, this.body, this.tail);
			var _tmp_ = [].concat(this.body);
			_tmp_.push(this.head);
			_tmp_.push(this.tail);
			// console.log("snake body tmp ", _tmp_);
			var k = 0;
			do {
				food.randomInit(offsetX, offsetY);
				k++;
				console.log("随机food位置与snake冲突", food, "随机次数", k);
			} while (Constant
					.TargerArrayIsInArraySet([ food.X, food.Y ], _tmp_));
			k = 0;
		} else {
			this.tail = this.body.shift();
		}
		// console.log("snake body ", this.head, this.body, this.tail);
		return _foods_;
	},
	render : function(ctx) {
		// 绘制头
		ctx.save();
		ctx.translate(this.head[0] + Constant.UNIT_LEN / 2, this.head[1]
				+ Constant.UNIT_LEN / 2); // 移动坐标。X\Y各偏移Snake.head[0]+10
		if (this.direction == 40) {
			ctx.rotate(Math.PI / 2); // 顺时针旋转坐标系90°
		}
		if (this.direction == 38) {
			ctx.rotate(-Math.PI / 2);// 逆时针旋转坐标系90°
		}
		if (this.direction == 37) {
			ctx.scale(-1, 1); // 对折X轴
		}
		ctx.fillStyle = Constant.HEAD_COLOR;
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.arc(0, 0, Constant.UNIT_LEN / 2, Math.PI / 6, 11 * Math.PI / 6,
				false);
		ctx.fill();
		ctx.closePath();
		// 绘制眼睛
		ctx.fillStyle = Constant.EYE_COLOR;
		ctx.beginPath();
		ctx.moveTo(0, -Constant.UNIT_LEN / 2 / 2);
		ctx.arc(0, -Constant.UNIT_LEN / 2 / 2, Constant.UNIT_LEN / 10, 0,
				2 * Math.PI, false);
		ctx.fill();
		ctx.closePath();

		ctx.restore();

		// 绘制身体
		ctx.save();
		ctx.fillStyle = Constant.BODY_COLOR;
		var iLen = this.body.length;
		for ( var i = 0; i < iLen; i++) {
			ctx.beginPath();
			ctx.moveTo(this.body[i][0] + Constant.UNIT_LEN / 2, this.body[i][1]
					+ Constant.UNIT_LEN / 2);
			ctx.arc(this.body[i][0] + Constant.UNIT_LEN / 2, this.body[i][1]
					+ Constant.UNIT_LEN / 2, 4 * Constant.UNIT_LEN / 2 / 5, 0,
					2 * Math.PI, false);
			ctx.fill();
			ctx.closePath();
		}
		// 绘制尾巴
		ctx.fillStyle = Constant.TAIL_COLOR;
		ctx.beginPath();
		ctx.moveTo(this.tail[0] + Constant.UNIT_LEN / 2, this.tail[1]
				+ Constant.UNIT_LEN / 2);
		ctx.arc(this.tail[0] + Constant.UNIT_LEN / 2, this.tail[1]
				+ Constant.UNIT_LEN / 2, 3 * Constant.UNIT_LEN / 2 / 5, 0,
				2 * Math.PI, false);
		ctx.fill();
		ctx.closePath();
		ctx.restore();
	}
};
var Food = {
	X : 0,
	Y : 0,
	init : function(x, y) {
		this.X = x;
		this.Y = y;
	},
	destroy : function() {
		this.X = null;
		this.Y = null;
		return null;
	},
	randomInit : function(offsetX, offsetY) {
		var _aX_ = Constant.CreateArray(0, offsetX, Constant.UNIT_LEN);
		var _aY_ = Constant.CreateArray(0, offsetY, Constant.UNIT_LEN);
		var _rXo_ = Math.floor(Math.random() * _aX_.length);
		var _rYo_ = Math.floor(Math.random() * _aY_.length);

		this.X = _aX_[_rXo_];
		this.Y = _aY_[_rYo_];

		// console.log("food 位置", this.X, this.Y);
		return this;
	},
	render : function(ctx) {
		ctx.save();
		// 绘制食物
		ctx.fillStyle = Constant.FOOD_COLOR;
		ctx.beginPath();
		ctx.arc(Food.X + Constant.UNIT_LEN / 2, Food.Y + Constant.UNIT_LEN / 2,
				3 * Constant.UNIT_LEN / 2 / 4, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}
};
