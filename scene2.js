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

movePlayerManager() {
    this.player.setVelocity(0);

    if(this.cursorKeys.left.isDown){
        this.player.setVelocityX(-gameSettings.playerSpeed);
    } else if(this.cursorKeys.right.isDown) {
        this.player.setVelocityX(gameSettings.playerSpeed);
    }
}
}