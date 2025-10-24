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
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    // Dynamic sizing based on window
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'app',
    expandParent: false,
    // Handle orientation changes smoothly
    autoRound: true
  },
  render: {
    pixelArt: true,
    antialias: false,
    roundPixels: true
  },
  // Disable right-click context menu
  disableContextMenu: true,
  // Input configuration for better mobile support
  input: {
    activePointers: 3, // Support multi-touch (though we only use single tap)
    touch: {
      target: undefined,
      capture: true
    }
  }
}
