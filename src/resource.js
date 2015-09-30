var res = {
    bg_png : "res/bg.png",
    ground_png : "res/ground.png",
    packer_png : "res/flappy_packer.png",
    packer_plist : "res/flappy_packer.plist",
    fly_plist : "res/flappy_frame.plist",
    coin_png : "res/coin.png",
    coin_plist : "res/coin.plist",
    coin_frame_plist : "res/coin_frame.plist",
    holdback1_png : "holdback1.png", 
    holdback2_png : "holdback2.png", 
    bow_png : "res/bow.png", 
    arrow_png : "res/arrow.png"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}