var BirdLayer = cc.Layer.extend({
	sprite:null,
	spriteSheet : null,
	body : null,
	bird : null,
	hoseNum : 0,
	hoseDistance : 1000,
	hoseTag : 1,
	birdTag : 2,
	coinTag : 3,
	scene : null,
	coins : [],
	ctor:function (space, scene) { 
		this._super();
		this.space = space;
		this.scene = scene;
		if(this.scene.gameType == 0){
			this.hoseDistance = 400;
		}
		this.init();
	},
	init : function() {
		this._super();
		this.initRes();
		this.addStartLayer();
//		this.addCoins();
		this.listenCollision();

		this._debugNode = new cc.PhysicsDebugNode(this.space);
		this._debugNode.setVisible(false);
		// Parallax ratio and offset
		this.addChild(this._debugNode, 10);
	},
	addCoins : function(colCount, rowCount) {
		var totalHeight = Util.getWinSize().height - 278 - 20;
		colCount = colCount || (getRandom(6) + 1);
		rowCount = rowCount || (getRandom(6) + 1);
		var startX = this.hoseDistance + this.scene.birdPosX + getRandom(this.hoseDistance - (36 * colCount) - 150) + 150;
		var startY = 278 + getRandom(totalHeight - (36*rowCount));
		for(var i=0;i<rowCount;i++){
			for(var j=0;j<colCount;j++){
				this.addCoin(cc.p(startX + (36 * j), startY + (36 * i)));
			}
		}
	},
	addCoin : function(pos) {
		var coin = new Coin(this.coinSheet, this.space, pos, this);
		this.coins.push(coin);
	},
	addStartLayer : function() {
		var that = this;
		var winSize = Util.getWinSize(); 
		var startLayer = new cc.Sprite("#click.png");
		startLayer.attr({
			x : winSize.width/2, 
			y : winSize.height/2
		});
		this.addChild(startLayer);
		var listener = {
				event: cc.EventListener.TOUCH_ONE_BY_ONE,
				swallowTouches: true,
				onTouchBegan : function(){
					startLayer.removeFromParent(); 
					that.addBird();
					that.jump();
					cc.eventManager.removeListener(this);
					return true;
				}
		};
		cc.eventManager.addListener(listener, this);
		 
	},
	addBird : function() {
		var winSize = Util.getWinSize(); 
//		var o = Util.createSprite(this.space, "#bird1.png", cc.p(winSize.width/2, winSize.height/2));
		var oResult = Util.createPhysicSprite({
			space : this.space,
			res : "#bird1.png", 
			pos : cc.p(winSize.width/2, winSize.height/2),
			shapeDecrease : 12
		});
		this.bird = oResult.sprite;
		this.body = oResult.body;
		this.shape = oResult.shape;
		this.spriteSheet.addChild(this.bird);
		this.setOnTouchListener(); 
		this.shape.setCollisionType(this.birdTag);

		var flyAction = this.getAction("fly");
		this.bird.runAction(flyAction);
		this.status = "started";
		this.body.applyImpulse(cp.v(300, 0), cp.v(0, 0));
	},
	initRes : function() {
		cc.spriteFrameCache.addSpriteFrames(res.packer_plist);
		this.spriteSheet = new cc.SpriteBatchNode(res.packer_png);
		this.addChild(this.spriteSheet);
		cc.animationCache.addAnimations(res.fly_plist);
		

		cc.spriteFrameCache.addSpriteFrames(res.coin_plist);
		this.coinSheet = new cc.SpriteBatchNode(res.coin_png);
		this.addChild(this.coinSheet);
		cc.animationCache.addAnimations(res.coin_frame_plist); 
	},
	getAction : function(action) {
		var actionResult = null; 
		if(action == "jump"){
			actionResult = cc.Spawn.create(
					cc.Sequence.create(cc.RotateTo.create(0, -30), cc.DelayTime.create(0.5), cc.RotateTo.create(0, 0)),
					this.getAction("fly"))
		}
		if(action == "fly"){
			var actionFrame = cc.Animate.create(cc.animationCache.getAnimation("fly"));
			actionResult = cc.Repeat.create(actionFrame, 90000);
		}
		if(action == "coin"){
			var actionFrame = cc.Animate.create(cc.animationCache.getAnimation("coin"));
			actionResult = cc.Repeat.create(actionFrame, 90000);
		}
		return actionResult;
	},
	setOnTouchListener : function() {
		var that = this;
		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			onTouchBegan : function(){
				that.jump();
				return true;
			}
		}, this)
	},
	jump : function() {
		this.body.applyImpulse(cp.v(0, -this.body.getVel().y + 400), cp.v(0, 0));
		this.bird.stopAllActions();
		this.bird.runAction(this.getAction("jump"));
	},
	addHose : function() {
		var totalHeight = Util.getWinSize().height - 278
		var hoseHeight = 830;
		var acrossHeight = 200;
		var downHeight = 100 + getRandom(300);
		var upHeight = totalHeight - downHeight - acrossHeight + 10;

		this.hoseNum ++;
//		var hoseX = this.hoseOffset * this.hoseNum + 500;
		var hoseX = this.scene.birdPosX + this.hoseDistance;
		if(this.scene.gameType == 0) hoseX += 400;
//		var ccSpriteDown = cc.Sprite.createWithSpriteFrameName(res.holdback1_png); 
		var ccSpriteDown = new cc.Sprite("#holdback1.png");
		ccSpriteDown.setLocalZOrder(1);
		var scaleDown = downHeight / hoseHeight;
		ccSpriteDown.setScaleY(scaleDown);
		ccSpriteDown.setAnchorPoint(cc.p(0, 0));
		ccSpriteDown.setPosition(cc.p(hoseX, 0+ 278));
		
		this.addStaticBody(ccSpriteDown, hoseX, 0+ 278, scaleDown);

//		var ccSpriteUp = cc.Sprite.createWithSpriteFrameName(res.holdback2_png);
		var ccSpriteUp = new cc.Sprite("#holdback2.png");

		ccSpriteUp.setLocalZOrder(1);
		var scaleUp = upHeight / hoseHeight;
		ccSpriteUp.setScaleY(scaleUp);
		ccSpriteUp.setAnchorPoint(cc.p(0, 0));
		ccSpriteUp.setPosition(cc.p(hoseX, downHeight + acrossHeight + 282));

		this.addStaticBody(ccSpriteUp, hoseX, downHeight + acrossHeight + 282, scaleUp);
		
		this.lastHoseX = hoseX; 
		this.lastUpHose = ccSpriteUp;
		this.addChild(ccSpriteDown);
		this.addChild(ccSpriteUp);
	},
	listenCollision : function(){
		this.space.addCollisionHandler(this.birdTag, this.hoseTag,
				this.collisionHoseBegin.bind(this), null, null, null);

		this.space.addCollisionHandler(this.birdTag, this.coinTag,
				this.collisionCoinBegin.bind(this), null, null, null);
	},
	collisionHoseBegin:function (arbiter, space) { 
		var shapes = arbiter.getShapes();
		
		var that = this;
		cc.director.getScheduler().scheduleCallbackForTarget(this, function() {
			this.showGameOver();
			that.bird.removeFromParent(); 
			that.space.removeBody(that.body);
			that.space.removeShape(that.shape);
//			cc.director.pause();
		}, 0, 0, 0, false);

//		cc.director.pause();	
	},
	collisionCoinBegin:function (arbiter, space) { 
		var shapes = arbiter.getShapes();
		var theCoin = shapes[1].coin;
//		var theCoin;
//		for(var i=0;i<this.coins.length;i++){
//			if(this.coins[i].getShape() == shapes[1]){
//				theCoin = this.coins[i];
//				this.coins.splice(i, 1);
//				this.scene.statusLayer.addCoin(1);
//				break;
//			}
//		}
		if(theCoin){
			this.scene.statusLayer.addCoin(1);
			cc.director.getScheduler().scheduleCallbackForTarget(this, function() {
				theCoin.removeFromParent();

				delete shapes[1].coin;
			}, 0, 0, 0, false);
		}
	},
	showGameOver:function(){
		var winSize = Util.getWinSize(); 
		var gameoverLayer = new cc.Sprite("#gameover.png");
		gameoverLayer.attr({
			x : winSize.width/2  + this.scene.birdPosX, 
			y : winSize.height/2 + 100
		});
		gameoverLayer.setLocalZOrder(2);
		this.addChild(gameoverLayer);
		

		var startLayer = new cc.Sprite("#start.png");
		startLayer.attr({
			x : winSize.width/2  + this.scene.birdPosX, 
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
		this.status = "gameover";
	},
	addStaticBody : function(sprite, x, y, scale) {
//		var segment = new cp.SegmentShape(this.space.staticBody,
//				vStart,
//				vEnd,
//				width);
//		this.space.addStaticShape(segment);

		var width = sprite.getContentSize().width;
		var height = sprite.getContentSize().height * scale;
		var body = new cp.Body(Infinity, Infinity);
		body.setPos(cc.p(x + (width/2), y + (height/2)));
//		sprite.setBody(body);
		var shape = new cp.BoxShape(body,
				width,
				height);
		shape.setCollisionType(this.hoseTag);
		
		
		this.space.addStaticShape(shape);
	}
});
function getRandom(maxSize)
{
	return Math.floor(Math.random() * maxSize) % maxSize;
}