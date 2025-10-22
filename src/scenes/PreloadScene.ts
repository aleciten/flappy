import Phaser from 'phaser'

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload() {
    // Create a loading text
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height / 2

    this.add.text(centerX, centerY, 'Loading...', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5)

    // Assets will be loaded here in future phases
  }

  create() {
    // Start the main game scene
    this.scene.start('GameScene')
  }
}
