export class Main extends Phaser.State {
  text: Phaser.Text;
  player: Phaser.Sprite;
  background: Phaser.TileSprite;

  preload() {
    this.load.image('player', 'assets/player.png');
    this.load.image('bg', 'assets/bg.png');
  }

  create() {
    this.background = this.add.tileSprite(0, 200, 586 * 4 , 552, 'bg');
    this.player = this.add.sprite(10, 390, 'player');

    // Enable physics on the player
    this.game.physics.enable(this.player, Phaser.Physics.ARCADE);

    this.player.body.gravity.y = 200;

    //this.add.sprite(x: number, y: number, key?: any, frame?: any, group?: Phaser.Group)
  }

  update() {
    //console.log(this.player.x);
    this.background.x -= 1;
    if (this.background.x < -586) {
      this.background.x = 0;
    }
  }
}
