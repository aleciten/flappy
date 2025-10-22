import Phaser from 'phaser'

export class Bird extends Phaser.Physics.Arcade.Sprite {
  private flapVelocity: number = -350
  private maxRotation: number = 20
  private isDead: boolean = false

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Create a simple colored circle as placeholder for bird sprite
    super(scene, x, y, '')

    // Add to scene and enable physics
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // Create a simple circle graphic as placeholder
    this.createPlaceholderGraphic()

    // Set up physics properties
    this.setCircle(12) // Collision circle radius
    this.setBounce(0)
    this.setGravityY(0) // Gravity is set globally in config
  }

  private createPlaceholderGraphic(): void {
    const graphics = this.scene.add.graphics()
    const centerX = 12
    const centerY = 12

    // Body (larger yellow oval)
    graphics.fillStyle(0xffd700, 1) // Gold/yellow
    graphics.fillEllipse(centerX, centerY, 20, 16)

    // Belly (lighter yellow)
    graphics.fillStyle(0xffeb3b, 1)
    graphics.fillEllipse(centerX + 1, centerY + 2, 12, 10)

    // Wing (orange, slightly darker)
    graphics.fillStyle(0xff9800, 1)
    graphics.fillEllipse(centerX - 2, centerY + 3, 10, 6)

    // Wing detail (darker orange stripe)
    graphics.fillStyle(0xff6f00, 1)
    graphics.fillEllipse(centerX - 2, centerY + 4, 8, 3)

    // Eye white (draw before beak so beak is on top)
    graphics.fillStyle(0xffffff, 1)
    graphics.fillCircle(centerX + 3, centerY - 3, 3)

    // Beak (bright orange triangle protruding from body)
    // Body edge is at centerX + 10, so beak needs to start there and extend further
    graphics.fillStyle(0xff5722, 1)
    graphics.beginPath()
    graphics.moveTo(centerX + 15, centerY)      // tip (extends 5px beyond body)
    graphics.lineTo(centerX + 8, centerY - 3)   // top (starts at body edge)
    graphics.lineTo(centerX + 8, centerY + 3)   // bottom (starts at body edge)
    graphics.closePath()
    graphics.fillPath()

    // Beak outline for definition
    graphics.lineStyle(1, 0xd84315, 1)
    graphics.strokeTriangle(
      centerX + 15, centerY,
      centerX + 8, centerY - 3,
      centerX + 8, centerY + 3
    )

    // Pupil (adjusted position to match moved eye)
    graphics.fillStyle(0x000000, 1)
    graphics.fillCircle(centerX + 4, centerY - 3, 2)

    // Eye shine (tiny white dot for life)
    graphics.fillStyle(0xffffff, 1)
    graphics.fillCircle(centerX + 5, centerY - 4, 1)

    // Outline/shadow for depth (dark semi-transparent)
    graphics.lineStyle(1, 0x000000, 0.3)
    graphics.strokeEllipse(centerX, centerY, 20, 16)

    // Generate texture from graphics
    graphics.generateTexture('bird', 24, 24)
    graphics.destroy()

    // Set the texture
    this.setTexture('bird')
  }

  public flap(): void {
    if (this.isDead) return

    // Apply upward velocity
    this.setVelocityY(this.flapVelocity)

    // Tilt bird upward
    this.setRotation(-0.3)
  }

  public die(): void {
    this.isDead = true
  }

  public update(): void {
    if (this.isDead) return

    // Rotate bird based on velocity (diving or climbing)
    const rotation = Phaser.Math.Clamp(
      this.body!.velocity.y * 0.001,
      -this.maxRotation,
      this.maxRotation
    )
    this.setRotation(rotation)

    // Keep bird from going too high (above screen)
    if (this.y < 0) {
      this.y = 0
      this.setVelocityY(0)
    }
  }

  public getIsDead(): boolean {
    return this.isDead
  }

  public reset(x: number, y: number): void {
    this.isDead = false
    this.setPosition(x, y)
    this.setVelocity(0, 0)
    this.setRotation(0)
  }
}
