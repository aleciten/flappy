import Phaser from 'phaser'

export class Pipe {
  private topPipe: Phaser.Physics.Arcade.Sprite
  private bottomPipe: Phaser.Physics.Arcade.Sprite
  private scored: boolean = false
  private pipeWidth: number = 80
  private pipeSpeed: number = -200
  public x: number

  constructor(scene: Phaser.Scene, x: number, gapY: number, gapSize: number = 150) {
    this.x = x

    // Create placeholder textures if they don't exist
    this.createPlaceholderTextures(scene)

    // Create top pipe (positioned above the gap)
    this.topPipe = scene.physics.add.sprite(x, gapY - gapSize / 2, 'pipe-top')
    this.topPipe.setOrigin(0.5, 1) // Anchor at bottom
    this.topPipe.setDisplaySize(this.pipeWidth, 600) // Tall enough to cover screen
    this.topPipe.setGravityY(-1000) // Cancel out global gravity

    // Create bottom pipe (positioned below the gap)
    this.bottomPipe = scene.physics.add.sprite(x, gapY + gapSize / 2, 'pipe-bottom')
    this.bottomPipe.setOrigin(0.5, 0) // Anchor at top
    this.bottomPipe.setDisplaySize(this.pipeWidth, 600)
    this.bottomPipe.setGravityY(-1000) // Cancel out global gravity

    // Set velocity for both pipes
    this.topPipe.setVelocityX(this.pipeSpeed)
    this.bottomPipe.setVelocityX(this.pipeSpeed)

    // Make pipes immovable (bird bounces off them, not the other way around)
    this.topPipe.setImmovable(true)
    this.bottomPipe.setImmovable(true)
  }

  private createPlaceholderTextures(scene: Phaser.Scene): void {
    // Only create if they don't exist
    if (!scene.textures.exists('pipe-top')) {
      const graphics = scene.add.graphics()
      const pipeBodyWidth = 52
      const pipeHeight = 600
      const capHeight = 26
      const capWidth = 60

      // === TOP PIPE (opens downward) ===

      // Main pipe body background
      graphics.fillStyle(0x71c54e, 1) // Light green
      graphics.fillRect(4, 0, pipeBodyWidth, pipeHeight - capHeight)

      // Dark left strip (1/4 width)
      graphics.fillStyle(0x5a9c3c, 1)
      graphics.fillRect(4, 0, pipeBodyWidth / 4, pipeHeight - capHeight)

      // Light right strip (1/4 width)
      graphics.fillStyle(0x8ae66e, 1)
      graphics.fillRect(4 + pipeBodyWidth - pipeBodyWidth / 4, 0, pipeBodyWidth / 4, pipeHeight - capHeight)

      // Black left border
      graphics.fillStyle(0x000000, 1)
      graphics.fillRect(0, 0, 4, pipeHeight - capHeight)

      // Black right border
      graphics.fillRect(pipeBodyWidth + 4, 0, 4, pipeHeight - capHeight)

      // === PIPE CAP ===
      const capY = pipeHeight - capHeight
      const capX = (pipeBodyWidth + 8 - capWidth) / 2

      // Cap background
      graphics.fillStyle(0x71c54e, 1)
      graphics.fillRect(capX + 4, capY, capWidth - 8, capHeight)

      // Cap dark left
      graphics.fillStyle(0x5a9c3c, 1)
      graphics.fillRect(capX + 4, capY, (capWidth - 8) / 4, capHeight)

      // Cap light right
      graphics.fillStyle(0x8ae66e, 1)
      graphics.fillRect(capX + capWidth - 4 - (capWidth - 8) / 4, capY, (capWidth - 8) / 4, capHeight)

      // Cap black borders
      graphics.fillStyle(0x000000, 1)
      graphics.fillRect(capX, capY, 4, capHeight) // left
      graphics.fillRect(capX + capWidth - 4, capY, 4, capHeight) // right
      graphics.fillRect(capX, capY, capWidth, 4) // top

      // Dark inner shadow at opening
      graphics.fillStyle(0x2d4a2d, 1)
      graphics.fillRect(capX + 4, capY + capHeight - 8, capWidth - 8, 8)

      graphics.generateTexture('pipe-top', capWidth + 10, pipeHeight)

      // === BOTTOM PIPE (opens upward) ===
      graphics.clear()

      // === PIPE CAP (at top) ===
      const bottomCapX = (pipeBodyWidth + 8 - capWidth) / 2

      // Cap background
      graphics.fillStyle(0x71c54e, 1)
      graphics.fillRect(bottomCapX + 4, 4, capWidth - 8, capHeight - 4)

      // Cap dark left
      graphics.fillStyle(0x5a9c3c, 1)
      graphics.fillRect(bottomCapX + 4, 4, (capWidth - 8) / 4, capHeight - 4)

      // Cap light right
      graphics.fillStyle(0x8ae66e, 1)
      graphics.fillRect(bottomCapX + capWidth - 4 - (capWidth - 8) / 4, 4, (capWidth - 8) / 4, capHeight - 4)

      // Cap black borders
      graphics.fillStyle(0x000000, 1)
      graphics.fillRect(bottomCapX, 0, 4, capHeight) // left
      graphics.fillRect(bottomCapX + capWidth - 4, 0, 4, capHeight) // right
      graphics.fillRect(bottomCapX, capHeight - 4, capWidth, 4) // bottom

      // Dark inner shadow at opening
      graphics.fillStyle(0x2d4a2d, 1)
      graphics.fillRect(bottomCapX + 4, 0, capWidth - 8, 8)

      // Main pipe body below cap
      graphics.fillStyle(0x71c54e, 1)
      graphics.fillRect(4, capHeight, pipeBodyWidth, pipeHeight - capHeight)

      // Dark left strip
      graphics.fillStyle(0x5a9c3c, 1)
      graphics.fillRect(4, capHeight, pipeBodyWidth / 4, pipeHeight - capHeight)

      // Light right strip
      graphics.fillStyle(0x8ae66e, 1)
      graphics.fillRect(4 + pipeBodyWidth - pipeBodyWidth / 4, capHeight, pipeBodyWidth / 4, pipeHeight - capHeight)

      // Black left border
      graphics.fillStyle(0x000000, 1)
      graphics.fillRect(0, capHeight, 4, pipeHeight - capHeight)

      // Black right border
      graphics.fillRect(pipeBodyWidth + 4, capHeight, 4, pipeHeight - capHeight)

      graphics.generateTexture('pipe-bottom', capWidth + 10, pipeHeight)

      graphics.destroy()
    }
  }

  public update(): void {
    // Update x position to track the pipes
    this.x = this.topPipe.x
  }

  public getTopPipe(): Phaser.Physics.Arcade.Sprite {
    return this.topPipe
  }

  public getBottomPipe(): Phaser.Physics.Arcade.Sprite {
    return this.bottomPipe
  }

  public hasScored(): boolean {
    return this.scored
  }

  public setScored(): void {
    this.scored = true
  }

  public isOffScreen(): boolean {
    return this.x < -this.pipeWidth
  }

  public destroy(): void {
    this.topPipe.destroy()
    this.bottomPipe.destroy()
  }
}
