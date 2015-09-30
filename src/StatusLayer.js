var StatusLayer = cc.Layer.extend({
	labelCoin:null,
	labelMeter:null,
	coins:0,

	ctor:function () {
		this._super();
		this.init();
	},

	init:function () {
		this._super();

		var winsize = cc.director.getWinSize();

		this.labelCoin = new cc.LabelTTF("得分:0", "Helvetica", 20);
		this.labelCoin.setPosition(cc.p(70, winsize.height - 20));
		this.addChild(this.labelCoin);

		this.labelMeter = new cc.LabelTTF("0米", "Helvetica", 20);
		this.labelMeter.setPosition(cc.p(winsize.width - 70, winsize.height - 20));
		this.addChild(this.labelMeter);
	},

	addCoin:function (num) {
		this.coins += num;
		this.labelCoin.setString("得分:" + this.coins);
	},

	updateMeter:function (px) {
		this.labelMeter.setString(parseInt(px / 10) + "米");
	}

});
