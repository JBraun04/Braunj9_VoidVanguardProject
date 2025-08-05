class scene1 extends Phaser.Scene {
    constructor(){
        super("bootGame");
    }

    preload() {
        // Load images
        this.load.image("background", "assets/background.png");
        this.load.image("background2", "assets/background2.png");
        this.load.image("panel", "assets/panel.png"); // optional panel image
        
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
            frameHeight: 64
        });

        // Audio
        this.load.audio("backgroundMusic", ["assets/background_music.m4a"]);
        this.load.audio("laserSound", ["assets/laser_sound.wav"]);
        this.load.audio("explosionSound", ["assets/explosion.wav"]);
        this.load.audio("gameOverSound", ["assets/game_over.wav"]);

        this.setInitialTimeOfDay();
        this.fetchTimeOfDay();
    }

    setInitialTimeOfDay() {
        const now = new Date();
        const hour = now.getHours();
        const isDaytime = hour >= 6 && hour < 18;
        this.registry.set('isDaytime', isDaytime);
        this.registry.set('backgroundKey', isDaytime ? 'background2' : 'background');
    }

    fetchTimeOfDay() {
        fetch('http://worldtimeapi.org/api/timezone/America/New_York')
            .then(response => response.json())
            .then(data => {
                const datetime = new Date(data.datetime);
                const hour = datetime.getHours();
                const isDaytime = hour >= 6 && hour < 18;
                this.registry.set('isDaytime', isDaytime);
                this.registry.set('backgroundKey', isDaytime ? 'background2' : 'background');

                const scene2 = this.scene.get('playGame');
                if (scene2 && scene2.scene.isActive()) {
                    scene2.updateBackground(isDaytime ? 'background2' : 'background');
                }
            })
            .catch(() => console.log('API failed, keeping local background'));
    }

    create() {
        // Background same as game
        const bgKey = this.registry.get('backgroundKey');
        this.add.tileSprite(0, 0, this.scale.width, this.scale.height, bgKey).setOrigin(0);

        // Animations
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

        const { width, height } = this.cameras.main;

        // Center popup "bubble"
        let panel;
        if (this.textures.exists("panel")) {
            // If you added a PNG panel image
            panel = this.add.image(width / 2, height / 2, "panel").setScale(0.6);
        } else {
            // Fallback: draw a rounded rectangle
            panel = this.add.graphics();
            panel.fillStyle(0x000000, 0.6);
            panel.fillRoundedRect(width / 2 - 200, height / 2 - 175, 400, 350, 20);
        }

        // Tutorial text
        const tutorialText = this.add.text(
            width / 2, height / 2 - 60,
            'Welcome to Void Vanguard!\n\n' +
            'Controls:\n' +
            'A / D or ← / → - Move left/right\n' +
            'SPACE - Shoot\n\n' +
            'Goal:\n' +
            'Shoot asteroids & dodge spaceships.\n' +
            'Gain score by hitting asteroids.\n' +
            'You have 3 lives — make them count!',
            {
                font: '18px Arial',
                fill: '#FFFFFF',
                align: 'center',
                wordWrap: { width: 350 }
            }
        ).setOrigin(0.5);

        // OK button
        const okButton = this.add.text(
            width / 2, height / 2 + 100,
            'PLAY', { font: '24px Arial', fill: '#00FF00', backgroundColor: '#222' }
        )
        .setOrigin(0.5)
        .setPadding(10, 5)
        .setInteractive({ useHandCursor: true });

        okButton.on('pointerdown', () => {
            panel.destroy();
            tutorialText.destroy();
            okButton.destroy();
            this.scene.start("playGame");
        });
    }
}
