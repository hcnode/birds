var ArrowScene = BaseScene.extend({
	onEnter : function() {
		this._super();
		var layer = new ArrowLayer(this.space, this);
		this.addChild(layer);
		this.layer = layer;
	},
	getArrowPos : function() {
		return (this.layer && this.layer.arrow && this.layer.arrow.body) ? this.layer.arrow.body.getPos() : null;
	},
	resetPos : function() {
//		this.layer.setPosition(cc.p(0, 0));
		var actionTo = cc.moveTo(1, cc.p(0 , 0));
		var move_ease = actionTo.clone().easing(cc.easeSineInOut());
		var delay = cc.delayTime(2);
		var seq = cc.sequence(delay, move_ease);
		this.layer.runAction(seq);
	},
	update:function (dt) {
		this._super(dt);
		var arrowPos = this.getArrowPos();
		if(arrowPos && this.arrowPos){
			this.layer.setPositionX(-arrowPos.x + 300);
			
		}
		this.arrowPos = arrowPos; 
		
//		if(!this.layerX){
//			this.layerX = this.layer.getPositionX();
//		}
//		
//		var offsetX = this.layer.getPositionX() - this.layerX;
//		if(offsetX !=0){
//			this.ground.setPositionX(this.ground.getPositionX() - offsetX);
//			var groundX = this.ground.getPositionX();
//			var size = this.ground.getContentSize();
//			if(groundX < size.width / 2 - 180){ 
//				this.ground.setPositionX(groundX + 180);
//			}
//			if(groundX > size.width / 2 + 30){
//				this.ground.setPositionX(groundX - 30);
//			}
//		}
//		this.layerX = this.layer.getPositionX();

//		this.changeAngle();
	}
});

var ArrowLayer = BaseLayer.extend({  
	wallTag : 0,
	arrowTag : 1,
	birdTag : 2,
	maxOffsetBow : 250,
	arrows : [],
	birds : [],
	startGame : function() {
		this._super(); 
//		this.addArrow(); 
		this.addBow();
		this.addFlyingBird();
		this.initLayer();
		this.scheduleUpdate();  
		
	},
	initRes : function(){
		this._super();
		cc.animationCache.addAnimations(res.fly_plist);
		cc.spriteFrameCache.addSpriteFrames("res/bow_arrow.plist");
		this.bowArrowSheet = new cc.SpriteBatchNode("res/bow_arrow.png", 1);
		this.addChild(this.bowArrowSheet, 1); 
	},
	initLayer : function() {
		this.scene.wallBottom.setCollisionType(this.wallTag);
		var that = this;
		this.space.addCollisionHandler(this.arrowTag, this.wallTag, function(arbiter, space) { 
			var body = arbiter.getBodies ? arbiter.getBodies()[0] : arbiter.getA().body;

			var shapes = arbiter.getShapes();
			var angle = cp.v.toangle(body.getVel());
			var pos = body.getPos();
			body.getSprite().removeFromParent(); 
			if(body.deadBirdSprite){
				var sprite = body.deadBirdSprite;
				var pos = sprite.getPosition();
				sprite.setPosition(cc.p(pos.x, pos.y -50));
				delete body.deadBirdSprite
			}
			that.arrowFlying = false;
			cc.director.getScheduler().scheduleCallbackForTarget(this, function() {
				that.convertBodyToStatic(body, shapes[0], angle, pos);
				that.scene.resetPos();
			}, 0, 0, 0, false);
		},
		null, null, null);

		this.space.addCollisionHandler(this.arrowTag, this.birdTag, function(arbiter, space) { 
			var body0 = arbiter.getBodies ? arbiter.getBodies()[0] : arbiter.getA().body;
			var body1 = arbiter.getBodies ? arbiter.getBodies()[1] : arbiter.getB().body;

			var shapes = arbiter.getShapes();
//			bodies[0].deadBirdBody = bodies[1];
			var deadBird = that.getBirdByBody(body1);
//			deadBird.sprite.removeFromParent();
			cc.director.getScheduler().scheduleCallbackForTarget(this, function() {
				that.removeBird(deadBird); 
				that.createDeadBird(body0);
			}, 0, 0, 0, false);
		},
		null, null, null);
	},
	convertBodyToStatic : function(body,shape, angle, pos) {
		var pos = body.getPos();
		this.removeArrow(body, shape);
		
		var sprite = new cc.Sprite(res.arrow_png);
		sprite.attr({
			scale : 0.2,
			x : pos.x,
			y : this.scene.ground.getContentSize().height,
			anchorX : 1, anchorY : 1
		});
		sprite.setRotation(360 - (angle / (2*Math.PI/360)));
		
		this.addChild(sprite);
	},
	addFlyingBird : function() {
		var winSize = Util.getWinSize(); 
		var bird = this.addBird(cc.p(-100, winSize.height - 100));
		this.birds.push(bird);
		bird.body.applyForce(cp.v(0, 1300), cp.v(0, 0));
		bird.body.applyImpulse(cp.v(100, 0), cp.v(0, 0));
		var that = this;
		cc.director.getScheduler().scheduleCallbackForTarget(this, function() {
			that.addFlyingBird();
		}, 3, 0, 0, false);
		this.removeBirds();
	},
	addBird : function(pos) {
		var oResult = Util.createPhysicSprite({
			space : this.space,
			res : "#bird1.png", 
			pos : pos
		});
		this.spriteSheet.addChild(oResult.sprite);
		oResult.shape.setCollisionType(this.birdTag);

		var flyAction = this.getAction("fly");
		oResult.sprite.runAction(flyAction);
		return oResult;
	},
	getBirdByBody : function(body) {
		for (var i = this.birds.length - 1; i > -1; i--) {
			if(this.birds[i].body == body){
				return this.birds[i];
			}
		}
	},
	removeBirds : function(){
//		var width = Util.getWinSize().width;
//		for (var i = this.birds.length - 1; i > -1; i--) {
//			if(this.birds[i].body.getPos().x > (width + 100)){
//				this.removeBird(this.birds[i]);
//				this.birds.splice(i, 1);
//				break;
//			}
//		}
	},
	removeBird : function(bird) {
		this.space.removeBody(bird.body);
		this.space.removeShape(bird.shape);
		bird.sprite.removeFromParent(); 
		delete bird.body;
		delete bird.shape;
		delete bird.sprite;
	},
	getAction : function(action) {
		var actionResult = null; 
		if(action == "fly"){
			var actionFrame = cc.Animate.create(cc.animationCache.getAnimation("fly"));
			actionResult = cc.Repeat.create(actionFrame, 90000);
		}
		return actionResult;
	},
	removeArrow : function(body, shape) {
		this.space.removeBody(body);
		this.space.removeShape(shape);

		if(this.arrow && this.arrow.body == body){
			delete this.arrow;
		}
		for (var i = 0; i < this.arrows.length; i++) {
			if(this.arrows[i].body == body){
				delete this.arrows[i].body;
				delete this.arrows[i].shape;
				delete this.arrows[i].sprite;
				this.arrows.splice(i, 1);
				break;
			}
		}
	},
	addBow : function() {
		this.bow = new cc.Sprite(res.bow_png);
		this.bow.setPosition(cc.p(Util.getWinSize().width / 2, 350 - 50));
		this.bow.setRotation(-90);
		this.bow.setScale(0.2);
		this.addChild(this.bow);
		var startP, currentP, vect;
		var that = this;
		var listener = cc.EventListener.create({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,                        
															
			onTouchBegan: function (touch, event) {      
				if(that.arrowFlying) return true;
				var target = event.getCurrentTarget();    
				if(!startP){
					var locationInNode = target.convertToNodeSpace(touch.getLocation());    
					var s = target.getContentSize();
					var rect = cc.rect(0, 0, s.width, s.height);
					if (cc.rectContainsPoint(rect, locationInNode)) {  
						startP = touch.getLocation();
					}
				}
				return true;
			},
			onTouchMoved: function (touch, event) {    
				
				if(startP){
					currentP = touch.getLocation();
					offsetY = startP.y - currentP.y;
//					cc.log(startY + ":"+ currentY); 
					offsetY = Math.min(offsetY, that.maxOffsetBow);
					offsetY = Math.max(offsetY, 0);
					var scaleY = (offsetY) / (that.maxOffsetBow);
					that.bow.setScaleX(0.2 * (scaleY + 1));
					if(offsetY > 20){
						vect = cp.v(currentP.x - startP.x, currentP.y - startP.y);
						var angle = cp.v.toangle(vect);
						var degree = 360 - (angle / (2*Math.PI/360)) - 180;
						degree = Math.max(degree, 270 - 45);
						degree = Math.min(degree, 270 + 45);
						that.bow.setRotation(degree) ;
					}
				}
			},
			onTouchEnded: function (touch, event) {  
				if(vect){
					that.shoot(vect);
					that.bow.setScale(0.2);
					startP = null;
					currentP = null;
					vect = null;
					that.bow.setRotation(-90);
				}
			}
		});
		cc.eventManager.addListener(listener, this.bow);
	},
	shoot : function(vect) {
		this.addArrow(vect);
	},
	addArrow : function(vect) {
		var result = this.addBodyAndShape(this.space, 1, 150, 10);
		result.body.setPos(cc.p(Util.getWinSize().width / 2, 350));
//		result.body.setAngle(-45);
		this.rotate(result.body);
		result.body.applyImpulse(cp.v(-vect.x * 8, -vect.y * 8), cp.v(0, 0));
		result.shape.setCollisionType(this.arrowTag);
		this.body = result.body; 
		
		var sprite = new cc.PhysicsSprite(cc.isHtml5 ? res.arrow_png : "#arrow.png");
		sprite.setScale(0.2);
		sprite.setBody(result.body);
		cc.isHtml5 ? this.addChild(sprite) : this.bowArrowSheet.addChild(sprite);
		var that = this;
		result.body.getSprite = function(){return sprite};
		var arrow = {
				body : result.body,
				shape : result.shape,
				sprite : sprite
		};
		this.arrows.push(arrow);
		this.arrow = arrow;
		this.arrowFlying = true;
	},
	createDeadBird : function(arrowBody){
		var deadBirdSprite = new cc.Sprite("#bird1.png");
		deadBirdSprite.setLocalZOrder(9);
		this.spriteSheet.addChild(deadBirdSprite);
		arrowBody.deadBirdSprite = deadBirdSprite;
	},
	rotate : function(){
		for (var i = 0; i < this.arrows.length; i++) {
			var body = this.arrows[i].body;
			var angle = cp.v.toangle(body.getVel());
			body.setAngle(angle);
			if(body.deadBirdSprite){
				body.deadBirdSprite.setPosition(body.getPos());
				body.deadBirdSprite.setRotation(360 - (angle / (2*Math.PI/360)) + 90);
			}
		}
	},
	update:function (dt) {
		this.space.step(dt);
		this.rotate();
	}
});

