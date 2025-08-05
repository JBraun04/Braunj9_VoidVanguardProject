class scene2 extends Phaser.Scene {
    constructor(){
        super("playGame");
        this.score = 0;
        this.healScore = 0;
        this.lives = 3;
        this.bulletDelay = 200;
        this.lastBulletTime = .5;
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
        this.ufos = this.physics.add.group();

        this.heart1 = this.add.image(410, 25, "heart").setScale(.1);
        this.heart2 = this.add.image(440, 25, "heart").setScale(.1);
        this.heart3 = this.add.image(470, 25, "heart").setScale(.1);

        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '20px', fill: '#fff' });

        this.spawnAsteroid();
        this.spawnUFOs();

        this.physics.add.collider(this.bullets, this.asteroids, this.hitAsteroid, null, this);
        this.physics.add.collider(this.ship, this.asteroids, this.shipHit, null, this);
        this.physics.add.collider(this.ship, this.ufos, this.shipHit, null, this);
    }

    update(time){
        this.background.tilePositionY -= 0.5;
        this.moveShipManager(time);
        this.moveUFOs();

        this.asteroids.children.each(asteroid => {
            this.moveAsteroid(asteroid);
        }, this);

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
            bullet.setScale(0.1);
        }
    }

    shipHit(ship, obstacle) {
        this.lives--;
        obstacle.disableBody(true, true);
        ship.setPosition(config.width/2, config.height/2 + 200);
        this.updateHearts();
    }

    updateHearts() {
        this.heart1.setVisible(this.lives >= 1);
        this.heart2.setVisible(this.lives >= 2);
        this.heart3.setVisible(this.lives >= 3);

        if (this.lives === 0) {
            console.log("Game Over!");
        }
    }

    restoreHealth() {
        this.lives = 3;
        this.heart1.setVisible(true);
        this.heart2.setVisible(true);
        this.heart3.setVisible(true);
    }

    checkHeal() {
        if (this.healScore >= 1000) {
            this.restoreHealth();
            this.healScore = 0;
            console.log("Health restored at score:", this.score);
        }
    }

    hitAsteroid(bullet, asteroid) {
        let explosion = this.add.sprite(asteroid.x, asteroid.y, "explosion");
        explosion.play("explosion_animation");

        bullet.destroy();
        asteroid.destroy();

        this.createAsteroid(asteroid.scaleX, asteroid.speed);

        this.score += 10;
        this.healScore += 10;
        this.checkHeal();

        this.scoreText.setText('Score: ' + this.score);
    }

    spawnAsteroid() {
        this.createAsteroid(0.2, 3.2);
        this.createAsteroid(0.5, 2.1);
        this.createAsteroid(0.9, 1.1);
    }

    createAsteroid(scale, speed){
        const x = Phaser.Math.Between(50, config.width - 50);
        const y = -50;

        const asteroid = this.asteroids.create(x, y, "asteroid");
        asteroid.setScale(scale);
        asteroid.setOrigin(0.5);
        asteroid.setAngularVelocity(Phaser.Math.Between(-40, 40));
        asteroid.speed = speed;
    }

    moveAsteroid(asteroid) {
        asteroid.y += asteroid.speed;
        if (asteroid.y > config.height) {
            this.resetAsteroidPos(asteroid);
        }
    }

    resetAsteroidPos(asteroid) {
        asteroid.y = -50;
        asteroid.x = Phaser.Math.Between(50, config.width - 50);
    }

    spawnUFOs() {
        this.createUFO(0.8, 1.2);
        this.createUFO(1.0, 1.0);
    }

    createUFO(scale, speed) {
        const x = Phaser.Math.Between(50, config.width - 50);
        const y = Phaser.Math.Between(-100, -50);

        const ufo = this.ufos.create(x, y, "ufo");
        ufo.setScale(scale);
        ufo.setOrigin(0.5);
        ufo.play("ufo_animation");
        ufo.body.setAllowGravity(false);
        ufo.speed = speed;
    }

    moveUFOs() {
        this.ufos.children.each(ufo => {
            ufo.y += ufo.speed;
            if (ufo.y > config.height) {
                this.resetUFOPos(ufo);
            }
        });
    }

    resetUFOPos(ufo) {
        ufo.y = 0;
        ufo.x = Phaser.Math.Between(50, config.width - 50);
    }
}
