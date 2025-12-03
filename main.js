import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene setup
let scene, camera, renderer, controls;
let mazeLevels = [];
let balls = [];
let tiltX = 0, tiltY = 0;
let targetTiltX = 0, targetTiltY = 0;
let mouseDown = false;
let mouseStart = { x: 0, y: 0 };
const TOTAL_LEVELS = 5;
const BALL_RADIUS = 0.009; // 18mm diameter = 9mm radius in meters
const NUM_BALLS = 6; // Number of balls to create
const GRAVITY = 0.00015;
const FRICTION = 0.98;
const BOUNCE_DAMPING = 0.6;
const LEVEL_HEIGHT = 0.08; // 8cm between levels
const MAZE_SIZE = 0.4; // 40cm x 40cm maze
const WALL_HEIGHT = 0.04; // 4cm wall height
const WALL_THICKNESS = 0.008; // 8mm wall thickness
const HOLE_RADIUS = 0.025; // 2.5cm hole radius

// Maze configurations for each level
const mazeConfigs = [
    {
        color: 0xff6b6b,
        walls: [
            // Level 1 - Simple cross pattern
            { x: -0.1, z: 0, width: 0.2, depth: WALL_THICKNESS },
            { x: 0, z: -0.1, width: WALL_THICKNESS, depth: 0.2 },
        ]
    },
    {
        color: 0x4ecdc4,
        walls: [
            // Level 2 - Spiral pattern
            { x: -0.15, z: 0.05, width: 0.25, depth: WALL_THICKNESS },
            { x: 0.05, z: -0.05, width: WALL_THICKNESS, depth: 0.2 },
            { x: 0, z: -0.12, width: 0.15, depth: WALL_THICKNESS },
        ]
    },
    {
        color: 0xffd93d,
        walls: [
            // Level 3 - Zigzag pattern
            { x: -0.08, z: 0.08, width: 0.15, depth: WALL_THICKNESS },
            { x: 0.08, z: 0, width: 0.15, depth: WALL_THICKNESS },
            { x: -0.08, z: -0.08, width: 0.15, depth: WALL_THICKNESS },
        ]
    },
    {
        color: 0x95e1d3,
        walls: [
            // Level 4 - Corner obstacles
            { x: -0.12, z: -0.12, width: 0.1, depth: WALL_THICKNESS },
            { x: 0.12, z: -0.12, width: 0.1, depth: WALL_THICKNESS },
            { x: -0.12, z: 0.12, width: 0.1, depth: WALL_THICKNESS },
            { x: 0.12, z: 0.12, width: 0.1, depth: WALL_THICKNESS },
        ]
    },
    {
        color: 0xc77dff,
        walls: [
            // Level 5 - Complex maze
            { x: -0.1, z: 0.1, width: 0.18, depth: WALL_THICKNESS },
            { x: 0.1, z: -0.1, width: 0.18, depth: WALL_THICKNESS },
            { x: -0.05, z: -0.05, width: WALL_THICKNESS, depth: 0.15 },
            { x: 0.08, z: 0.05, width: WALL_THICKNESS, depth: 0.12 },
        ]
    }
];

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 1, 3);

    // Camera
    camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.01,
        100
    );
    camera.position.set(0.6, 0.8, 0.6);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('container').appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 2, 1);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x4fc3f7, 0.5);
    pointLight1.position.set(-0.5, 0.5, 0.5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff6b9d, 0.5);
    pointLight2.position.set(0.5, 0.5, -0.5);
    scene.add(pointLight2);

    // Create maze levels
    createMazeLevels();

    // Create balls
    createBalls();

    // Mouse controls
    setupMouseControls();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Animation loop
    animate();
}

function createMazeLevels() {
    const mazeGroup = new THREE.Group();
    scene.add(mazeGroup);
    window.mazeGroup = mazeGroup;

    for (let i = 0; i < TOTAL_LEVELS; i++) {
        const levelGroup = new THREE.Group();
        const yPosition = i * LEVEL_HEIGHT;
        levelGroup.position.y = yPosition;

        const config = mazeConfigs[i];

        // Floor (base plate with hole)
        const floorShape = new THREE.Shape();
        floorShape.moveTo(-MAZE_SIZE / 2, -MAZE_SIZE / 2);
        floorShape.lineTo(MAZE_SIZE / 2, -MAZE_SIZE / 2);
        floorShape.lineTo(MAZE_SIZE / 2, MAZE_SIZE / 2);
        floorShape.lineTo(-MAZE_SIZE / 2, MAZE_SIZE / 2);
        floorShape.lineTo(-MAZE_SIZE / 2, -MAZE_SIZE / 2);

        // Create hole in center
        const holePath = new THREE.Path();
        holePath.absarc(0, 0, HOLE_RADIUS, 0, Math.PI * 2, true);
        floorShape.holes.push(holePath);

        const floorGeometry = new THREE.ExtrudeGeometry(floorShape, {
            depth: 0.002,
            bevelEnabled: false
        });
        floorGeometry.rotateX(-Math.PI / 2);

        const floorMaterial = new THREE.MeshStandardMaterial({
            color: config.color,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide,
            metalness: 0.3,
            roughness: 0.4
        });

        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.receiveShadow = true;
        floor.position.y = -0.001;
        levelGroup.add(floor);

        // Outer walls (6 sides - actually 4 for rectangle)
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: config.color,
            transparent: true,
            opacity: 0.85,
            metalness: 0.2,
            roughness: 0.5
        });

        // North wall
        const northWall = createWall(MAZE_SIZE, WALL_THICKNESS, WALL_HEIGHT, wallMaterial);
        northWall.position.set(0, WALL_HEIGHT / 2, -MAZE_SIZE / 2);
        levelGroup.add(northWall);

        // South wall
        const southWall = createWall(MAZE_SIZE, WALL_THICKNESS, WALL_HEIGHT, wallMaterial);
        southWall.position.set(0, WALL_HEIGHT / 2, MAZE_SIZE / 2);
        levelGroup.add(southWall);

        // East wall
        const eastWall = createWall(WALL_THICKNESS, MAZE_SIZE, WALL_HEIGHT, wallMaterial);
        eastWall.position.set(MAZE_SIZE / 2, WALL_HEIGHT / 2, 0);
        levelGroup.add(eastWall);

        // West wall
        const westWall = createWall(WALL_THICKNESS, MAZE_SIZE, WALL_HEIGHT, wallMaterial);
        westWall.position.set(-MAZE_SIZE / 2, WALL_HEIGHT / 2, 0);
        levelGroup.add(westWall);

        // Inner walls according to pattern
        config.walls.forEach(wallConfig => {
            const innerWall = createWall(
                wallConfig.width,
                wallConfig.depth,
                WALL_HEIGHT,
                wallMaterial
            );
            innerWall.position.set(wallConfig.x, WALL_HEIGHT / 2, wallConfig.z);
            levelGroup.add(innerWall);
        });

        mazeGroup.add(levelGroup);
        mazeLevels.push({
            group: levelGroup,
            config: config,
            yPosition: yPosition
        });
    }
}

function createWall(width, depth, height, material) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function createBalls() {
    const geometry = new THREE.SphereGeometry(BALL_RADIUS, 32, 32);

    // Create environment map for reflections
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
    const cubeCamera = new THREE.CubeCamera(0.01, 10, cubeRenderTarget);
    scene.add(cubeCamera);
    window.cubeCamera = cubeCamera;

    // Starting positions for balls (distributed around the top level)
    const startPositions = [
        { x: -0.15, z: -0.15 },
        { x: -0.15, z: 0.15 },
        { x: 0.15, z: -0.15 },
        { x: 0.15, z: 0.15 },
        { x: -0.15, z: 0 },
        { x: 0.15, z: 0 }
    ];

    for (let i = 0; i < NUM_BALLS; i++) {
        // Create reflective metal material
        const material = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            metalness: 0.95,
            roughness: 0.1,
            envMapIntensity: 1.5
        });
        material.envMap = cubeRenderTarget.texture;

        const ballMesh = new THREE.Mesh(geometry, material);
        ballMesh.castShadow = true;

        // Position ball
        const startPos = startPositions[i];
        const ballData = {
            mesh: ballMesh,
            position: {
                x: startPos.x,
                y: mazeLevels[0].yPosition + 0.01 + BALL_RADIUS,
                z: startPos.z
            },
            velocity: { x: 0, y: 0, z: 0 },
            currentLevel: 0,
            isFalling: false,
            fallTarget: null
        };

        ballMesh.position.set(ballData.position.x, ballData.position.y, ballData.position.z);
        scene.add(ballMesh);
        balls.push(ballData);
    }
}

function setupMouseControls() {
    const container = renderer.domElement;

    container.addEventListener('mousedown', (e) => {
        mouseDown = true;
        mouseStart.x = e.clientX;
        mouseStart.y = e.clientY;
    });

    container.addEventListener('mousemove', (e) => {
        if (mouseDown) {
            const deltaX = e.clientX - mouseStart.x;
            const deltaY = e.clientY - mouseStart.y;

            targetTiltX = Math.max(-0.3, Math.min(0.3, -deltaY * 0.001));
            targetTiltY = Math.max(-0.3, Math.min(0.3, deltaX * 0.001));
        }
    });

    container.addEventListener('mouseup', () => {
        mouseDown = false;
    });

    container.addEventListener('mouseleave', () => {
        mouseDown = false;
    });

    // Touch support
    container.addEventListener('touchstart', (e) => {
        mouseDown = true;
        mouseStart.x = e.touches[0].clientX;
        mouseStart.y = e.touches[0].clientY;
    });

    container.addEventListener('touchmove', (e) => {
        if (mouseDown) {
            const deltaX = e.touches[0].clientX - mouseStart.x;
            const deltaY = e.touches[0].clientY - mouseStart.y;

            targetTiltX = Math.max(-0.3, Math.min(0.3, -deltaY * 0.001));
            targetTiltY = Math.max(-0.3, Math.min(0.3, deltaX * 0.001));
        }
    });

    container.addEventListener('touchend', () => {
        mouseDown = false;
    });
}

function updatePhysics() {
    if (balls.length === 0 || mazeLevels.length === 0) return;

    // Smooth tilt interpolation
    tiltX += (targetTiltX - tiltX) * 0.1;
    tiltY += (targetTiltY - tiltY) * 0.1;

    // Apply tilt to maze
    window.mazeGroup.rotation.x = tiltX;
    window.mazeGroup.rotation.z = tiltY;

    // Apply gravity based on tilt
    const gravityX = Math.sin(tiltY) * GRAVITY;
    const gravityZ = Math.sin(tiltX) * GRAVITY;

    // Update each ball
    balls.forEach((ballData, ballIndex) => {
        if (ballData.isFalling) {
            // Ball is falling to next level
            ballData.velocity.y -= GRAVITY * 3;
            ballData.position.y += ballData.velocity.y;

            ballData.mesh.position.set(ballData.position.x, ballData.position.y, ballData.position.z);

            // Check if reached target level
            if (ballData.fallTarget && ballData.position.y <= ballData.fallTarget.yPosition + BALL_RADIUS + 0.01) {
                ballData.position.y = ballData.fallTarget.yPosition + BALL_RADIUS + 0.01;
                ballData.velocity.y = -ballData.velocity.y * BOUNCE_DAMPING;

                if (Math.abs(ballData.velocity.y) < 0.0001) {
                    ballData.isFalling = false;
                    ballData.fallTarget = null;
                    ballData.currentLevel++;
                }

                ballData.mesh.position.set(ballData.position.x, ballData.position.y, ballData.position.z);
            }
            return;
        }

        // Apply gravity
        ballData.velocity.x += gravityX;
        ballData.velocity.z += gravityZ;

        // Apply friction
        ballData.velocity.x *= FRICTION;
        ballData.velocity.z *= FRICTION;

        // Update position
        ballData.position.x += ballData.velocity.x;
        ballData.position.z += ballData.velocity.z;

        // Collision detection with walls
        const level = mazeLevels[ballData.currentLevel];
        if (level) {
            // Boundary walls
            if (ballData.position.x - BALL_RADIUS < -MAZE_SIZE / 2) {
                ballData.position.x = -MAZE_SIZE / 2 + BALL_RADIUS;
                ballData.velocity.x = -ballData.velocity.x * BOUNCE_DAMPING;
            }
            if (ballData.position.x + BALL_RADIUS > MAZE_SIZE / 2) {
                ballData.position.x = MAZE_SIZE / 2 - BALL_RADIUS;
                ballData.velocity.x = -ballData.velocity.x * BOUNCE_DAMPING;
            }
            if (ballData.position.z - BALL_RADIUS < -MAZE_SIZE / 2) {
                ballData.position.z = -MAZE_SIZE / 2 + BALL_RADIUS;
                ballData.velocity.z = -ballData.velocity.z * BOUNCE_DAMPING;
            }
            if (ballData.position.z + BALL_RADIUS > MAZE_SIZE / 2) {
                ballData.position.z = MAZE_SIZE / 2 - BALL_RADIUS;
                ballData.velocity.z = -ballData.velocity.z * BOUNCE_DAMPING;
            }

            // Inner walls collision
            level.config.walls.forEach(wallConfig => {
                const halfWidth = wallConfig.width / 2;
                const halfDepth = wallConfig.depth / 2;

                const closestX = Math.max(wallConfig.x - halfWidth, Math.min(ballData.position.x, wallConfig.x + halfWidth));
                const closestZ = Math.max(wallConfig.z - halfDepth, Math.min(ballData.position.z, wallConfig.z + halfDepth));

                const distanceX = ballData.position.x - closestX;
                const distanceZ = ballData.position.z - closestZ;
                const distance = Math.sqrt(distanceX * distanceX + distanceZ * distanceZ);

                if (distance < BALL_RADIUS) {
                    const overlap = BALL_RADIUS - distance;
                    if (distance > 0) {
                        ballData.position.x += (distanceX / distance) * overlap;
                        ballData.position.z += (distanceZ / distance) * overlap;

                        // Reflect velocity
                        const normal = { x: distanceX / distance, z: distanceZ / distance };
                        const dot = ballData.velocity.x * normal.x + ballData.velocity.z * normal.z;
                        ballData.velocity.x = (ballData.velocity.x - 2 * dot * normal.x) * BOUNCE_DAMPING;
                        ballData.velocity.z = (ballData.velocity.z - 2 * dot * normal.z) * BOUNCE_DAMPING;
                    }
                }
            });

            // Ball-to-ball collision
            balls.forEach((otherBall, otherIndex) => {
                if (ballIndex !== otherIndex && ballData.currentLevel === otherBall.currentLevel && !otherBall.isFalling) {
                    const dx = ballData.position.x - otherBall.position.x;
                    const dz = ballData.position.z - otherBall.position.z;
                    const distance = Math.sqrt(dx * dx + dz * dz);

                    if (distance < BALL_RADIUS * 2) {
                        const overlap = BALL_RADIUS * 2 - distance;
                        if (distance > 0) {
                            const nx = dx / distance;
                            const nz = dz / distance;

                            // Separate balls
                            ballData.position.x += nx * overlap * 0.5;
                            ballData.position.z += nz * overlap * 0.5;
                            otherBall.position.x -= nx * overlap * 0.5;
                            otherBall.position.z -= nz * overlap * 0.5;

                            // Exchange velocities (simplified elastic collision)
                            const relVelX = ballData.velocity.x - otherBall.velocity.x;
                            const relVelZ = ballData.velocity.z - otherBall.velocity.z;
                            const dot = relVelX * nx + relVelZ * nz;

                            if (dot < 0) {
                                ballData.velocity.x -= dot * nx * BOUNCE_DAMPING;
                                ballData.velocity.z -= dot * nz * BOUNCE_DAMPING;
                                otherBall.velocity.x += dot * nx * BOUNCE_DAMPING;
                                otherBall.velocity.z += dot * nz * BOUNCE_DAMPING;
                            }
                        }
                    }
                }
            });

            // Check if ball is over the hole
            const distanceFromCenter = Math.sqrt(ballData.position.x * ballData.position.x + ballData.position.z * ballData.position.z);
            if (distanceFromCenter < HOLE_RADIUS - BALL_RADIUS * 0.5) {
                // Ball falls through hole
                if (ballData.currentLevel < TOTAL_LEVELS - 1) {
                    ballData.isFalling = true;
                    ballData.fallTarget = mazeLevels[ballData.currentLevel + 1];
                    ballData.velocity.x = 0;
                    ballData.velocity.z = 0;
                } else {
                    // Reached the bottom!
                    console.log("Ball completed the maze!");
                }
            }
        }

        ballData.mesh.position.set(ballData.position.x, ballData.position.y, ballData.position.z);

        // Update rotation based on velocity (rolling effect)
        ballData.mesh.rotation.x += ballData.velocity.z * 10;
        ballData.mesh.rotation.z -= ballData.velocity.x * 10;
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    updatePhysics();

    // Update environment map for ball reflections (use first ball as reference)
    if (window.cubeCamera && balls.length > 0) {
        balls.forEach(ball => ball.mesh.visible = false);
        window.cubeCamera.position.copy(balls[0].mesh.position);
        window.cubeCamera.update(renderer, scene);
        balls.forEach(ball => ball.mesh.visible = true);
    }

    renderer.render(scene, camera);
}

// Initialize the application
init();
