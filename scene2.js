class scene2 extends Phaser.Scene {
    constructor(){
        super("playGame");
        this.score = 0;
        this.lives = 3;
        this.bulletDelay = 200;
        this.lastBulletTime = 0;
    }

    create(){
        this.background = this.add.tileSprite(0,0, config.width, config.height, "background");
        this.background.setOrigin(0,0);

        this.ship = this.physics.add.sprite(config.width/2, config.height/2 + 200, "ship");
        this.ship.play("ship_animation");
        this.ship.setCollideWorldBounds(true);
        this.ship.body.setAllowGravity(false);

        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        this.bullets = this.physics.add.group({
            defaultKey: 'beam',
            maxSize: 10
        });

        this.asteroids = this.physics.add.group();
        this.ufo = this.physics.add.sprite(200, 0, "ufo").setScale(4);
        this.ufo.play("ufo_animation");
        this.ufo.body.setAllowGravity(false);

        this.heart1 = this.add.image(410, 25, "heart").setScale(.1);
        this.heart2 = this.add.image(440, 25, "heart").setScale(.1);
        this.heart3 = this.add.image(470, 25, "heart").setScale(.1);
        
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '20px', fill: '#fff' });

        this.asteroidSpawnTimer = this.time.addEvent({
            delay: 1000,
            callback: this.spawnAsteroid,
            callbackScope: this,
            loop: true
        });
        
        this.physics.add.collider(this.bullets, this.asteroids, this.hitAsteroid, null, this);
        this.physics.add.collider(this.ship, this.asteroids, this.shipHit, null, this);
        this.physics.add.collider(this.ship, this.ufo, this.shipHit, null, this);
    }

    update(time){
        this.background.tilePositionY -= 0.5;
        this.moveShipManager(time);
        this.moveUFO(this.ufo, .2);

        this.asteroids.children.each(asteroid => {
            if (asteroid.y > config.height) {
                this.resetAsteroidPos(asteroid);
            }
        });
        
        this.bullets.children.each(bullet => {
            if (bullet.y < 0) {
                bullet.disableBody(true, true);
            }
        });
    }

    moveShipManager(time) {
        this.ship.body.setVelocityX(0);
        this.ship.body.setVelocityY(0);

        if(this.cursorKeys.left.isDown || this.keyA.isDown){
            this.ship.body.setVelocityX(-310);
        } else if(this.cursorKeys.right.isDown || this.keyD.isDown) {
            this.ship.body.setVelocityX(310);
        }
        
        if (this.spacebar.isDown && time > this.lastBulletTime) {
            this.fireBullet();
            this.lastBulletTime = time + this.bulletDelay;
        }
    }
    
    fireBullet() {
        let bullet = this.bullets.get();
        if (bullet) {
            bullet.enableBody(true, this.ship.x, this.ship.y - 20, true, true);
            bullet.setVelocityY(-400);
            bullet.setScale(0.5);
        }
    }

    shipHit(ship, obstacle) {
        this.lives--;
        obstacle.disableBody(true, true);
        ship.setPosition(config.width/2, config.height/2 + 200);
        this.updateHearts();
    }

    updateHearts() {
        if (this.lives < 3) this.heart3.setVisible(false);
        if (this.lives < 2) this.heart2.setVisible(false);
        if (this.lives < 1) this.heart1.setVisible(false);
        if (this.lives === 0) {
            console.log("Game Over!");
        }
    }
    
    hitAsteroid(bullet, asteroid) {
        let explosion = this.add.sprite(asteroid.x, asteroid.y, "explosion");
        explosion.play("explosion_animation");
        
        bullet.destroy();
        asteroid.destroy();
        
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
    }
    
    spawnAsteroid() {
        let x = Phaser.Math.Between(0, config.width);
        let y = -50;
        let asteroid = this.asteroids.create(x, y, "asteroid");
        asteroid.setVelocityY(Phaser.Math.Between(50, 200));
        asteroid.setAngularVelocity(Phaser.Math.Between(-100, 100));
        asteroid.setCollideWorldBounds(false);
        asteroid.setOrigin(0.5);
    }

    moveAsteroid(asteroid, speed) {
    }

    resetAsteroidPos(asteroid) {
    }

    moveUFO(ufo, speed) {
        ufo.y += speed;
        if (ufo.y > config.height) {
            this.resetUFOPos(ufo);
        }
    }

    resetUFOPos(ufo) {
        ufo.y = 0;
        var randomX = Phaser.Math.Between(0, config.width);
        ufo.x = randomX;
    }
}