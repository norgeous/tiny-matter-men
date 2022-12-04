import Phaser from 'phaser';
import EmojiMan from '../objects/EmojiMan';

export default class GameScene extends Phaser.Scene {
  constructor(){
    super('game-scene');
  }

  create () {
    this.man1 = new EmojiMan(this, 400, 500, {
      height: 500,
      color1: 0x002222,
      color2: 0x003333,
      color3: 0x005555,
      color4: 0x007777,
      color5: 0x009999,
    });
    
    this.matter.world.setBounds();
    this.matter.add.mouseSpring();
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    this.man1.update();
  }
}
