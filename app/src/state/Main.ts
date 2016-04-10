export class Main extends Phaser.State {
  text: Phaser.Text;
  player: Phaser.Sprite;
  gun: Phaser.Sprite;
  floor: Phaser.Sprite;
  background: Phaser.TileSprite;
  bulletPool: Phaser.Group;
  lastBulletShotAt: number;
  lastRotation: number;


  // 10 52px

  preload() {
    this.load.spritesheet('player', 'assets/player.png', 32, 29, 2);
    this.load.image('bg', 'assets/bg.png');
    this.load.image('gun', 'assets/gun.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('pixel', 'assets/pixel.png');
    this.load.spritesheet('smoke', 'assets/humo1.png', 52, 52, 10);


  }

  create() {
    this.game.input.activePointer.x = this.game.width / 2;
    this.game.input.activePointer.y = this.game.height / 2;

    this.lastBulletShotAt = 0;

    this.background = this.add.tileSprite(0, 200, 586 * 4 , 552, 'bg');
    this.player = this.add.sprite(200, 390, 'player');

    this.gun = this.add.sprite(0, 0, 'gun');
    this.player.addChild(this.gun);
    // this.player.gun = gun;
    //this.gun.anchor.set(0, 0.5);


    this.player.anchor.set(0.5);
    this.player.animations.add('walk').play(4, true);

    // Enable physics on the player
    this.physics.enable(this.player, Phaser.Physics.ARCADE);

    this.player.body.gravity.y = 300;
    this.player.body.setSize(20, 26, 0, 0);

    this.floor = this.add.sprite(0, 420, null);
    this.physics.enable(this.floor, Phaser.Physics.ARCADE);
    this.floor.body.setSize(860, 50, 0, 0);

    this.floor.body.immovable = true;
    this.floor.body.allowGravity = false;

    this.bulletPool = this.game.add.group();
    for (let i = 0; i < 30; i++) {
      // Create each bullet and add it to the group.
      const bullet = this.game.add.sprite(0, 0, 'bullet');
      this.bulletPool.add(bullet);

      // Set its pivot point to the center of the bullet
      bullet.anchor.setTo(0.5, 0.5);

      // Enable physics on the bullet
      this.game.physics.enable(bullet, Phaser.Physics.ARCADE);

      // Set its initial state to "dead".
      bullet.kill();
    }



  }

  shootBullet() {
    // Enforce a short delay between shots by recording
    // the time that each bullet is shot and testing if
    // the amount of time since the last shot is more than
    // the required delay.
    const SHOT_DELAY = 190;
    if (this.game.time.now - this.lastBulletShotAt < SHOT_DELAY) return;
    this.lastBulletShotAt = this.game.time.now;

    // Get a dead bullet from the pool
    const bullet = this.bulletPool.getFirstDead();

    // If there aren't any bullets available then don't shoot
    if (!bullet) {
      return false;
    }

    // Revive the bullet
    // This makes the bullet "alive"
    bullet.revive();

    // Bullets should kill themselves when they leave the world.
    // Phaser takes care of this for me by setting this flag
    // but you can do it yourself by killing the bullet if
    // its x,y coordinates are outside of the world.
    bullet.checkWorldBounds = true;
    bullet.outOfBoundsKill = true;

    // Set the bullet position to the gun position.
    bullet.reset(this.player.x, this.player.y);
    this.lastRotation = this.game.physics.arcade.angleToPointer(this.player);

    this.gun.anchor.set(0, 0.5);
    if (Math.cos(this.lastRotation) < 0) {
      this.gun.rotation = Math.PI - this.lastRotation;
    } else {
      this.gun.rotation = this.lastRotation;
    }
    bullet.rotation = this.lastRotation;

    const BULLET_SPEED = 180;
    // Shoot it in the right direction
    bullet.body.velocity.x = Math.cos(bullet.rotation) * BULLET_SPEED;
    bullet.body.velocity.y = Math.sin(bullet.rotation) * BULLET_SPEED;
    return true;
  }

  update() {
    this.game.physics.arcade.collide(this.player, this.floor);
    this.game.physics.arcade.collide(this.bulletPool, this.floor, (floor, b) => {
      /*const particles = this.add.emitter(b.body.x, b.body.y, 100);
      particles.makeParticles('pixel');
      particles.gravity = -200;
      // this.smokeEmitter.start(false, this.SMOKE_LIFETIME, 50);
      particles.start(true, 2000, null, 10);*/

      const smoke = this.add.sprite(b.body.x, b.body.y, 'smoke');
      smoke.alpha = 0.8;
      smoke.anchor.set(0.5);

      const anim = smoke.animations.add('burn');
      anim.onComplete.addOnce(() => smoke.kill());
      anim.play();

      b.kill();
    });
    // console.log(this.player.x);
    this.background.x -= 1.5;
    if (this.background.x < -586) {
      this.background.x = 0;
    }

    this.player.scale.x = 1;
    this.gun.visible = false;

    // Shoot a bullet
    if (this.game.input.activePointer.isDown) {
      this.gun.visible = true;
      this.shootBullet();
      const deltaX = Math.cos(this.lastRotation);
      const deltaY = Math.sin(this.lastRotation);

      // const speedX = deltaX * 100 * -1;
		  // const speedY = deltaY * 100 * -1;
      // console.log(deltaX, deltaY);
      if (deltaX < 0) {
        this.player.scale.x = -1;

      }
      this.background.x += (deltaX / 2);
      // console.log(speedX / 2);
      if (this.player.body.touching.down) {
        if (deltaY > 0.6) {
          this.player.body.velocity.y = -250;
        }
      } else {
        if (this.player.body.velocity.y > 80 && deltaY > 0.6) {
          this.player.body.velocity.y = 80;
        } else {
          this.player.body.velocity.y -= deltaY * 2;
        }
      }
    }
  }
/*
  render() {

    // Display
   this.game.debug.body(this.floor);
   this.game.debug.body(this.player);

   // this.game.debug.spriteCorners(this.floor, true, true);
 }*/
}
