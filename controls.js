const MARIO_ANIMATIONS = {
  grown: {
    idle: 'mario-grown-idle',
    walk: 'mario-grown-walk',
    jump: 'mario-grown-jump',
    down: 'mario-grown-down'
  },
  normal: {
    idle: 'mario-idle',
    walk: 'mario-walk',
    jump: 'mario-jump'
  }
}

export function checkControls ({ mario, keys }) {
  const isMarioTouchingFloor = mario.body.touching.down

  const isRightKeyDown = keys.right.isDown
  const isLeftKeyDown = keys.left.isDown
  const isUpKeyDown = keys.up.isDown
  const isDownKeyDown = keys.down.isDown

  if (mario.isDead) return
  if (mario.isBlocked) return

  const marioAnimation = mario.isGrown ? MARIO_ANIMATIONS.grown : MARIO_ANIMATIONS.normal

  if (isLeftKeyDown) {
    isMarioTouchingFloor && mario.anims.play(marioAnimation.walk, true)
    mario.x -= 2
    mario.flipX = true
  } else if (isRightKeyDown) {
    isMarioTouchingFloor && mario.anims.play(marioAnimation.walk, true)
    mario.x += 2
    mario.flipX = false
  } else if (isMarioTouchingFloor) {
    mario.anims.play(marioAnimation.idle, true)
  }

  if (isUpKeyDown && isMarioTouchingFloor) {
    mario.setVelocityY(-300)
    mario.anims.play(marioAnimation.jump, true)
  }
  if (isDownKeyDown && (marioAnimation == MARIO_ANIMATIONS.grown)) {
    mario.anims.play(marioAnimation.down, true)
  }
}
