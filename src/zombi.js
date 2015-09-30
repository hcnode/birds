var ZombiScene = cc.Scene.extend({
	space:null,
	wallTag : 0,
	birdTag : 1,
	zombiTag : 2,
	ctor : function(level) {
		this._super();
		this.level = level || 0;
	},
	initPhysics:function() {
		this.space = new cp.Space();
		this.space.gravity = cp.v(0, 0); 
		this.space.iterations = 15;
		var walls = Util.createBorderWall(this.space.staticBody);
		this.walls = walls;
		for (var i = 0; i < walls.length; i++) {
			walls[i].shape.setCollisionType(this.wallTag);
			this.space.addStaticShape(walls[i].shape);
		}
	},
	onEnter:function () {
		this._super();
		this.initPhysics();

		this.labelStatus = new cc.LabelTTF("", "Helvetica", 30);
		this.labelStatus.setPosition(cc.p(70, Util.getWinSize().height - 20));
		this.labelStatus.attr({
			anchorX : 0,
			anchorY : 1
		});
		this.addChild(this.labelStatus);
		
		this.zombiLayer = new ZombiLayer(this.space, this, this.level);
		this.addChild(this.zombiLayer);
		this.scheduleUpdate(); 
	},
	update:function (dt) {
		this.space.step(dt);
		
	}
});
var ZombiLayer = cc.Layer.extend({
	space : null,
	scene : null,
	birds : [],
	zombies : [],
	zombiCount : 1,
	zombiSpeed : 1,
	zombiMissionCount : 10,
	level : 0,
	score : 0,
	ctor:function (space, scene, level) { 
		this._super();
		this.space = space;
		this.scene = scene;
		this.level = level;
		this.getLevel();
		this.init();
	},
	init : function() {
		this._super();
		this.initRes();
		this.startGame();
		this.space.addCollisionHandler(this.scene.birdTag, this.scene.wallTag,
				null, null, null, this.collisionEnd.bind(this));

		this.space.addCollisionHandler(this.scene.birdTag, this.scene.birdTag,
				null, null, null, this.collisionEnd.bind(this));
		

		this.space.addCollisionHandler(this.scene.zombiTag, this.scene.wallTag,
				null, null, null, this.collisionZombiWallEnd.bind(this));

		this.space.addCollisionHandler(this.scene.zombiTag, this.scene.birdTag,
				null, null, null, this.collisionZombiBirdEnd.bind(this));
		this.scheduleUpdate();
		
		this._debugNode = new cc.PhysicsDebugNode(this.space);
		this._debugNode.setVisible(false);
		// Parallax ratio and offset
		this.addChild(this._debugNode, 10);
	},

	addCoin:function (num) {
		this.score += num;
		this.scene.labelStatus.setString("已消灭僵死鸟"+ this.score +"个，还剩下"+ (this.zombiMissionCount - this.score) +"个");
		if(this.score == this.zombiMissionCount){
			this.showSuccess();
		}
	},
	getLevel : function(){
		var level = this.level;
		if(level == 0){
			this.zombiCount = 1;
			this.zombiSpeed = 1;
			this.zombiMissionCount = 10;
		}else if(level == 1){
			this.zombiCount = 2;
			this.zombiSpeed = 1;
			this.zombiMissionCount = 15;
		}else if(level == 2){
			this.zombiCount = 2;
			this.zombiSpeed = 1;
			this.zombiMissionCount = 20;
		}else{
			this.zombiCount = level;
			this.zombiSpeed = 1 + (level / 10);
			this.zombiMissionCount = 10 + (level * 5);
		}
		this.score = 0;
	},
	collisionEnd : function(arbiter, space) {
		var bodies = arbiter.getBodies ? arbiter.getBodies() : [arbiter.getA().body, arbiter.getB().body];
//		cc.log(bodies.length)
		var birdBody = bodies[0]; 
		this.rotateBird(birdBody, birdBody.getSprite());
		if(bodies[1].getSprite){
			this.rotateBird(bodies[1], bodies[1].getSprite());
		}
	},
	collisionZombiWallEnd : function(arbiter, space) {
		var shapes = arbiter.getShapes();
		var zombiShape = shapes[0]; 
		if((zombiShape.getSensor && zombiShape.getSensor()) ||zombiShape.sensor )
			zombiShape.setSensor(false);
//		cc.log(arbiter.getBodies());
//
//		var body = arbiter.getBodies()[0];
//		this.rotateBird(body, body.getSprite());

	},
	collisionZombiBirdEnd : function(arbiter, space) {
		this.collisionEnd.call(this, arbiter, space);
		var shape = arbiter.getShapes()[1];
		var body = arbiter.getBodies ? arbiter.getBodies()[1] : arbiter.getB().body;
		if(body.getSprite()){
			this.changeToZombi(body, shape);
		}
	},
	changeToZombi : function(body, shape) {
		body.getSprite().attr({
			color : cc.color(0, 255, 0)
		});
		shape.setCollisionType(this.scene.zombiTag);
		for (var i = 0; i < this.birds.length; i++) {
			if(this.birds[i].body == body){
				this.birds.splice(i ,1);
				break;
			}
		}
		if(this.birds.length == 0){

			this.showGameOver();
		}
	},
	showSuccess : function() {
		var winSize = Util.getWinSize(); 
		var success = new cc.LabelTTF("目标已完成，点击继续下一关", "Helvetica", 30);
		success.attr({
			x : winSize.width/2, 
			y : winSize.height/2 + 100
		});
		success.setLocalZOrder(2);
		this.addChild(success);
//		cc.director.pause();

		var startLayer = new cc.Sprite("#start.png");
		startLayer.attr({
			x : winSize.width/2, 
			y : winSize.height/2 - 100
		});
		startLayer.setLocalZOrder(2);
		this.addChild(startLayer);
		var that = this;
		cc.eventManager.addListener({
			event : cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches : true,
			onTouchBegan : function (touch, event) {        //实现 onTouchBegan 事件处理回调函数
				var target = event.getCurrentTarget();    // 获取事件所绑定的 target, 通常是cc.Node及其子类 

				// 获取当前触摸点相对于按钮所在的坐标
				var locationInNode = target.convertToNodeSpace(touch.getLocation());   
				var size = target.getContentSize();
				var rect = cc.rect(0, 0, size.width, size.height);

				if (cc.rectContainsPoint(rect, locationInNode)) {
					that.level ++;
					cc.director.runScene(new ZombiScene(that.level));
				}
				return true;
			}
		}, startLayer);
		for (var i = this.birds.length - 1; i > -1; i--) {
			this.removeTarget(this.birds[i]);
			this.birds.splice(i, 1);
		}
		for (var i = this.zombies.length - 1; i > -1; i--) {
			this.removeTarget(this.zombies[i]);
			this.zombies.splice(i, 1);
		}
	},
	startNextLevel : function(){
		this.level ++ ;
		this.getLevel();
		for (var i = this.birds.length - 1; i > -1; i--) {
			this.removeTarget(this.birds[i]);
			this.birds.splice(i, 1);
		}
		for (var i = this.zombies.length - 1; i > -1; i--) {
			this.removeTarget(this.zombies[i]);
			this.zombies.splice(i, 1);
		}
		this.start();
	},
	startGame : function() {
		this.addBBBirds(); 
		this.addZombis(); 
		this.addCoin(0);
	},
	showGameOver:function(){
		var winSize = Util.getWinSize(); 
		var gameoverLayer = new cc.Sprite("#gameover.png");
		gameoverLayer.attr({
			x : winSize.width/2, 
			y : winSize.height/2 + 100
		});
		gameoverLayer.setLocalZOrder(2);
		this.addChild(gameoverLayer);


		var startLayer = new cc.Sprite("#start.png");
		startLayer.attr({
			x : winSize.width/2, 
			y : winSize.height/2 - 100
		});
		startLayer.setLocalZOrder(2);
		this.addChild(startLayer);
		cc.eventManager.addListener({
			event : cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches : true,
			onTouchBegan : function (touch, event) {        //实现 onTouchBegan 事件处理回调函数
				var target = event.getCurrentTarget();    // 获取事件所绑定的 target, 通常是cc.Node及其子类 

				// 获取当前触摸点相对于按钮所在的坐标
				var locationInNode = target.convertToNodeSpace(touch.getLocation());   
				var size = target.getContentSize();
				var rect = cc.rect(0, 0, size.width, size.height);

				if (cc.rectContainsPoint(rect, locationInNode)) {
					cc.director.runScene(new MenuScene());
				}
				return true;
			}
		}, startLayer)
	},
	rotateBird : function(body, sprite){
		sprite.setRotation(360 - (cp.v.toangle(body.getVel()) / (2*Math.PI/360)));
//		body.setAngVel(cp.v(0, 0)); 
	},
	addBBBirds : function() {
		for (var int = 0; int < 5; int++) {
			this.addBBBird();
		}
	},
	addBBBird : function() {
		winSize = Util.getWinSize();
		var x = getRandom(winSize.width);
		var y = getRandom(winSize.height);
		var bird = this.addBird(cc.p(x, y));
		var vect = cp.v.forangle(getRandom(360)*(2*Math.PI/360)); 
		bird.body.applyImpulse(cp.v(vect.x * 100, vect.y * 100), cp.v(0, 0));
//		bird.body.applyImpulse(cp.v(200, -500), cp.v(0, 0)); 
		bird.shape.setCollisionType(this.scene.birdTag);
		bird.shape.setElasticity( 1 );
		bird.body.getSprite = function(){   
			return bird.sprite;
		}
		
		this.rotateBird(bird.body, bird.sprite);
		this.birds.push(bird);
	},
	addZombis : function() {
		for (var i = 0; i < this.zombiCount; i++) {
			this.addZombi();
		} 
	},
	addZombi : function() {
		winSize = Util.getWinSize();
		var dir = getRandom(4);
		var x, y;
		if(dir == 0){
			x = -50;
			y = getRandom(winSize.height);
		}
		if(dir == 1){
			x = winSize.width + 50;
			y = getRandom(winSize.height);
		}
		if(dir == 2){
			x = getRandom(winSize.width);
			y = winSize.height + 50;
		}
		if(dir == 3){
			x = getRandom(winSize.width);
			y = - 50;
		}
		var bird = this.addBird(cc.p(x, y));
		var vect = cp.v(((winSize.width / 2) - x) / 10 * this.zombiSpeed, ((winSize.height / 2) - y) / 10 * this.zombiSpeed); 
		bird.body.applyImpulse(vect, cp.v(0, 0));
		bird.sprite.attr({
			color : cc.color(0, 255, 0)
		});
		bird.shape.setSensor(true);		
		bird.shape.setCollisionType(this.scene.zombiTag);
		this.zombies.push(bird);
		bird.sprite.isHost = true;
		bird.body.getSprite = function(){   
			return bird.sprite;
		}
		this.rotateBird(bird.body, bird.sprite);

	},
	initRes : function() {
		cc.spriteFrameCache.addSpriteFrames(res.packer_plist);
		this.spriteSheet = new cc.SpriteBatchNode(res.packer_png);
		this.addChild(this.spriteSheet);
		cc.animationCache.addAnimations(res.fly_plist);
	},
	getAction : function(action) {
		var actionResult = null; 
		if(action == "fly"){
			var actionFrame = cc.Animate.create(cc.animationCache.getAnimation("fly"));
			actionResult = cc.Repeat.create(actionFrame, 90000);
		}
		return actionResult;
	},
	addBird : function(pos) {
		var oResult = Util.createPhysicSprite({
			space : this.space,
			res : "#bird1.png", 
			pos : pos,
			isRound : true
		});
		this.spriteSheet.addChild(oResult.sprite);

		var flyAction = this.getAction("fly");
		oResult.sprite.runAction(flyAction);
		var that = this;
		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,                        // 设置是否吞没事件，在 onTouchBegan 方法返回 true 时吞掉事件，不再向下传递。
			onTouchBegan: function (touch, event) {        //实现 onTouchBegan 事件处理回调函数
				if(oResult.shape && oResult.shape.getCollisionType && oResult.shape.getCollisionType() != that.scene.zombiTag) return false; 
				if(oResult.shape && !oResult.shape.getCollisionType && oResult.shape.collision_type != that.scene.zombiTag) return false; 
				var target = event.getCurrentTarget();    // 获取事件所绑定的 target, 通常是cc.Node及其子类 

				// 获取当前触摸点相对于按钮所在的坐标
				var locationInNode = target.convertToNodeSpace(touch.getLocation());    
				var s = target.getContentSize();
				var rect = cc.rect(0, 0, s.width, s.height);

				if (cc.rectContainsPoint(rect, locationInNode)) {        // 判断触摸点是否在按钮范围内
					cc.director.getScheduler().scheduleCallbackForTarget(that, function() {
						that.removeTarget(oResult);
						that.addCoin(1);
						if(target.isHost) that.addZombi();
					}, 0, 0, 0, false);
					return true;
				}
				return false;
			}
		}, oResult.sprite);
		return oResult;
	},
	removeTarget : function(target) {
		if(target.sprite){
//			target.sprite.removeFromParent(); 
			this.removeBodyAndShape(target.body, target.shape);
//			this.space.removeBody(target.body);
//			this.space.removeShape(target.shape);
			var sprite = target.sprite;
			delete target.sprite;
			delete target.body.getSprite;
			delete target.body;
			delete target.shape;
			var action = cc.sequence(cc.spawn(
					cc.scaleTo(1, 5),
					cc.fadeOut(1)),
					cc.callFunc(function(){
						sprite.removeFromParent(); 

					}, this)
			);
			sprite.runAction(action);
		}
	},
	removeBodyAndShape : function(body, shape){
		var has = false;
		this.space.eachBody(function(body){
			if(body == body){
				has = true;
			}
		});
		if(has){
			this.space.removeBody(body);
			this.space.removeShape(shape);
		}
	},
	update:function (dt) {
		this.space.step(dt);

	}
});

function getRandom(maxSize)
{
	return Math.floor(Math.random() * maxSize);
}