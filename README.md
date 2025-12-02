# Mario 3D

A fun game in development! 🚧

> **Note:** This project is currently a work in progress and is not fully built yet.

## How to Run

1.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

2.  **Run the Game:**
    ```bash
    python app.py
    ```

3.  **Play:**
    Open your browser and go to `http://127.0.0.1:5000`.

## Features
- **3D Platforming**: Classic movement with acceleration, friction, and jumping.
- **Ray Tracing Effects**: Bloom, SSAO, and SSR for a modern look.
- **NPCs**: Interact with other Mario characters in the world.
- **Dynamic World**: Rotating coins, waving flags, and procedural textures.

## Controls
- **W, A, S, D**: Move Character
- **Space**: Jump
- **Mouse**: Look around (Click to lock cursor)

## Project Structure
- `app.py`: Flask backend
- `static/js/`: Game logic and Three.js components
  - `game.js`: Main game loop
  - `world.js`: Level generation
  - `player.js`: Player physics and control
  - `mario_mesh.js`, `coin_mesh.js`, `cloud_mesh.js`: Asset generation
  - `lights.js`, `materials.js`, `postprocessing.js`: Setup utilities
- `static/css/`: Styles

---
*Built with Python Flask and Three.js*