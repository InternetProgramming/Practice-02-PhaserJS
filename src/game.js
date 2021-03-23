var config = {
    type: Phaser.AUTO,
    width: 800, 
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 300},
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var score = 0;
var scoreText;

function preload (){
    this.load.image('background', 'assets/background.png');
    this.load.image('ground', 'assets/ground.png');
    this.load.spritesheet('enemie', 
        'assets/enemie.png',
        { frameWidth: 32, frameHeight: 32 }
    );
    this.load.spritesheet('apple',
        'assets/apple.png',
        { frameWidth: 32 , frameHeight: 32 }
    );
    this.load.spritesheet('leaf', 
        'assets/leaf.png',
        { frameWidth: 32, frameHeight: 32 }
    );
}

var player;
var platforms;
var apples;
var enemies;

function create (){

    //Background
    this.add.image(400, 300, 'background');

    //Platforms
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 350, 'ground');
    platforms.create(50, 280, 'ground');
    platforms.create(400, 450, 'ground');
    platforms.create(750, 240, 'ground');

    //Player
    player = this.physics.add.sprite(100, 450, 'leaf');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('leaf', {start: 0, end: 2}),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'leaf', frame: 0 } ],
        frameRate: 10
    });
    
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('leaf', { start: 0, end: 2}),
        frameRate: 10,
        repeat: -1
    });

    //Apples
    apples = this.physics.add.group({
        key: 'apple',        
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    apples.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    enemies = this.physics.add.group();

    //Score
    scoreText = this.add.text(
        16, 16, 'score: 0', {fontSize: '32px', fill: '#ffffff'});

    //Colliders
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(apples, platforms);
    this.physics.add.collider(enemies, platforms);
    this.physics.add.collider(player, enemies, hitEnemies, null, this);

    //Overlaps
    this.physics.add.overlap(player, apples, collectApples, null, this);

    this.input.mouse.disableContextMenu();
}

function update (){
    var pointer = this.input.activePointer;

    if (pointer.leftButtonDown() && pointer.worldX < 400) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    }
    else if (pointer.leftButtonDown() && pointer.worldX > 400) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    }
    if (pointer.leftButtonDown() && pointer.worldY < 300 && 
    player.body.touching.down) {
        player.setVelocityY(-330);
    }
    if (!pointer.isDown) {
        player.setVelocityX(0);
        player.anims.play('turn');
    }
}

function collectApples (player, apple)
{
    apple.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);


    //Realese Enemies
    if (apples.countActive(true) === 0)
    {
        apples.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) :
            Phaser.Math.Between(0, 400);

        var enemie = enemies.create(x, 16, 'enemie');
        enemie.setBounce(1);
        enemie.setCollideWorldBounds(true);
        enemie.setVelocity(Phaser.Math.Between(-200, 200), 20);
        enemie.allowGravity = false;
    }
}

function hitEnemies(player, enemie){
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
}