import Phaser from 'phaser'
import { phaserConfig } from './config/phaserConfig'
import './style.css'

// Initialize the Phaser game
const game = new Phaser.Game(phaserConfig)

// Make game instance available globally for debugging
if (import.meta.env.DEV) {
  ;(window as any).game = game
}
