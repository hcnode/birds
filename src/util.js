var Util = {
		getWinSize : function(){
			return cc.director.getWinSize();
		},
		createMenu : function(oLayer, oMenuConf){

			var winsize = Util.getWinSize();
			var fontSize = oMenuConf.fontSize || 60;
			var aMenus = oMenuConf.menus || [];
//			var startY = winsize.height / 2 - (aMenu.length * 30)
			var centerpos = cc.p(winsize.width / 2, winsize.height / 2);

			var menu = new cc.Menu();  
			menu.setPosition(centerpos);
			
			cc.MenuItemFont.setFontSize(fontSize);
			for (var i = 0; i < aMenus.length; i++) {
				var item = aMenus[i];
				var normal = new cc.LabelTTF(item.text, "Helvetica", 80); // normal state image
				var selected = new cc.LabelTTF(item.text, "Helvetica", 80); // normal state image
				selected.setColor(cc.color(0, 100, 100, 100))


				var menuItem= new cc.MenuItemSprite(
						normal, selected,
						item.call, oLayer);
				menu.addChild(menuItem); 
			}
			menu.alignItemsVertically();
			return menu;
		},
		createBorderWall : function(space) {
			var winSize = this.getWinSize();
			var width = winSize.width;
			var height = winSize.height;
			var wallBottom = this.addStaticBody(cc.p(width / 2, 0), width, 1);
			wallBottom.shape.setElasticity(1);
			

			var wallTop = this.addStaticBody(cc.p(width / 2, height), width, 1);
			wallTop.shape.setElasticity(1);
			

			var wallLeft = this.addStaticBody(cc.p(0, height / 2), 1, height);
			wallLeft.shape.setElasticity(1);
			
			var wallRight = this.addStaticBody(cc.p(width, height / 2), 1, height);
			wallRight.shape.setElasticity(1);
			
			return [wallBottom, wallTop, wallLeft, wallRight];
		},
		addStaticBody : function(pos, width, height) {

			var body = new cp.Body(Infinity, Infinity);
			body.setPos(pos);
			var shape = new cp.BoxShape(body,
					width,
					height);
//			space.addStaticShape(shape);
			return {
				shape : shape,
				body : body
			}
		},
		
		createAction : function(layer, name, count) {
			
			var animFrames = [];
			// num equal to spriteSheet
			for (var i = 0; i < count; i++) {
				var str = name + i + ".png";
				var frame = cc.spriteFrameCache.getSpriteFrame(str);
				animFrames.push(frame);
			}

			var animation = new cc.Animation(animFrames, 0.1);
			var action = new cc.RepeatForever(new cc.Animate(animation));
			action.retain();
			return action;
		},
		createSheet : function(name) {
			cc.spriteFrameCache.addSpriteFrames(res[name + "_plist"]);
			var spriteSheet = new cc.SpriteBatchNode(res[name + "_png"]);
			return spriteSheet;
		},
//		createBodyAndShape : function(space, contentSize) {
//			var body = new cp.Body(1, cp.momentForBox(1, contentSize.width, contentSize.height));
//			space.addBody(body);
//			//init shape
//			var shape = new cp.BoxShape(body, contentSize.width - 14, contentSize.height);
//			space.addShape(shape);
//			return {
//				body : body,
//				shape : shape
//			}
//		},
		createSprite : function( space, _res, pos, isRound, mass, shapeDecrease) {

			var sprite = new cc.PhysicsSprite(_res);
			var contentSize = sprite.getContentSize();
			mass = mass || 1;
			var body = new cp.Body(mass, !isRound ? 
						cp.momentForBox(mass, contentSize.width, contentSize.height)  : 
							cp.momentForCircle(mass, 0, contentSize.height, cp.v(0, 0)));

//			var body = new cp.Body(1, cp.momentForBox(1, contentSize.width, contentSize.height) );
			shapeDecrease = shapeDecrease || 0;
			body.setPos( pos );
			space.addBody( body );
			
			var shape = !isRound ? new cp.BoxShape( body, contentSize.width - shapeDecrease
					, contentSize.height - shapeDecrease)
						: new cp.CircleShape(body, contentSize.width/2, cp.v(0, 0));
			shape.setElasticity( 0.5 );
			shape.setFriction( 0.5 );
			space.addShape( shape );

			sprite.setBody( body );
			return [sprite, body, shape];
		},
		createPhysicSprite : function( oParam) {
			var space = oParam.space;
			var res = oParam.res;
			var pos = oParam.pos || cp.v(0, 0);
			var isRound = oParam.isRound || false;
			var mass = oParam.mass || 1;
			var shapeDecrease = oParam.shapeDecrease || 0;
			var oResult = this.createSprite( space, res, pos, isRound, mass, shapeDecrease);
			return {
				sprite : oResult[0],
				body : oResult[1],
				shape : oResult[2]
			}
		}
}