class scene2 extends Phaser.Scene {
    constructor(){
        super("playGame");
        this.score = 0;
        this.healScore = 0;
        this.lives = 3;
        this.bulletDelay = 200;
        this.lastBulletTime = .5;
        this.gameOver = false;
    }

    create(){
        // Get the background key from the registry (set by scene1 based on time)
        const backgroundKey = this.registry.get('backgroundKey') || 'background';
        const isDaytime = this.registry.get('isDaytime');
        
        console.log(`Scene2 starting with background: ${backgroundKey}, isDaytime: ${isDaytime}`);
        
        this.background = this.add.tileSprite(0,0, config.width, config.height, backgroundKey);
        this.background.setOrigin(0,0);

        // Display time-based message
        if (isDaytime !== undefined) {
            const timeMessage = isDaytime ? 'Day Mode Active' : 'Night Mode Active';
            const timeText = this.add.text(16, 50, timeMessage, { 
                fontSize: '14px', 
                fill: isDaytime ? '#FFD700' : '#87CEEB',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: { x: 5, y: 3 }
            });
            
            // Remove the message after 3 seconds
            this.time.addEvent({
                delay: 3000,
                callback: () => timeText.destroy()
            });
        }

        this.ship = this.physics.add.sprite(config.width/2, config.height/2 + 200, "ship");
        this.ship.play("ship_animation");
        this.ship.setCollideWorldBounds(true);
        this.ship.body.setAllowGravity(false);

        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

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

        // Initialize audio
        this.initializeAudio();

        // Initialize game over elements (hidden initially)
        this.createGameOverElements();

        this.spawnAsteroid();
        this.spawnUFOs();

        this.physics.add.collider(this.bullets, this.asteroids, this.hitAsteroid, null, this);
        this.physics.add.collider(this.ship, this.asteroids, this.shipHit, null, this);
        this.physics.add.collider(this.ship, this.ufos, this.shipHit, null, this);
    }

    updateBackground(backgroundKey) {
        // Method to update background texture dynamically
        console.log(`Updating background to: ${backgroundKey}`);
        this.background.setTexture(backgroundKey);
    }

    initializeAudio() {
        // Background music setup
        if (this.sound.get('backgroundMusic')) {
            this.backgroundMusic = this.sound.get('backgroundMusic');
        } else {
            this.backgroundMusic = this.sound.add('backgroundMusic', {
                volume: 0.3,
                loop: true
            });
        }

        // Sound effects setup
        this.laserSound = this.sound.add('laserSound', { volume: 0.5 });
        this.explosionSound = this.sound.add('explosionSound', { volume: 0.6 });
        this.gameOverSound = this.sound.add('gameOverSound', { volume: 0.8 });

        // Start background music
        if (!this.backgroundMusic.isPlaying) {
            this.backgroundMusic.play();
        }

        // Add audio controls
        this.add.text(16, 75, 'Press M to toggle music', { 
            fontSize: '12px', 
            fill: '#ccc' 
        });

        this.keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    }

    createGameOverElements() {
        // Game Over text with pulsing effect
        this.gameOverText = this.add.text(config.width/2, config.height/2 - 50, 'GAME OVER', {
            fontSize: '48px',
            fill: '#ff0000',
            stroke: '#ffffff',
            strokeThickness: 3,
            fontFamily: 'Arial Black'
        });
        this.gameOverText.setOrigin(0.5);
        this.gameOverText.setVisible(false);

        // Restart instruction text
        this.restartText = this.add.text(config.width/2, config.height/2 + 20, 'Press R to Restart', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 10, y: 5 }
        });
        this.restartText.setOrigin(0.5);
        this.restartText.setVisible(false);

        // Final score text
        this.finalScoreText = this.add.text(config.width/2, config.height/2 - 10, '', {
            fontSize: '20px',
            fill: '#ffff00',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 8, y: 4 }
        });
        this.finalScoreText.setOrigin(0.5);
        this.finalScoreText.setVisible(false);
    }

    update(time){
        // Don't update game mechanics if game is over
        if (this.gameOver) {
            // Handle restart input
            if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
                this.restartGame();
            }
            return;
        }

        this.background.tilePositionY -= 0.5;
        this.moveShipManager(time);
        this.moveUFOs();

        // Handle music toggle
        if (Phaser.Input.Keyboard.JustDown(this.keyM)) {
            this.toggleMusic();
        }

        this.asteroids.children.each(asteroid => {
            this.moveAsteroid(asteroid);
        }, this);

        this.bullets.children.each(bullet => {
            if (bullet.y < 0) {
                bullet.disableBody(true, true);
            }
        });
    }

    toggleMusic() {
        if (this.gameOver) return; // Don't allow music toggle during game over
        
        if (this.backgroundMusic.isPlaying) {
            this.backgroundMusic.pause();
        } else {
            this.backgroundMusic.resume();
        }
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
            
            // Play laser sound effect
            if (this.laserSound) {
                this.laserSound.play();
            }
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
            this.triggerGameOver();
        }
    }

    triggerGameOver() {
        this.gameOver = true;
        console.log("Game Over!");
        
        // Mute background music
        if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
            this.backgroundMusic.setVolume(0);
        }
        
        // Play game over sound
        if (this.gameOverSound) {
            this.gameOverSound.play();
        }
        
        // Stop ship movement and hide it
        this.ship.setVelocity(0, 0);
        this.ship.setVisible(false);
        
        // Stop all asteroids and UFOs
        this.asteroids.children.each(asteroid => {
            asteroid.setVelocity(0, 0);
        });
        this.ufos.children.each(ufo => {
            ufo.setVelocity(0, 0);
        });
        
        // Show game over UI
        this.gameOverText.setVisible(true);
        this.restartText.setVisible(true);
        this.finalScoreText.setText(`Final Score: ${this.score}`);
        this.finalScoreText.setVisible(true);
        
        // Create pulsing effect for game over text
        this.tweens.add({
            targets: this.gameOverText,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 800,
            ease: 'Power2',
            yoyo: true,
            repeat: -1
        });
    }

    restartGame() {
        // Reset game state
        this.gameOver = false;
        this.lives = 3;
        this.score = 0;
        this.healScore = 0;
        
        // Resume background music
        if (this.backgroundMusic) {
            this.backgroundMusic.setVolume(0.3);
            if (!this.backgroundMusic.isPlaying) {
                this.backgroundMusic.play();
            }
        }
        
        // Hide game over UI
        this.gameOverText.setVisible(false);
        this.restartText.setVisible(false);
        this.finalScoreText.setVisible(false);
        
        // Stop any tweens
        this.tweens.killTweensOf(this.gameOverText);
        
        // Reset ship
        this.ship.setVisible(true);
        this.ship.setPosition(config.width/2, config.height/2 + 200);
        
        // Reset hearts
        this.updateHearts();
        
        // Reset score display
        this.scoreText.setText('Score: 0');
        
        // Clear all bullets
        this.bullets.children.each(bullet => {
            bullet.disableBody(true, true);
        });
        
        // Ensure we have the right number of asteroids and UFOs
        this.asteroids.clear(true, true);
        this.ufos.clear(true, true);
        
        // Respawn all objects
        this.spawnAsteroid();
        this.spawnUFOs();
        
        console.log("Game restarted!");
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

        // Store asteroid properties before destroying
        const asteroidScale = asteroid.scaleX;
        const asteroidSpeed = asteroid.speed;

        bullet.destroy();
        asteroid.destroy();

        // Play explosion sound effect
        if (this.explosionSound) {
            this.explosionSound.play();
        }

        // Immediately create a replacement asteroid
        this.createAsteroid(asteroidScale, asteroidSpeed);

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
        asteroid.body.setAllowGravity(false);
        asteroid.setActive(true);
        asteroid.setVisible(true);
    }

    moveAsteroid(asteroid) {
        if (!asteroid.active) return;
        
        asteroid.y += asteroid.speed;
        if (asteroid.y > config.height + 50) {
            this.resetAsteroidPos(asteroid);
        }
    }

    resetAsteroidPos(asteroid) {
        asteroid.y = Phaser.Math.Between(-100, -50);
        asteroid.x = Phaser.Math.Between(50, config.width - 50);
        asteroid.setActive(true);
        asteroid.setVisible(true);
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
        ufo.setActive(true);
        ufo.setVisible(true);
    }

    moveUFOs() {
        this.ufos.children.each(ufo => {
            if (!ufo.active) return;
            
            ufo.y += ufo.speed;
            if (ufo.y > config.height + 50) {
                this.resetUFOPos(ufo);
            }
        });
    }

    resetUFOPos(ufo) {
        ufo.y = Phaser.Math.Between(-150, -50);
        ufo.x = Phaser.Math.Between(50, config.width - 50);
        ufo.setActive(true);
        ufo.setVisible(true);
        ufo.play("ufo_animation");
    }
}
