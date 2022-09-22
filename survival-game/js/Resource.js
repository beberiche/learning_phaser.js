import MatterEntity from './MatterEntity.js';

export default class Resource extends MatterEntity {
  static preload(scene) {
    scene.load.atlas(
      'resources',
      'assets/images/resources.png',
      'assets/images/resources_atlas.json'
    );
    scene.load.audio('tree', 'assets/audio/tree.wav');
    scene.load.audio('rock', 'assets/audio/rock.wav');
    scene.load.audio('bush', 'assets/audio/bush.wav');
    scene.load.audio('pickup', 'assets/audio/pickup.wav');
  }

  constructor(data) {
    const { scene, resource } = data;
    // super(
    //   scene.matter.world,
    //   resource.x,
    //   resource.y,
    //   'resources',
    //   resource.name
    // );
    let drops = JSON.parse(
      resource.properties.find((p) => p.name == 'drops').value
    );
    let depth = resource.properties.find((p) => p.name == 'depth').value
    
    super({scene,x:resource.x,y:resource.y,texture:"resources", frame: resource.name,drops, depth,health:5, name:resource.name});

    let yOrigin = resource.properties.find((p) => p.name == 'yOrigin').value;
    // this.name = resource.name;
    this.sound = this.scene.sound.add(this.name);
    // this.health = 5;
    // this.x += this.width / 2;
    // this.y -= this.height / 2;
    this.y = this.y + this.height * (yOrigin - 0.5);
    const {Bodies } = Phaser.Physics.Matter.Matter;
    let circleCollider = Bodies.circle(this.x, this.y, 12, {
      isSensor: false,
      label: 'collider',
    });
    this.setExistingBody(circleCollider);
    this.setStatic(true);
    this.setOrigin(0.5, yOrigin);
  }


}
