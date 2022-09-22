import MatterEntity from "./MatterEntity.js";

export default class Player extends MatterEntity {
  constructor(data) {
    let { scene, x, y, texture, frame } = data;
    // super(scene.matter.world, x, y, texture, frame);
    super({...data, health:2, drops:[],name:"player"});
    this.touching = [];
    this.scene.add.existing(this);

    // weapon
    // items.png에서 무기 하나 가져오기
    this.spriteWeapon = new Phaser.GameObjects.Sprite(
      this.scene,
      x,
      y,
      'items',
      162
    );
    // 크기 확대 혹은 축소
    this.spriteWeapon.setScale(0.8);
    // 무기가 나오는 좌표 미세 변환
    this.spriteWeapon.setOrigin(0.25, 0.75);
    // 화면에 추가
    this.scene.add.existing(this.spriteWeapon);

    // 캐릭터 센서와, 터치보정 정하기
    const { Body, Bodies } = Phaser.Physics.Matter.Matter;
    // 센서
    let playerCollider = Bodies.circle(this.x, this.y, 12, {
      isSensor: false,
      label: 'playerCollider',
    });
    // 터치보정
    let playerSensor = Bodies.circle(this.x, this.y, 24, {
      isSensor: true,
      label: 'playerSensor',
    });
    const compoundBody = Body.create({
      parts: [playerCollider, playerSensor],
      // 공기 마찰에 의한 물리엔진 설정
      frictionAir: 0.35,
    });

    // 설정 완료
    this.setExistingBody(compoundBody);
    // 충격 시 물체 고정되도록
    // 안하면 돌아감
    this.setFixedRotation();

    // resource 부시는 걸 가능하게 하는 함수
    this.CreateMiningCollisions(playerSensor);

    // 캐릭터가 아이템에 접근하는 경우 아이템에 대한 정보를 얻는 함수
    this.CreatePickupCollisions(playerCollider);

    // 마우스 이동시 이벤트
    this.scene.input.on('pointermove', (pointer) => {
      // 현재 캐릭터의 x좌표값보다 마우스의 맵 x 좌표값이 작다면 캐릭터를 x축으로 반전시켜라
      this.setFlipX(pointer.worldX < this.x);
    });
  }

  static preload(scene) {
    // 캐릭터 이미지 데이터 로드
    scene.load.atlas(
      'female',
      'assets/images/female.png',
      'assets/images/female_atlas.json'
    );
    // 캐릭터 애니메이션 로드
    scene.load.animation('female_anim', 'assets/images/female_anim.json');
    // 캐릭터 무기 데이터 로드
    scene.load.spritesheet('items', 'assets/images/items.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    scene.load.audio("player", "assets/audio/player.wav");
  }

  update() {
    // default 스피드
    const speed = 2;
    // 벨로시티 데이터 수식으로 전환
    let playerVelocity = new Phaser.Math.Vector2();
    // 아래로 누르면
    if (this.inputKeys.left.isDown) {
      playerVelocity.x = -1;
      // 오른쪽으로 누르면
    } else if (this.inputKeys.right.isDown) {
      playerVelocity.x = 1;
    }
    // 횡축 방햑과 종축 방향이 함께 쓰일 수 있어야, 대각선으로 이어짐
    // 위로 누르면
    if (this.inputKeys.up.isDown) {
      playerVelocity.y = -1;
      // 아래로 누르면
    } else if (this.inputKeys.down.isDown) {
      playerVelocity.y = 1;
    }

    // 횡축 종축, 방향을 동시에 누르는 경우, 대각선에서 가속도가 붙을 수 있다.
    // 대각선 값도 종축, 횡축 속도와 동일하게 맞춰준다.
    playerVelocity.normalize();
    // 속도 값 지정
    playerVelocity.scale(speed);
    // 속도를 캐릭터에 설정
    this.setVelocity(playerVelocity.x, playerVelocity.y);

    // 속도가 있다면, 걷는 애니메이션을, 그렇지 않은 경우 제자리에 있는 애니메이션을 보여준다.
    if (Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.y) > 0.1) {
      this.anims.play('female_walk', true);
    } else {
      this.anims.play('female_idle', true);
    }
    // 움직일때 함께 무기의 좌표도 옮겨준다.
    this.spriteWeapon.setPosition(this.x, this.y);

    // 클릭시 무기를 휘두르게 하는 이벤트
    this.weaponRotate();
  }

  weaponRotate() {
    // 마우스 클릭
    let pointer = this.scene.input.activePointer;
    // 클릭이 되면 돌고 아니면 돌지마
    if (pointer.isDown) {
      this.weaponRotation += 5;
    } else {
      this.weaponRotation = 0;
    }

    if (this.weaponRotation > 100) {
      this.whackStuff();
      this.weaponRotation = 0;
    }

    // 캐릭터가 반전되었다면?
    if (this.flipX) {
      this.spriteWeapon.setAngle(-this.weaponRotation - 90);
    } else {
      // 무기 설정 셋팅
      this.spriteWeapon.setAngle(this.weaponRotation);
    }
  }

  // 캐릭터와 물체, 접촉시 해당 오브젝트의 데이터를 확인하는 함수
  CreateMiningCollisions(playerSensor) {
    this.scene.matterCollision.addOnCollideStart({
      objectA: [playerSensor],
      callback: (other) => {
        if (other.bodyB.isSensor) return;
        this.touching.push(other.gameObjectB);
        // console.log(other.gameObjectB)
        console.log(this.touching.length, other.gameObjectB.name);
      },
      context: this.scene,
    });

    this.scene.matterCollision.addOnCollideEnd({
      objectA: [playerSensor],
      callback: (other) => {
        this.touching = this.touching.filter(
          (gameObject) => gameObject != other.gameObjectB
        );
      },
      context: this.scene,
    });
  }

  CreatePickupCollisions(playerCollider) {
    this.scene.matterCollision.addOnCollideStart({
      objectA: [playerCollider],
      callback: (other) => {
        if (other.gameObjectB && other.gameObjectB.pickup)
          other.gameObjectB.pickup();
      },
      context: this.scene,
    });

    this.scene.matterCollision.addOnCollideActive({
      objectA: [playerCollider],
      callback: (other) => {
        if (other.gameObjectB && other.gameObjectB.pickup)
          other.gameObjectB.pickup();
      },
      context: this.scene,
    });
  }

  // object 파괴
  whackStuff() {
    this.touching = this.touching.filter(
      (gameObject) => gameObject.hit && !gameObject.dead
    );
    this.touching.forEach((gameObject) => {
      gameObject.hit();
      if (gameObject.dead) gameObject.destroy();
    });
  }
}
