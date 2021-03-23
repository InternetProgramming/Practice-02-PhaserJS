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
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('woof', 
        'assets/woof.png',
        { frameWidth: 32, frameHeight: 32 }
    );
}

var player;
var platforms;
var cursors;
var bombs;

function create (){

    //Background
    this.add.image(400, 300, 'background');

    //Platforms
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground')

    //Player
    player = this.physics.add.sprite(100, 450, 'woof');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('woof', {start: 0, end: 1}),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'woof', frame: 2 } ],
        frameRate: 10
    });
    
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('woof', { start: 2, end: 3}),
        frameRate: 10,
        repeat: -1
    });

    //Stars
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {

        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    
    });

    bombs = this.physics.add.group();

    //Score
    scoreText = this.add.text(
        16, 16, 'score: 0', {fontSize: '32px', fill: '#ffffff'});

    //Colliders
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, bombs, hitBomb, null, this);

    //Overlaps
    this.physics.add.overlap(player, stars, collectStar, null, this);

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

function collectStar (player, star)
{
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);

    console.log(stars.countActive)

    //Realese bombs
    if (stars.countActive(true) === 0)
    {
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) :
            Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;
    }
}

function hitBomb(player, bomb){
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
}