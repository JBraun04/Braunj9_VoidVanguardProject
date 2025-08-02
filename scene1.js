class scene1 extends Phaser.Scene {
    constructor(){
        super("bootGame");
    }

    preload() {
        this.load.image("background", "assets/background.png");
        this.load.spritesheet("ship", "assets/ship.png", {
            frameWidth: 45,
            frameHeight: 44
        });
        
        this.load.image("asteroid", "assets/asteroid.png");
        this.load.image("heart", "assets/heart.png");
        this.load.image("beam", "assets/beam.png");
        
        this.load.spritesheet("ufo", "assets/ufo.png", {
            frameWidth: 56.6,
            frameHeight: 40,
            spacing: -.5,
            margin: 1.1
        });
        
        this.load.spritesheet("explosion", "assets/explosion.png", {
            frameWidth: 64,
            frameHeight: 64,
            spacing: 0,
            margin: 0
        });
    }

    create() {
        this.scene.start("playGame");

        this.anims.create({
            key: "ship_animation",
            frames: this.anims.generateFrameNumbers("ship", {start:0, end: 13}),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: "ufo_animation",
            frames: this.anims.generateFrameNumbers("ufo", {start:0, end: 11}),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: "explosion_animation",
            frames: this.anims.generateFrameNumbers("explosion", {start:0, end: 15}),
            frameRate: 20,
            repeat: 0,
            hideOnComplete: true
        });
    }
}
