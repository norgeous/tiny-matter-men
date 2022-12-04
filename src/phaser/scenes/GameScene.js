import Phaser from 'phaser';
import EmojiMan from '../objects/EmojiMan';

export default class GameScene extends Phaser.Scene {
  constructor(){
    super('game-scene');
  }

  create () {
    this.man1 = new EmojiMan(this, 400, 500, {
      emojis: {
        hat: '🎩',
        head: '😂',
        body: '👕',
        hips: '🩳',
        arm: '💪',
        hand: '👍',
        leg: '🦵',
      },
    });
    
    this.matter.world.setBounds();
    this.matter.add.mouseSpring();
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    this.man1.update();
  }
}
