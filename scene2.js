class scene2 extends Phaser.Scene {
    constructor(){
        super("playGame");
    }

create(){
    this.background = this.add.tileSprite(0,0, config.width, config.height, "background");
    this.background.setOrigin(0,0);

    this.ship = this.add.sprite(config.width/2, config.height/2 + 200, "ship");
    this.ship.play("ship_animation");

    this.cursorKeys = this.input.keyboard.createCursorKeys();
    }

update(){
    this.background.tilePositionY -= 0.5;
}

moveShipManager() {
    this.ship.setVelocity(0);

    if(this.cursorKeys.left.isDown){
        this.ship.setVelocityX(-gameSettings.shipSpeed);
    } else if(this.cursorKeys.right.isDown) {
        this.ship.setVelocityX(gameSettings.shipSpeed);
    }
}
}