class scene1 extends Phaser.Scene {
    constructor(){
        super("bootGame");
    }

preload() {
        this.load.image("background", "assets/background.png");

        this.load.image("asteroid", "assets/asteroid.png");

        this.load.spritesheet("ship", "assets/ship.png", {
            frameWidth: 45,
            frameHeight: 44
        });
    }

create() {
    this.scene.start("playGame");

    this.anims.create({
    key: "ship_animation",
    frames: this.anims.generateFrameNumbers("ship", {start:0, end: 13}),
    frameRate: 20,
    repeat: -1
    })
}
}