import Phaser from 'phaser'
import { phaserConfig } from './config/phaserConfig'
import './style.css'

// Fullscreen API handler
function setupFullscreen() {
  const fullscreenBtn = document.getElementById('fullscreen-btn')
  if (!fullscreenBtn) return

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        await document.documentElement.requestFullscreen()
        fullscreenBtn.textContent = '⛶'
      } else {
        // Exit fullscreen
        await document.exitFullscreen()
        fullscreenBtn.textContent = '⛶'
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err)
    }
  }

  fullscreenBtn.addEventListener('click', toggleFullscreen)

  // Update button when fullscreen changes (via F11 or other means)
  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
      fullscreenBtn.textContent = '⛶'
    } else {
      fullscreenBtn.textContent = '⛶'
    }
  })

  // Auto-enter fullscreen on first user interaction (mobile optimization)
  const autoFullscreen = async () => {
    if (isMobileDevice() && !document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen()
      } catch (err) {
        // Silently fail - user can manually trigger if needed
      }
    }
    // Remove listener after first interaction
    document.removeEventListener('pointerdown', autoFullscreen)
  }

  document.addEventListener('pointerdown', autoFullscreen, { once: true })
}

// Detect mobile devices
function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 2)
}

// Prevent default touch behaviors that interfere with gameplay
function preventDefaultTouchBehaviors() {
  // Prevent pinch-to-zoom
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault()
    }
  }, { passive: false })

  // Prevent double-tap zoom
  let lastTouchEnd = 0
  document.addEventListener('touchend', (e) => {
    const now = Date.now()
    if (now - lastTouchEnd <= 300) {
      e.preventDefault()
    }
    lastTouchEnd = now
  }, false)
}

// Initialize the Phaser game
const game = new Phaser.Game(phaserConfig)

// Set up mobile optimizations
setupFullscreen()
preventDefaultTouchBehaviors()

// Make game instance available globally for debugging
if (import.meta.env.DEV) {
  ;(window as any).game = game
}
