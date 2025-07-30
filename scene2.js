class scene2 extends Phaser.Scene {
    constructor(){
        super("playGame");
    }

create(){
    this.background = this.add.tileSprite(0,0, config.width, config.height, "background");
    this.background.setOrigin(0,0);

    this.ship = this.add.sprite(config.width/2, config.height/2 + 200, "ship");
    this.ship.play("ship_animation");
    }

update(){
    this.background.tilePositionY -= 0.5;
}
}