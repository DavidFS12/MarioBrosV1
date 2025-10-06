import { createAnimations } from "./animations.js"
import { checkControls } from './controls.js'
import { initAudio, playAudio } from "./sounds.js"
import {image} from "./image.js"
import { initSpritesheet } from "./spritesheet.js"

const config = {
  type: Phaser.AUTO,
  width: 256,
  height:244,
  backgroundColor: "#049cd8",
  parent: "game",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y:300 },
      debug: false,
    }
  },
  scene: {
    preload,
    create,
    update,
  }
}

const game = new Phaser.Game(config);

function preload(){
  initSpritesheet(this)
  image(this)
  initAudio(this)
}

function create() {
  createAnimations(this)

  this.add.image(128, 30, "cloud1").setScale(0.15).setOrigin(0.5,0.5)
  
  this.floor = this.physics.add.staticGroup()
  this.floor.create(0, config.height-16, "floorbricks").setOrigin(0,0.5).refreshBody()
  this.floor.create(180, config.height-16, "floorbricks").setOrigin(0,0.5).refreshBody()
  
  this.mario = this.physics.add.sprite(50, 100, "mario").setOrigin(0,1).setCollideWorldBounds(true).setGravityY(300)
  this.goomba = this.physics.add.sprite(120, config.height-30, "goomba").setOrigin(0,1).setGravityY(300).setVelocityX(-50)
  this.goomba.anims.play("goomba-walk", true)
  this.coins = this.physics.add.staticGroup()
  this.coins.create(150, 150, "coin").anims.play("coin-anims", true)
  this.coins.create(200, 150, "coin").anims.play("coin-anims", true)
  this.coins.create(250, config.height - 40, "superMushroom").anims.play("superMushroom-idle", true)

  this.physics.world.setBounds(0, 0, 2000, config.height)
  this.physics.add.collider(this.mario, this.floor)
  this.physics.add.collider(this.goomba, this.floor)
  this.physics.add.overlap(this.mario, this.coins, CollectionCoin, null, this)
  this.physics.add.collider(this.mario, this.goomba, onHitEnemy, null, this)

  this.cameras.main.setBounds(0, 0, 2000, config.height)
  this.cameras.main.startFollow(this.mario, true, 0.5, 0.5)

  this.keys = this.input.keyboard.createCursorKeys()
  
  function onHitEnemy(mario, goomba){
    console.log("enemy hit")
    if(mario.body.touching.down && goomba.body.touching.up){
      goomba.anims.play("goomba-dead", true)
      goomba.setVelocityX(0)
      mario.setVelocityY(-100)
      playAudio("goomba-stomp", this)
      addToScore(200, mario, this)

      setTimeout(() => {
        goomba.destroy()
      }, 500);
    }else {
      killMario(this)
    }
  }

  function CollectionCoin(mario, item){
    item.destroy()

    if(item.texture.key == "coin"){
      playAudio("coin-pickup", this, {volume: 0.2})
      addToScore(100, mario, this)
    }else if(item.texture.key = "superMushroom"){
      this.physics.world.pause()
      this.anims.pauseAll()

      addToScore(1000, mario, this)
      playAudio("power-up", this, {volume: 0.2})

      let i=0
      const interval = setInterval(() => {
        i++
        mario.anims.play(i%2==0 ? "mario-grown-idle" : "mario-idle")
      }, 100)

      mario.isBlocked = true
      mario.isGrown = true

      setTimeout(() => {
        mario.setDisplaySize(18,32)
        mario.body.setSize(18, 32)
        mario.isBlocked = false
        clearInterval(interval)
        this.physics.world.resume()
        this.anims.resumeAll()
      }, 1000)

    } else{
      console.log("msm")
    }
  }

  function addToScore(scoreToAdd, origin, game){
    const scoreText = game.add.text(
      origin.x,
      origin.y,
      scoreToAdd,
      {
        fontFamily: "pixel",
        fontSize: config.width / 40
      }
    )

    game.tweens.add({
      targets: scoreText,
      duration: 500,
      y: scoreText.y - 20,
      onComplete: () => {
        game.tweens.add({
          targets: scoreText,
          duration: 100,
          alpha: 0,
          onComplete: () => {
            scoreText.destroy()
          }
        })
      }
    })
  }
}

function update (){
  const {mario} = this

  checkControls(this)
  
  if(mario.y >= config.height){
    killMario(this)
  }
}

function killMario(game){
  const {mario, scene} = game

  if(mario.isDead) return

  mario.isDead = true;
  mario.anims.play("mario-dead", true);
  mario.setCollideWorldBounds(false);
  playAudio("gameover", game, {volume: 0.2})
  mario.body.checkCollision.none = true

  setTimeout(() => {
    mario.setVelocityY(-350)
    mario.setVelocityX(0)
  }, 100)

  setTimeout(() => {
    scene.restart()
  }, 3000)
}