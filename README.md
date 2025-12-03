# 3D Floating Multi-Level Maze

An interactive 3D maze game where you guide a reflective metal ball through multiple levels by tilting the maze with your mouse.

## Features

- **5 Levels of Unique Mazes**: Each level has a distinct color theme and unique wall layout
- **Realistic Physics**: Ball rolls naturally based on gravity and maze tilt
- **Reflective Metal Ball**: 18mm diameter ball with accurate environmental reflections
- **Mouse/Touch Controls**: Drag to tilt the maze along X and Y axes
- **Progressive Difficulty**: Navigate through increasingly complex maze patterns
- **Open Top/Bottom Design**: See through multiple maze layers for strategic planning

## How to Play

1. Open `index.html` in a modern web browser
2. Drag your mouse to tilt the maze
3. Guide the metal ball to the center hole on each level
4. The ball will fall to the next level and continue
5. Complete all 5 levels to win!

## Controls

- **Mouse Drag**: Tilt the maze to control ball movement
- **Touch Drag** (mobile): Same as mouse drag for touch devices

## Technical Details

### Technologies Used
- **Three.js**: 3D rendering and graphics
- **WebGL**: Hardware-accelerated 3D graphics
- **Custom Physics Engine**: Real-time collision detection and ball movement

### Maze Structure
- Each level: 40cm x 40cm rectangular maze
- Wall height: 4cm
- Wall thickness: 8mm
- Center hole radius: 2.5cm
- Ball diameter: 18mm
- Level spacing: 8cm

### Level Designs
1. **Level 1 (Red)**: Simple cross pattern - Learn the basics
2. **Level 2 (Teal)**: Spiral pattern - Practice controlled tilting
3. **Level 3 (Yellow)**: Zigzag pattern - Navigate obstacles
4. **Level 4 (Mint)**: Corner obstacles - Precision required
5. **Level 5 (Purple)**: Complex maze - Master challenge

## Browser Compatibility

Works best on modern browsers with WebGL support:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Project Structure

```
.
├── index.html      # Main HTML entry point
├── style.css       # Styling and layout
├── main.js         # Three.js implementation and game logic
└── README.md       # This file
```

## Development

No build process required! Just open `index.html` in a browser to run.

Three.js is loaded via CDN from jsdelivr.

## Features Implemented

✅ 3D floating maze structure with 5 levels
✅ Each level fully enclosed with 6 vertical walls (rectangular shape)
✅ Open top and bottom for layer visibility
✅ 18mm diameter reflective metal ball
✅ Environmental reflections and highlights on ball
✅ Mouse drag to tilt maze (continuous and smooth)
✅ Realistic physics and gravity simulation
✅ Ball rolls naturally on inclined surfaces
✅ Center hole on each level
✅ Ball falls through holes with bounce effect
✅ Distinct color theme per level
✅ Unique wall patterns per level
✅ Physical collision detection
✅ Consistent wall thickness and height
✅ Floating appearance in space
✅ Soft ambient lighting with multiple light sources
✅ Camera perspective showing full structure
✅ Level progress indicator

## Future Enhancements

- Add sound effects for ball rolling and bouncing
- Add particle effects when ball falls through holes
- Add timer and score tracking
- Add level editor for custom mazes
- Add multiplayer competitive mode
- Add different ball materials (wood, glass, etc.)
