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
    this.createExplosion()
  }

  private createExplosion(): void {
    // Create bird fragment particles - instant burst
    const particles = this.scene.add.particles(this.x, this.y, 'bird', {
      speed: { min: 400, max: 700 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 200,
      gravityY: 800,
      quantity: 8,
      rotate: { min: -1440, max: 1440 }
    })
    particles.setDepth(50)

    // Create blood splatter texture
    const bloodGraphics = this.scene.add.graphics()
    bloodGraphics.fillStyle(0x8b0000, 1) // Dark red
    bloodGraphics.fillCircle(3, 3, 3)
    bloodGraphics.generateTexture('blood-particle', 6, 6)
    bloodGraphics.destroy()

    // Create blood spray particles - instant pop
    const bloodParticles = this.scene.add.particles(this.x, this.y, 'blood-particle', {
      speed: { min: 500, max: 1000 },
      angle: { min: 0, max: 360 },
      scale: { start: 2, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 250,
      gravityY: 1000,
      quantity: 35,
      tint: [0x8b0000, 0xa52a2a, 0xdc143c, 0xff0000] // Dark red to bright red
    })
    bloodParticles.setDepth(49)

    // Create feather particles - quick puff
    const featherGraphics = this.scene.add.graphics()
    featherGraphics.fillStyle(0xffffff, 1)
    featherGraphics.fillRect(0, 0, 4, 8)
    featherGraphics.generateTexture('feather-particle', 4, 8)
    featherGraphics.destroy()

    const featherParticles = this.scene.add.particles(this.x, this.y, 'feather-particle', {
      speed: { min: 250, max: 600 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 300,
      gravityY: 500,
      quantity: 12,
      rotate: { min: -1800, max: 1800 },
      tint: [0xffffff, 0xffd700, 0xffeb3b, 0xff9800]
    })
    featherParticles.setDepth(48)

    // Create explosion flash particles - instant pop
    const explosionGraphics = this.scene.add.graphics()
    explosionGraphics.fillStyle(0xff6600, 1)
    explosionGraphics.fillCircle(4, 4, 4)
    explosionGraphics.generateTexture('explosion-particle', 8, 8)
    explosionGraphics.destroy()

    const explosionParticles = this.scene.add.particles(this.x, this.y, 'explosion-particle', {
      speed: { min: 600, max: 1100 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 150,
      gravityY: 0,
      quantity: 25,
      blendMode: 'ADD',
      tint: [0xff0000, 0xff6600, 0xffaa00, 0xffff00]
    })
    explosionParticles.setDepth(50)

    // Create blood splatter marks that stick
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = 20 + Math.random() * 60
      const splatX = this.x + Math.cos(angle) * distance
      const splatY = this.y + Math.sin(angle) * distance

      const splatSize = 4 + Math.random() * 8
      const splat = this.scene.add.circle(splatX, splatY, splatSize, 0x8b0000, 0.9)
      splat.setDepth(47)

      // Fade out blood splatters over time
      this.scene.tweens.add({
        targets: splat,
        alpha: 0,
        duration: 3000,
        delay: 2000,
        onComplete: () => splat.destroy()
      })
    }

    // Add some larger blood pools
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = 10 + Math.random() * 30
      const poolX = this.x + Math.cos(angle) * distance
      const poolY = this.y + Math.sin(angle) * distance

      const pool = this.scene.add.ellipse(poolX, poolY, 15 + Math.random() * 10, 10 + Math.random() * 8, 0xa52a2a, 0.7)
      pool.setDepth(46)

      // Fade out blood pools slowly
      this.scene.tweens.add({
        targets: pool,
        alpha: 0,
        duration: 4000,
        delay: 2500,
        onComplete: () => pool.destroy()
      })
    }

    // Camera shake for impact - sharp and instant
    this.scene.cameras.main.shake(100, 0.02)

    // Destroy particle emitters after animation - instant pop
    this.scene.time.delayedCall(300, () => {
      particles.destroy()
      bloodParticles.destroy()
      featherParticles.destroy()
      explosionParticles.destroy()
    })

    // Hide the bird sprite
    this.setVisible(false)
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
    this.setVisible(true)
  }
}
