class scene2 extends Phaser.Scene {
    constructor(){
        super("playGame");
    }

create(){
    this.background = this.add.tileSprite(0,0, config.width, config.height, "background");
    this.background.setOrigin(0,0);

    this.ship = this.physics.add.sprite(config.width/2, config.height/2 + 200, "ship");
    this.ship.play("ship_animation");

    this.asteroidSmall = this.physics.add.image(100, 100, "asteroid").setScale(.2);
    this.asteroidMedium = this.physics.add.image(250, 100, "asteroid").setScale(.4);
    this.asteroidLarge = this.physics.add.image(420, 100, "asteroid").setScale(.75);
    
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    }

update(){
    this.background.tilePositionY -= 0.5;
    this.moveShipManager();

    this.moveAsteroid(this.asteroidSmall, 3.9);
    this.moveAsteroid(this.asteroidMedium, 2.7);
    this.moveAsteroid(this.asteroidLarge, 1.9);
}

moveAsteroid(asteroid, speed) {
    asteroid.y += speed;
    if (asteroid.y > config.height) {
        this.resetAsteroidPos(asteroid);
    }
}

resetAsteroidPos(asteroid) {
    asteroid.y = 0;
    var randomX = Phaser.Math.Between(0, config.width);
    asteroid.x = randomX;
}

moveShipManager() {
    this.ship.setVelocityX(0);

    if(this.cursorKeys.left.isDown){
        this.ship.setVelocityX(-310);
    } else if(this.cursorKeys.right.isDown) {
        this.ship.setVelocityX(310);
    }
}
}