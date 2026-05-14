import * as THREE from 'three'
import Experience from '../Experience'
import Input from '../Utils/Input'
import Time from '../Utils/Time'
import PlayerMesh from './PlayerMesh'

export default class Player {
    private experience: Experience;
    private time: Time;
    private input: Input;
    public playerMesh: PlayerMesh;

    // Physics state
    private velocity: THREE.Vector3 = new THREE.Vector3();
    
    // Movement configuration
    private maxSpeed: number = 2.5;      // Maximum units per second
    private acceleration: number = 40;   // How fast we reach max speed
    private friction: number = 10;       // How fast we stop (damping)
    private rotationSpeed: number = 15;  // Radians per second

    constructor() {
        this.experience = new Experience();
        this.time = this.experience.time;
        this.input = this.experience.input;
        
        this.playerMesh = new PlayerMesh();
    }

    public update(): void {
        const deltaTime = this.time.delta / 1000;

        // Gather Unified Input (Joystick or Keyboard)
        // input.direction.x is Left/Right, input.direction.y is Up/Down
        const inputDirection = new THREE.Vector3(this.input.direction.x, 0, this.input.direction.y);

        if (inputDirection.length() > 0) {
            // Do not normalize, keep the magnitude from the joystick for analog speed control
            if (inputDirection.length() > 1) {
                 inputDirection.normalize();
            }

            // Apply Acceleration
            const accelVec = inputDirection.clone().multiplyScalar(this.acceleration * deltaTime);
            this.velocity.add(accelVec);

            //  Clamp to Max Speed
            if (this.velocity.length() > this.maxSpeed) {
                this.velocity.setLength(this.maxSpeed);
            }

            // Rotate Mesh towards Velocity
            const targetRotation = Math.atan2(this.velocity.x, this.velocity.z);
            const rotationStep = this.rotationSpeed * deltaTime;
            
            let deltaRotation = targetRotation - this.playerMesh.mesh.rotation.y;
            while (deltaRotation < -Math.PI) deltaRotation += Math.PI * 2;
            while (deltaRotation > Math.PI) deltaRotation -= Math.PI * 2;
            
            this.playerMesh.mesh.rotation.y += deltaRotation * Math.min(rotationStep, 1);
        } else {
            // Apply Friction (Damping) when no input is provided
            // This creates the "organic" stop feel
            const frictionFactor = Math.max(0, 1 - this.friction * deltaTime);
            this.velocity.multiplyScalar(frictionFactor);

            // Stop completely if velocity is very low
            if (this.velocity.length() < 0.01) {
                this.velocity.set(0, 0, 0);
            }
        }

        // Calculate independent movement steps
        const movementStep = this.velocity.clone().multiplyScalar(deltaTime);
        const newPositionX = this.playerMesh.mesh.position.clone().add(new THREE.Vector3(movementStep.x, 0, 0));
        const newPositionZ = this.playerMesh.mesh.position.clone().add(new THREE.Vector3(0, 0, movementStep.z));

        const playerRadius = 0.25; // Half of the 0.5x0.5x0.5 cube width
        const playerHeight = 0.5;
        
        // 1. Check Room Boundaries
        if (this.experience.world.room) {
            const room = this.experience.world.room;
            const boundX = (room.width / 2) - playerRadius;
            const boundZ = (room.length / 2) - playerRadius;

            // X bounds
            if (newPositionX.x < -boundX || newPositionX.x > boundX) {
                this.velocity.x = 0;
                newPositionX.x = THREE.MathUtils.clamp(newPositionX.x, -boundX, boundX);
            }
            
            // Z bounds
            if (newPositionZ.z < -boundZ || newPositionZ.z > boundZ) {
                this.velocity.z = 0;
                newPositionZ.z = THREE.MathUtils.clamp(newPositionZ.z, -boundZ, boundZ);
            }
        }

        // 2. Check Obstacles (AABB Collision)
        if (this.experience.world.obstacles) {
            const obstacles = this.experience.world.obstacles.boundingBoxes;
            
            // Check X movement collision
            const playerBoxX = new THREE.Box3().setFromCenterAndSize(
                new THREE.Vector3(newPositionX.x, playerHeight / 2, this.playerMesh.mesh.position.z),
                new THREE.Vector3(playerRadius * 2, playerHeight, playerRadius * 2)
            );
            
            for (const obsBox of obstacles) {
                if (playerBoxX.intersectsBox(obsBox)) {
                    this.velocity.x = 0;
                    newPositionX.x = this.playerMesh.mesh.position.x; // Revert X movement
                    break;
                }
            }

            // Check Z movement collision (incorporating the new allowed X position to prevent corner snags)
            const playerBoxZ = new THREE.Box3().setFromCenterAndSize(
                new THREE.Vector3(newPositionX.x, playerHeight / 2, newPositionZ.z),
                new THREE.Vector3(playerRadius * 2, playerHeight, playerRadius * 2)
            );

            for (const obsBox of obstacles) {
                if (playerBoxZ.intersectsBox(obsBox)) {
                    this.velocity.z = 0;
                    newPositionZ.z = this.playerMesh.mesh.position.z; // Revert Z movement
                    break;
                }
            }
        }

        // Apply final combined position
        this.playerMesh.mesh.position.set(newPositionX.x, this.playerMesh.mesh.position.y, newPositionZ.z);
    }
}
