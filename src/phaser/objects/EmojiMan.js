import Phaser from 'phaser';
import { collisionCategories, collisionMaskEverything } from '../collisonFilter';
import EmojiText from '../objects/EmojiText';

const createMatterCircle = (scene, x,y, { radius }) => {
  const circle = scene.add.circle(x, y, radius, 0x00ffff);
  const go = scene.matter.add.gameObject(circle, {
    shape: { type: 'circle', radius },
  });
  return go;
};

const createMatterRoundedRect = (scene, x,y, { width, height, chamfer = 0, chamferGfx = 0 }) => {
  const graphics = scene.add.graphics();
  graphics.fillStyle(0x00ffff, 1);
  graphics.fillRoundedRect(-width / 2, -height / 2, width, height, chamferGfx);
  const go = scene.matter.add.gameObject(graphics, {
    shape: { type: 'rectangle', width, height },
    chamfer: { radius: chamfer },
    position: { x, y },
  });
  return go;
};

const STIFFNESS = 1;

export default class EmojiMan {
  constructor(scene, x,y, { height = 80 }) {
    this.scene = scene;

    const propotions = {
      head: 1.5 / 8,
      torso: 2.5 / 8,
      arm: 3.5 / 8,
      leg: 4 / 8,
    };

    const headRadius = (propotions.head * height) / 2;
    this.head = createMatterCircle(scene, x,y, { radius: headRadius });

    const torsoWidth = propotions.head * height;
    const torsoHeight = propotions.torso * height;
    this.torso = createMatterRoundedRect(scene, x,y, { width: torsoWidth, height: torsoHeight, chamferGfx: torsoWidth / 3 });

    const legWidth = headRadius;
    const legHeight = propotions.leg * height;
    this.leg1 = createMatterRoundedRect(scene, x,y, { width: legWidth, height: legHeight, chamferGfx: legWidth / 2 });
    this.leg2 = createMatterRoundedRect(scene, x,y, { width: legWidth, height: legHeight, chamferGfx: legWidth / 2 });

    this.leg1.setCollisionCategory(collisionCategories.background);
    this.leg2.setCollisionCategory(collisionCategories.foreground);

    this.leg1.setCollidesWith(collisionMaskEverything &~ collisionCategories.foreground);
    this.leg2.setCollidesWith(collisionMaskEverything &~ collisionCategories.background);

    this.neck = Phaser.Physics.Matter.Matter.Constraint.create({
      bodyA: this.head.body,
      bodyB: this.torso.body,
      pointA: { x: 0, y: headRadius },
      pointB: { x: 0, y: -torsoHeight/2 },
      length: 0,
      stiffness: STIFFNESS,
    });
    this.scene.matter.world.add(this.neck);

    this.hip1 = Phaser.Physics.Matter.Matter.Constraint.create({
      bodyA: this.torso.body,
      bodyB: this.leg1.body,
      pointA: { x: 0, y: torsoHeight/2 },
      pointB: { x: 0, y: -legHeight/2 },
      length: 0,
      stiffness: STIFFNESS,
    });
    this.scene.matter.world.add(this.hip1);

    this.hip2 = Phaser.Physics.Matter.Matter.Constraint.create({
      bodyA: this.torso.body,
      bodyB: this.leg2.body,
      pointA: { x: 0, y: torsoHeight/2 },
      pointB: { x: 0, y: -legHeight/2 },
      length: 0,
      stiffness: STIFFNESS,
    });
    this.scene.matter.world.add(this.hip2);
  }

  update() {

    this.torso.setAngularVelocity(-this.torso.angle/1000);

    const leg1diffX = this.torso.body.position.x - this.leg1.body.position.x;
    const leg1diffY = this.torso.body.position.y - this.leg1.body.position.y;

    if (leg1diffY<0) {
      // keep torso above legs horizontally
      this.torso.setVelocityX(this.torso.body.velocity.x - leg1diffX / 4);
      
      // keep legs under torso horizontally
      this.leg1.setVelocityX(this.leg1.body.velocity.x + leg1diffX / 4);
    }
    
    // keep torso above legs vertically
    // if (leg1diffY > -20)
    // this.torso.setVelocityY(this.torso.body.velocity.y - leg1diffY / 10);

  }
}
