

var MenuLayer = cc.Layer.extend({
	ctor : function(){
		//1. call super class's ctor function
		this._super();
	},
	init:function(){
		var that = this;
		this._super();
		var menu = Util.createMenu(this, {
			menus : [
			         {
			        	 text : "普通模式",
			        	 call : function() {
			        		 that.onPlay(0);
			        	 }
			         },{
			        	 text : "jb模式",
			        	 call : function() {
			        		 that.onPlay(1);
			        	 }
			         },{
			        	 text : "僵尸鸟",
			        	 call : function() {
			        		 that.onPlay(3);
			        	 } 
			         },{
			        	 text : "射鸟",
			        	 call : function() {
			        		 that.onPlay(4);
			        	 }
			         }
			         ]
		});
		
		this.addChild(menu); 
	},

	onPlay : function(gameType){
		if(gameType == 3){
			cc.director.runScene(new ZombiScene());
		}else if(gameType == 4){
			cc.director.runScene(new ArrowScene());

		}else{
			cc.director.runScene(new GameScene(gameType));
		}
	}
});
var MenuScene = cc.Scene.extend({
	onEnter:function () {
		this._super();
		var layer = new MenuLayer();

		layer.init();
		this.addChild(layer);
	}
});
/**
 * 普通模式
 */
var GameScene = cc.Scene.extend({
	space:null,
	gameType : null,
	ctor : function(gameType) {
		this._super();
		this.gameType = gameType;
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
        this.birdLayer = new BirdLayer(this.space, this);
        this.addChild(this.birdLayer);
        
        this.statusLayer = new StatusLayer();
        this.addChild(this.statusLayer);

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
    			cp.v(0, size.height), 
    			cp.v(4294967295, size.height),
    			0);
    	this.space.addStaticShape(wallBottom);

    	var wallTop = new cp.SegmentShape(this.space.staticBody,
    			cp.v(0, Util.getWinSize().height), 
    			cp.v(4294967295, Util.getWinSize().height),
    			0);
    	this.space.addStaticShape(wallTop);

    },
    getBirdPos : function() {
    	return this.birdLayer.bird.getPositionX() - 200;
	},
    update:function (dt) {

    	this.space.step(dt);
    	if(this.birdLayer.status == "started"){
    		if(this.birdPosX){
    			var offset = this.getBirdPos() - this.birdPosX;
    			this.ground.setPositionX(this.ground.getPositionX() - offset);
    			var groundX = this.ground.getPositionX();
    			var size = this.ground.getContentSize();
    			if(groundX < size.width / 2 - 180){
    				this.ground.setPositionX(groundX + 180);
    			}
    		}
    		this.birdPosX = this.getBirdPos();
    		this.birdLayer.setPosition(cc.p(-this.birdPosX, this.birdLayer.getPositionY()));
    		if((this.lastHoseX && this.birdPosX - this.lastHoseX > this.birdLayer.hoseDistance) 
    				|| !this.lastHoseX){
    			this.birdLayer.addHose();
    			
    			this.gameType == 1 && this.birdLayer.addCoins();
    			this.lastHoseX = this.birdPosX;
    		}
    		this.statusLayer.updateMeter(this.birdPosX);
    	}
    }
});

