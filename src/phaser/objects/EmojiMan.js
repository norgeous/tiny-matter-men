import Phaser from 'phaser';
import { collisionCategories, collisionMaskEverything } from '../collisonFilter';

const createMatterCircle = (scene, x,y, { color, radius }) => {
  const circle = scene.add.circle(x, y, radius, color);
  const go = scene.matter.add.gameObject(circle, {
    shape: { type: 'circle', radius },
  });
  return go;
};

const createMatterRoundedRect = (scene, x,y, { color, width, height, chamfer = 0, chamferGfx = 0 }) => {
  const graphics = scene.add.graphics();
  graphics.fillStyle(color, 1);
  graphics.fillRoundedRect(-width / 2, -height / 2, width, height, chamferGfx);
  const go = scene.matter.add.gameObject(graphics, {
    shape: { type: 'rectangle', width, height },
    chamfer: { radius: chamferGfx },
    position: { x, y },
  });
  return go;
};

const STIFFNESS = 1;

export default class EmojiMan {
  constructor(scene, x,y, { height = 80, color1, color2, color3, color4, color5 }) {
    this.scene = scene;
    this.height = height;

    const propotions = {
      head: 1.5 / 8,
      torso: 2.5 / 8,
      arm: 3.5 / 8,
      leg: 4 / 8,
    };

    const headRadius = (propotions.head * height) / 2;
    const torsoWidth = propotions.head * height;
    const torsoHeight = propotions.torso * height;
    const armWidth = headRadius * 0.75;
    const armHeight = propotions.arm * height;
    const legWidth = headRadius;
    const legHeight = propotions.leg * height;

    this.arm1 = createMatterRoundedRect(scene, x,y,  { color: color1, width: armWidth,   height: armHeight,   chamferGfx: armWidth / 2 });
    this.leg1 = createMatterRoundedRect(scene, x,y,  { color: color2, width: legWidth,   height: legHeight,   chamferGfx: legWidth / 2 });
    this.head = createMatterCircle(scene, x,y,       { color: color3, radius: headRadius });
    this.torso = createMatterRoundedRect(scene, x,y, { color: color3, width: torsoWidth, height: torsoHeight, chamferGfx: torsoWidth / 3 });
    this.leg2 = createMatterRoundedRect(scene, x,y,  { color: color4, width: legWidth,   height: legHeight,   chamferGfx: legWidth / 2 });
    this.arm2 = createMatterRoundedRect(scene, x,y,  { color: color5, width: armWidth,   height: armHeight,   chamferGfx: armWidth / 2 });

    this.arm1.setCollisionCategory(collisionCategories.entity1);
    this.leg1.setCollisionCategory(collisionCategories.entity1);
    this.head.setCollisionCategory(collisionCategories.entity1);
    this.torso.setCollisionCategory(collisionCategories.entity1);
    this.leg2.setCollisionCategory(collisionCategories.entity2);
    this.arm2.setCollisionCategory(collisionCategories.entity2);

    this.arm1.setCollidesWith(collisionMaskEverything &~ collisionCategories.entity1 &~ collisionCategories.entity2);
    this.arm2.setCollidesWith(collisionMaskEverything &~ collisionCategories.entity1 &~ collisionCategories.entity2);
  
    // this.head.setCollidesWith(collisionMaskEverything &~ collisionCategories.entity);
    // this.torso.setCollidesWith(collisionMaskEverything &~ collisionCategories.entity);

    this.leg1.setCollidesWith(collisionMaskEverything &~ collisionCategories.entity2);
    this.leg2.setCollidesWith(collisionMaskEverything &~ collisionCategories.entity2);

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
      pointA: { x: 0, y: torsoHeight/2 + legWidth/2 },
      pointB: { x: 0, y: -legHeight/2 + legWidth/2 },
      length: 0,
      stiffness: STIFFNESS,
    });
    this.scene.matter.world.add(this.hip1);

    this.hip2 = Phaser.Physics.Matter.Matter.Constraint.create({
      bodyA: this.torso.body,
      bodyB: this.leg2.body,
      pointA: { x: 0, y: torsoHeight/2 + legWidth/2},
      pointB: { x: 0, y: -legHeight/2 + legWidth/2 },
      length: 0,
      stiffness: STIFFNESS,
    });
    this.scene.matter.world.add(this.hip2);


    this.armpit1 = Phaser.Physics.Matter.Matter.Constraint.create({
      bodyA: this.torso.body,
      bodyB: this.arm1.body,
      pointA: { x: 0, y: -torsoHeight/2 + armWidth },
      pointB: { x: 0, y: -armHeight/2 + armWidth/2 },
      length: 0,
      stiffness: STIFFNESS,
    });
    this.scene.matter.world.add(this.armpit1);

    this.armpit2 = Phaser.Physics.Matter.Matter.Constraint.create({
      bodyA: this.torso.body,
      bodyB: this.arm2.body,
      pointA: { x: 0, y: -torsoHeight/2 + armWidth },
      pointB: { x: 0, y: -armHeight/2 + armWidth/2 },
      length: 0,
      stiffness: STIFFNESS,
    });
    this.scene.matter.world.add(this.armpit2);
  }

  update() {
    this.arm1.setAngularVelocity(.05);
    this.arm2.setAngularVelocity(.05);
    // return;
    const leg1diffX = this.torso.body.position.x - this.leg1.body.position.x;
    const leg1diffY = this.torso.body.position.y - this.leg1.body.position.y;
    
    if (leg1diffY < 0) {

      const multipler = 1000 / this.height;

      // keep torso above legs horizontally
      this.torso.setAngularVelocity(-this.torso.angle / (100 * multipler ));
      this.torso.setVelocityX(this.torso.body.velocity.x - leg1diffX / (10 * multipler));
      
      // keep legs under torso horizontally
      this.leg1.setAngularVelocity(-this.leg1.angle / (100 * multipler ));
      this.leg1.setVelocityX(this.leg1.body.velocity.x + leg1diffX / (10 * multipler));
    }
  }
}
