var BaseScene = cc.Scene.extend({
	space:null,
	ctor : function(gameType) {
		this._super();
	},
	initPhysics:function() {
		this.space = new cp.Space();
		this.space.gravity = cp.v(0, -1300); 
		this.space.iterations = 15;


	},
	onEnter:function () {
		this._super();
		this.initPhysics();


		this.addGround();

		this.scheduleUpdate(); 
	},
	addGround : function(){
		this.ground = new cc.Sprite(res.ground_png);
		this.addChild(this.ground);
		var size = this.ground.getContentSize();
		this.ground.attr({
			x : size.width / 2,
			y : size.height / 2
		});
		var wallBottom = new cp.SegmentShape(this.space.staticBody,
				cp.v(-4294967295, size.height), 
				cp.v(4294967295, size.height),
				0);
		this.space.addStaticShape(wallBottom);  
		this.wallBottom = wallBottom;
//		var wallTop = new cp.SegmentShape(this.space.staticBody,
//				cp.v(0, Util.getWinSize().height), 
//				cp.v(4294967295, Util.getWinSize().height),
//				0);
//		this.space.addStaticShape(wallTop);

	},
	update:function (dt) {
		this.space.step(dt);
	}
});
var BaseLayer = cc.Layer.extend({
	spriteSheet : null,
	space : null,
	scene : null,
	ctor:function (space, scene) { 
		this._super();
		this.space = space;
		this.scene = scene;
		this.init();
	},
	init : function() {
		this._super();
		this.initRes();
		this.addStartLayer();

		this._debugNode = new cc.PhysicsDebugNode(this.space);
		this._debugNode.setVisible(false);
		// Parallax ratio and offset
		this.addChild(this._debugNode, 10);
	}, 
	initRes : function() {
		cc.spriteFrameCache.addSpriteFrames(res.packer_plist);
		this.spriteSheet = new cc.SpriteBatchNode(res.packer_png, 2);
		this.addChild(this.spriteSheet, 2); 
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
					that.startGame();
					cc.eventManager.removeListener(this);
					return true;
				}
		};
		cc.eventManager.addListener(listener, this);

	},
	startGame : function(){
		
	},
	showGameOver:function(call){
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
					call && call();
				}
				return true;
			}
		}, startLayer)
	},
	addStaticBody : function(sprite, x, y, scale) {

		var width = sprite.getContentSize().width;
		var height = sprite.getContentSize().height * scale;
		var body = new cp.Body(Infinity, Infinity);
		body.setPos(cc.p(x + (width/2), y + (height/2)));
		var shape = new cp.BoxShape(body,
				width,
				height);
		shape.setCollisionType(this.hoseTag);


		this.space.addStaticShape(shape);
	},
	addBodyAndShape : function(space, mass, width, height) {
		var body = new cp.Body(mass, 
				cp.momentForBox(mass, width, height) );

		space.addBody( body );

		var shape = new cp.BoxShape( body, width , height );
		shape.setElasticity( 0.5 );
		shape.setFriction( 0.5 );
		space.addShape( shape );
		return {
			body : body,
			shape : shape
		}
	}
});
function getRandom(maxSize)
{
	return Math.floor(Math.random() * maxSize) % maxSize;
}