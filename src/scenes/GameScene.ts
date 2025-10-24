import Phaser from 'phaser'
import { Bird } from '../objects/Bird'
import { Pipe } from '../objects/Pipe'

export class GameScene extends Phaser.Scene {
  private bird!: Bird
  private pipes: Pipe[] = []
  private ground!: Phaser.GameObjects.Rectangle
  private score: number = 0
  private scoreText!: Phaser.GameObjects.Text
  private gameOver: boolean = false
  private gameOverText!: Phaser.GameObjects.Text
  private instructionText!: Phaser.GameObjects.Text
  private gameStarted: boolean = false
  private clouds: Phaser.GameObjects.Image[] = []
  private distantMountains: Phaser.GameObjects.Image[] = []
  private closeMountains: Phaser.GameObjects.Image[] = []
  private skyGradient!: Phaser.GameObjects.Graphics

  // Timing
  private pipeSpawnTimer: number = 0
  private pipeSpawnInterval: number = 1500 // milliseconds

  // Constants - now dynamic based on screen size
  private GROUND_HEIGHT: number = 100
  private PIPE_GAP: number = 150
  private PIPE_MIN_Y: number = 150
  private PIPE_MAX_Y: number = 450

  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // Update dynamic constants based on screen height
    this.updateConstants(height)

    // Create gradient sky background
    this.skyGradient = this.add.graphics()
    this.createSkyGradient(width, height)

    // Create mountains (behind clouds)
    this.createMountains(width, height)

    // Create clouds
    this.createClouds(width, height)

    // Create ground
    this.ground = this.add.rectangle(0, height - this.GROUND_HEIGHT, width, this.GROUND_HEIGHT, 0x8b7355)
    this.ground.setOrigin(0, 0)
    this.physics.add.existing(this.ground, true) // true = static body

    // Create bird
    this.bird = new Bird(this, 100, height / 2)
    this.bird.setDepth(10) // In front of everything except UI

    // Create score text
    this.scoreText = this.add.text(width / 2, 50, '0', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5)
    this.scoreText.setStroke('#000000', 4)
    this.scoreText.setDepth(100) // Always render on top

    // Create instruction text
    this.instructionText = this.add.text(width / 2, height / 2 + 50, 'Press SPACE or TAP to start', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5)
    this.instructionText.setDepth(100) // Always render on top

    // Create game over text (hidden initially)
    this.gameOverText = this.add.text(width / 2, height / 2, 'GAME OVER\n\nPress SPACE or TAP\nto restart', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: width - 40 }
    }).setOrigin(0.5)
    this.gameOverText.setVisible(false)
    this.gameOverText.setDepth(100) // Always render on top

    // Set up input
    this.setupInput()

    // Listen for resize events
    this.scale.on('resize', this.handleResize, this)
  }

  private updateConstants(height: number): void {
    // Scale constants based on screen height for better mobile adaptation
    const baseHeight = 600
    const scale = height / baseHeight

    this.GROUND_HEIGHT = Math.max(80, Math.min(100 * scale, 120))
    this.PIPE_GAP = Math.max(120, Math.min(150 * scale, 200))
    this.PIPE_MIN_Y = Math.max(100, height * 0.2)
    this.PIPE_MAX_Y = Math.min(height - this.GROUND_HEIGHT - this.PIPE_GAP - 50, height * 0.7)
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    const width = gameSize.width
    const height = gameSize.height

    // Update constants
    this.updateConstants(height)

    // Resize sky gradient
    this.skyGradient.clear()
    this.createSkyGradient(width, height)

    // Reposition ground
    this.ground.setPosition(0, height - this.GROUND_HEIGHT)
    this.ground.setSize(width, this.GROUND_HEIGHT)

    // Update physics body for ground
    const groundBody = this.ground.body as Phaser.Physics.Arcade.StaticBody
    if (groundBody) {
      groundBody.updateFromGameObject()
    }

    // Reposition UI elements
    this.scoreText.setPosition(width / 2, 50)
    this.instructionText.setPosition(width / 2, height / 2 + 50)
    this.gameOverText.setPosition(width / 2, height / 2)
    this.gameOverText.setWordWrapWidth(width - 40)

    // Update camera bounds
    this.cameras.main.setBounds(0, 0, width, height)
  }

  private setupInput(): void {
    // Spacebar
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.handleInput()
    })

    // Mouse click and touch - optimized for mobile
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Only respond to left mouse button or touch
      if (pointer.leftButtonDown() || pointer.isDown) {
        this.handleInput()
      }
    })

    // Prevent context menu on long press (mobile)
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonReleased()) {
        return false
      }
    })
  }

  private handleInput(): void {
    if (!this.gameStarted) {
      this.startGame()
      return
    }

    if (this.gameOver) {
      this.restartGame()
      return
    }

    this.bird.flap()
  }

  private startGame(): void {
    this.gameStarted = true
    this.instructionText.setVisible(false)
    this.bird.flap()
  }

  private spawnPipe(): void {
    const width = this.cameras.main.width

    // Random gap position
    const gapY = Phaser.Math.Between(this.PIPE_MIN_Y, this.PIPE_MAX_Y)

    // Create pipe
    const pipe = new Pipe(this, width + 50, gapY, this.PIPE_GAP)
    this.pipes.push(pipe)

    // Set pipe depth
    pipe.getTopPipe().setDepth(8)
    pipe.getBottomPipe().setDepth(8)

    // Set up collision
    this.physics.add.overlap(this.bird, pipe.getTopPipe(), () => this.hitPipe(), undefined, this)
    this.physics.add.overlap(this.bird, pipe.getBottomPipe(), () => this.hitPipe(), undefined, this)
  }

  private hitPipe(): void {
    if (!this.gameOver) {
      this.endGame()
    }
  }

  private endGame(): void {
    this.gameOver = true
    this.bird.die()
    this.gameOverText.setVisible(true)

    // Stop all pipes
    this.pipes.forEach(pipe => {
      pipe.getTopPipe().setVelocityX(0)
      pipe.getBottomPipe().setVelocityX(0)
    })
  }

  private restartGame(): void {
    // Reset state
    this.gameOver = false
    this.gameStarted = false
    this.score = 0
    this.pipeSpawnTimer = 0

    // Reset UI
    this.scoreText.setText('0')
    this.gameOverText.setVisible(false)
    this.instructionText.setVisible(true)

    // Reset bird
    const height = this.cameras.main.height
    this.bird.reset(100, height / 2)

    // Remove all pipes
    this.pipes.forEach(pipe => pipe.destroy())
    this.pipes = []
  }

  update(_time: number, delta: number): void {
    // Update mountains and clouds with parallax (always, even when game not started)
    this.updateMountains(delta)
    this.updateClouds(delta)

    if (!this.gameStarted || this.gameOver) {
      return
    }

    // Update bird
    this.bird.update()

    // Check if bird hit ground
    const height = this.cameras.main.height
    if (this.bird.y > height - this.GROUND_HEIGHT) {
      this.endGame()
      return
    }

    // Spawn pipes
    this.pipeSpawnTimer += delta
    if (this.pipeSpawnTimer > this.pipeSpawnInterval) {
      this.spawnPipe()
      this.pipeSpawnTimer = 0
    }

    // Update pipes and check for scoring
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i]

      if (pipe) {
        pipe.update()

        // Check if pipe is off screen
        if (pipe.isOffScreen()) {
          pipe.destroy()
          this.pipes.splice(i, 1)
          continue
        }

        // Check if bird passed pipe (for scoring)
        if (!pipe.hasScored() && pipe.x < this.bird.x - 30) {
          pipe.setScored()
          this.score++
          this.scoreText.setText(this.score.toString())
        }
      }
    }
  }

  private createSkyGradient(width: number, height: number): void {
    // Create a gradient from lighter blue at top to slightly darker at bottom
    // Top section - lighter blue
    this.skyGradient.fillGradientStyle(0x87ceeb, 0x87ceeb, 0x6eb9d9, 0x6eb9d9, 1)
    this.skyGradient.fillRect(0, 0, width, height / 2)

    // Bottom section - transition to mid blue
    this.skyGradient.fillGradientStyle(0x6eb9d9, 0x6eb9d9, 0x5ba5c7, 0x5ba5c7, 1)
    this.skyGradient.fillRect(0, height / 2, width, height / 2)

    this.skyGradient.setDepth(0) // Behind everything
  }

  private createMountains(width: number, height: number): void {
    // Create layered mountain ranges with pixel art style (inspired by reference)

    // Layer 1 - Furthest back (dark navy blue)
    const layer1 = this.add.graphics()
    layer1.fillStyle(0x2d4a5c, 1) // Dark navy
    this.drawJaggedMountain(layer1, 0, 0, 160, 80, 6) // 6 peaks
    layer1.generateTexture('mountain-layer1', 160, 80)
    layer1.destroy()

    // Layer 2 - Mid-far (teal)
    const layer2 = this.add.graphics()
    layer2.fillStyle(0x3d6b7d, 1) // Darker teal
    this.drawJaggedMountain(layer2, 0, 0, 160, 70, 7)
    layer2.generateTexture('mountain-layer2', 160, 70)
    layer2.destroy()

    // Layer 3 - Mid (cyan)
    const layer3 = this.add.graphics()
    layer3.fillStyle(0x4d8c9d, 1) // Mid cyan
    this.drawJaggedMountain(layer3, 0, 0, 160, 65, 8)
    layer3.generateTexture('mountain-layer3', 160, 65)
    layer3.destroy()

    // Layer 4 - Closer (bright cyan)
    const layer4 = this.add.graphics()
    layer4.fillStyle(0x5dadbd, 1) // Bright cyan
    this.drawJaggedMountain(layer4, 0, 0, 160, 55, 9)
    layer4.generateTexture('mountain-layer4', 160, 55)
    layer4.destroy()

    // Layer 5 - Closest (light cyan/mint)
    const layer5 = this.add.graphics()
    layer5.fillStyle(0x7dcdcd, 1) // Light cyan
    this.drawJaggedMountain(layer5, 0, 0, 160, 50, 10)
    layer5.generateTexture('mountain-layer5', 160, 50)
    layer5.destroy()

    // Place all 5 mountain layers at different depths and positions
    const groundY = height - this.GROUND_HEIGHT
    const mountainLayers = [
      { texture: 'mountain-layer1', depth: 1, yOffset: 90, scale: 1.3, array: this.distantMountains },
      { texture: 'mountain-layer2', depth: 2, yOffset: 70, scale: 1.4, array: this.distantMountains },
      { texture: 'mountain-layer3', depth: 3, yOffset: 55, scale: 1.5, array: this.closeMountains },
      { texture: 'mountain-layer4', depth: 4, yOffset: 40, scale: 1.6, array: this.closeMountains },
      { texture: 'mountain-layer5', depth: 4.5, yOffset: 25, scale: 1.7, array: this.closeMountains }
    ]

    mountainLayers.forEach((layer, layerIndex) => {
      const numMountains = 4 + layerIndex // More mountains in closer layers
      for (let i = 0; i < numMountains; i++) {
        const x = (width / (numMountains - 1)) * i + Math.random() * 30
        const y = groundY - layer.yOffset
        const mountain = this.add.image(x, y, layer.texture)
        mountain.setOrigin(0.5, 1)
        mountain.setDepth(layer.depth)
        mountain.setScale(layer.scale)
        layer.array.push(mountain)
      }
    })
  }

  private drawJaggedMountain(graphics: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number, peaks: number): void {
    // Draw a jagged mountain silhouette with pixel art style
    graphics.beginPath()
    graphics.moveTo(x, y + height)

    const segmentWidth = width / peaks
    for (let i = 0; i < peaks; i++) {
      // Random peak height variation
      const peakHeight = height * (0.4 + Math.random() * 0.6)
      const peakX = x + segmentWidth * i + segmentWidth / 2

      // Draw up to peak
      graphics.lineTo(peakX, y + height - peakHeight)
    }

    // Close the path
    graphics.lineTo(x + width, y + height)
    graphics.lineTo(x, y + height)
    graphics.closePath()
    graphics.fillPath()
  }

  private updateMountains(delta: number): void {
    const width = this.cameras.main.width

    // Different parallax speeds for each layer (slower = further away)
    const speeds = [0.008, 0.012, 0.016, 0.020, 0.024]

    // Update distant mountains (layers 1-2)
    this.distantMountains.forEach((mountain, index) => {
      const layerIndex = index < this.distantMountains.length / 2 ? 0 : 1
      const speed = speeds[layerIndex] ?? 0.01
      mountain.x -= speed * delta
      if (mountain.x < -200) {
        mountain.x = width + 200
      }
    })

    // Update closer mountains (layers 3-5)
    this.closeMountains.forEach((mountain, index) => {
      const layerIndex = 2 + Math.floor(index / (this.closeMountains.length / 3))
      const speed = speeds[Math.min(layerIndex, 4)] ?? 0.02
      mountain.x -= speed * delta
      if (mountain.x < -200) {
        mountain.x = width + 200
      }
    })
  }

  private createClouds(width: number, _height: number): void {
    // Create simple pixel art cloud using graphics
    const cloudGraphics = this.add.graphics()

    // Draw simple cloud shape with rectangles for pixel art style
    cloudGraphics.fillStyle(0xffffff, 1)

    // Cloud body (simple blocky shape)
    cloudGraphics.fillRect(0, 8, 48, 12) // main body
    cloudGraphics.fillRect(4, 4, 40, 8) // top bumps
    cloudGraphics.fillRect(8, 0, 32, 8) // higher bumps

    // Shading
    cloudGraphics.fillStyle(0xeeeeee, 1)
    cloudGraphics.fillRect(0, 16, 48, 4) // bottom shadow

    cloudGraphics.generateTexture('cloud', 48, 24)
    cloudGraphics.destroy()

    // Create multiple clouds with wrapping for infinite scrolling
    const numClouds = 8
    for (let i = 0; i < numClouds; i++) {
      const x = (width / numClouds) * i + Math.random() * 50
      const y = 60 + Math.random() * 120 // Random height in upper portion
      const cloud = this.add.image(x, y, 'cloud')
      cloud.setAlpha(0.8)
      cloud.setDepth(5) // Above mountains, below game objects
      cloud.setScale(1 + Math.random() * 0.5) // Vary sizes
      this.clouds.push(cloud)
    }
  }

  private updateClouds(delta: number): void {
    const width = this.cameras.main.width
    const cloudSpeed = 0.02 // Slow parallax speed (1/10th of pipe speed)

    this.clouds.forEach(cloud => {
      // Move cloud left slowly
      cloud.x -= cloudSpeed * delta

      // Wrap around when cloud goes off left edge
      if (cloud.x < -60) {
        cloud.x = width + 60
        // Randomize y position when wrapping
        cloud.y = 60 + Math.random() * 120
      }
    })
  }
}
