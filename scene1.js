class scene1 extends Phaser.Scene {
    constructor(){
        super("bootGame");
    }

    preload() {
        // Load images - existing code
        this.load.image("background", "assets/background.png");
        this.load.image("background2", "assets/background2.png"); // Using existing background2 for night
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

        // Load audio files
        this.load.audio("backgroundMusic", ["assets/background_music.m4a"]);
        this.load.audio("laserSound", ["assets/laser_sound.wav"]);
        this.load.audio("explosionSound", ["assets/explosion.wav"]);
        this.load.audio("gameOverSound", ["assets/game_over.wav"]);

        // Set initial time immediately (synchronously) to avoid timing issues
        this.setInitialTimeOfDay();
        
        // Then try to update with web API
        this.fetchTimeOfDay();
    }

    setInitialTimeOfDay() {
        // Set initial time using local time immediately
        const now = new Date();
        const hour = now.getHours();
        const isDaytime = hour >= 6 && hour < 18;
        
        // background2 = day, background = night
        this.registry.set('isDaytime', isDaytime);
        this.registry.set('backgroundKey', isDaytime ? 'background2' : 'background');
        console.log(`Initial Local Time: ${hour}:${now.getMinutes().toString().padStart(2, '0')}, Using ${isDaytime ? 'day' : 'night'} background (${isDaytime ? 'background2' : 'background'})`);
    }

    fetchTimeOfDay() {
        // Use web API for more precise timezone-aware time
        fetch('http://worldtimeapi.org/api/timezone/America/New_York')
            .then(response => response.json())
            .then(data => {
                const datetime = new Date(data.datetime);
                const hour = datetime.getHours();
                const isDaytime = hour >= 6 && hour < 18;
                
                // background2 = day, background = night
                this.registry.set('isDaytime', isDaytime);
                this.registry.set('backgroundKey', isDaytime ? 'background2' : 'background');
                console.log(`API Time: ${hour}:${datetime.getMinutes().toString().padStart(2, '0')}, Using ${isDaytime ? 'day' : 'night'} background (${isDaytime ? 'background2' : 'background'})`);
                
                // Update background in scene2 if it's already running
                const scene2 = this.scene.get('playGame');
                if (scene2 && scene2.scene.isActive()) {
                    scene2.updateBackground(isDaytime ? 'background2' : 'background');
                }
            })
            .catch(error => {
                console.log('API failed, keeping local time background');
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
