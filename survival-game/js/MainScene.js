import Enemy from './Enemy.js';
import Player from './Player.js';
import Resource from './Resource.js';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.enemies = [];
  }

  preload() {
    Player.preload(this);
    Enemy.preload(this);
    Resource.preload(this);
    // load -> 파일 데이터 인식하기
    this.load.image('tiles', 'assets/images/RPG Nature Tileset.png');
    this.load.tilemapTiledJSON('map', 'assets/images/map.json');
  }

  create() {
    // console.log('create');
    const map = this.make.tilemap({ key: 'map' });
    this.map = map;
    const tileset = map.addTilesetImage('RPG Nature Tileset', 'tiles', 32, 32);
    const layer1 = map.createStaticLayer('Tile Layer 1', tileset, 0, 0);
    const layer2 = map.createStaticLayer('Tile Layer 2', tileset, 0, 0);
    layer1.setCollisionByProperty({ collides: true });
    this.matter.world.convertTilemapLayer(layer1);

    // let tree = new Phaser.Physics.Matter.Sprite(this.matter.world, 50,50,"resources", "tree");
    // let rock = new Phaser.Physics.Matter.Sprite(this.matter.world, 150,150,"resources", "rock");

    // this.add.existing(tree);
    // this.add.existing(rock);

    // setStatic(tree) ㄴ
    // 오브젝트 정적 고정 (벡터 안통함) , 장애물 용
    // tree.setStatic(true);
    // rock.setStatic(true);

    this.map.getObjectLayer('Resources').objects.forEach((resource) => new Resource({ scene: this, resource }));
    this.map.getObjectLayer('Enemies').objects.forEach((enemy) => this.enemies.push(new Enemy({ scene: this, enemy })));

    this.player = new Player({
      scene: this,
      x: 50,
      y: 50,
      texture: 'female',
      frame: 'townsfolk_f_idle_1',
    });

    this.player.inputKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  addResources() {
    const resources = this.map.getObjectLayer('Resources');

    resources.objects.forEach((resource) => {
      let resItem = new Resource({ scene: this, resource });
      // let yOrigin = resource.properties.find(p=>p.name=="yOrigin").value
      // resourceItem.x += resourceItem.width/2;
      // resourceItem.y -= resourceItem.height/2;
      // resourceItem.y = resourceItem.y + resourceItem.height * (yOrigin - 0.5);
      // const {Body, Bodies} = Phaser.Physics.Matter.Matter;
      // let circleCollider = Bodies.circle(resourceItem.x, resourceItem.y, 12, {isSensor:false, label:"collider"});
      // resourceItem.setExistingBody(circleCollider);
      // resourceItem.setStatic(true);
      // resourceItem.setOrigin(0.5, yOrigin);
      // this.add.existing(resourceItem)
    });
  }

  update() {
    this.enemies.forEach(enemy => enemy.update());
    this.player.update();
  }
}
