var config = {
    width: 500,
    height: 600, 
    backgroundColor: 0x000000,
    scene: [scene1, scene2],
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade:{
            debug: false
        }
    }
}

window.onload = function() {
    var game = new Phaser.Game(config);
}
