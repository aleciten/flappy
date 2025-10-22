import Phaser from 'phaser'
import { PreloadScene } from '../scenes/PreloadScene'
import { GameScene } from '../scenes/GameScene'

export const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 400,
  height: 600,
  parent: 'app',
  backgroundColor: '#4ec0ca',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 1000 },
      debug: false
    }
  },
  scene: [PreloadScene, GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  render: {
    pixelArt: true,
    antialias: false,
    roundPixels: true
  }
}
