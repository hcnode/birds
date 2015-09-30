var Coin = cc.Class.extend({
    space:null,
    sprite:null,
    shape:null,

    /** Constructor
     * @param {cc.SpriteBatchNode *}
     * @param {cp.Space *}
     * @param {cc.p}
     */
    ctor:function (spriteSheet, space, pos, birdLayer) {
        this.space = space;
        action = birdLayer.getAction("coin");
        
        
        this.sprite = new cc.PhysicsSprite("#coin0.png");
        // init physics
        var radius = 0.95 * this.sprite.getContentSize().width / 2;
        var body = new cp.Body(Infinity, Infinity);
        body.setPos(pos);
        this.sprite.setBody(body);

        this.shape = new cp.CircleShape(body, radius, cp.vzero);
        this.shape.setCollisionType(birdLayer.coinTag);
        this.shape.coin = this;
        //Sensors only call collision callbacks, and never generate real collisions
        this.shape.setSensor(true);

        this.space.addStaticShape(this.shape);

        // add sprite to sprite sheet
        this.sprite.runAction(action);
        spriteSheet.addChild(this.sprite, 1);
    },

    removeFromParent:function () {
        this.space.removeStaticShape(this.shape);
        this.shape = null;
        this.sprite.removeFromParent();
        this.sprite = null;
    },

    getShape:function () {
        return this.shape;
    }
});