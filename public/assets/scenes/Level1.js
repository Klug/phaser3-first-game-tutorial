export default class Level1 extends Phaser.Scene {
	constructor() {
		super({
			key: 'Level1'
		});
	}

	preload() {
		this.load.script(
			'webfont',
			'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js'
		);
		this.load.image('sky', 'assets/sky.png');
		this.load.image('ground', 'assets/platform.png');
		this.load.image('star', 'assets/star.png');
		this.load.image('bomb', 'assets/bomb.png');
		this.load.spritesheet('dude',
			'assets/dude.png',
			{ frameWidth: 32, frameHeight: 48 }
		);
	}

	create() {
		//Add Objects
		this.add.image(0, 0, 'sky').setOrigin(0, 0); //background
		this.stars = this.physics.add.group({
			key: 'star',
			repeat: 11,
			setXY: { x: 12, y: 0, stepX: 70 }
		});
		this.stars.children.iterate(function (child) {
			child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
		});

		//World
		this.platforms = this.physics.add.staticGroup();
		this.platforms.create(400, 568, 'ground').setScale(2).refreshBody(); //floor
		this.platforms.create(600, 400, 'ground'); //platform
		this.platforms.create(50, 250, 'ground'); //platform
		this.platforms.create(750, 220, 'ground'); //platform

		//Player
		this.player = this.physics.add.sprite(100, 450, 'dude');
		this.player.setBounce(0.2);
		this.player.setCollideWorldBounds(true);
		this.anims.create({
			key: 'left',
			frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
			frameRate: 10,
			repeat: -1
		});
		this.anims.create({
			key: 'turn',
			frames: [ { key: 'dude', frame: 4 } ],
			frameRate: 20
		});
		this.anims.create({
			key: 'right',
			frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
			frameRate: 10,
			repeat: -1
		});

		//Things collide with platforms
		this.physics.add.collider(this.player, this.platforms); //player with platform
		this.physics.add.collider(this.stars, this.platforms); //stars with platform
		this.physics.add.overlap(this.player, this.stars, collectStar, null, this); //player with stars

		//keyboard input
		this.cursors = this.input.keyboard.createCursorKeys();

		//score
		this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
		this.score = 0;
		function collectStar (player, star){
			//disable star
			star.disableBody(true, true);
			//+score
			this.score += 10;
			this.scoreText.setText('Score: ' + this.score);
			//bombs
			if (this.stars.countActive(true) === 0){
				this.stars.children.iterate(function (child) {
					child.enableBody(true, child.x, 0, true, true);
				});
				this.x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
				this.bomb = this.bombs.create(this.x, 16, 'bomb');
				this.bomb.setBounce(1);
				this.bomb.setCollideWorldBounds(true);
				this.bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
			}
		}

		//bombs
		this.bombs = this.physics.add.group();
		this.physics.add.collider(this.bombs, this.platforms);
		this.physics.add.collider(this.player, this.bombs, hitBomb, null, this);
		function hitBomb (player, bomb){
			this.physics.pause();
			player.setTint(0xff0000);
			player.anims.play('turn');
			this.gameOver = true;
		}
	}

	update(time, delta) {

		//movement
		if (this.cursors.left.isDown) {
			this.player.setVelocityX(-160);
			this.player.anims.play('left', true);
		} else if (this.cursors.right.isDown){
			this.player.setVelocityX(160);
			this.player.anims.play('right', true);
		} else{
			this.player.setVelocityX(0);
			this.player.anims.play('turn');
		}
		if (this.cursors.up.isDown && this.player.body.touching.down){
			this.player.setVelocityY(-330);
		}

		//Game Over
		if (this.gameOver) {
			var add = this.add;
			var input = this.input;
			WebFont.load({
				google: {
					families: ['Fredericka the Great']
				},
				active: function() {
					add
						.text(200, 150, `Game Over`, {
							fontFamily: 'Fredericka the Great',
							fontSize: 50,
							color: '#ffffff'
						})
						.setShadow(2, 2, '#333333', 2, false, true);
				}
			});
			this.keys = this.input.keyboard.addKeys('SPACE');
			if (this.keys.SPACE.isDown) {
				this.gameOver = false;
				this.scene.start('Intro');
			}
		}
	}
}
