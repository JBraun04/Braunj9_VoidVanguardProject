class scene1 extends Phaser.Scene {
    constructor(){
        super("bootGame");
    }

preload() {
        this.load.image("background", "assets/background.png");
    }

create() {
    this.scene.start("playGame");
}
}