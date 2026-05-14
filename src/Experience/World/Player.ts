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
        const inputDirection = new THREE.Vector3();

        // 1. Gather Input
        if (this.input.keys.up) inputDirection.z -= 1;
        if (this.input.keys.down) inputDirection.z += 1;
        if (this.input.keys.left) inputDirection.x -= 1;
        if (this.input.keys.right) inputDirection.x += 1;

        if (inputDirection.length() > 0) {
            inputDirection.normalize();

            // 2. Apply Acceleration
            // velocity = velocity + (direction * acceleration * dt)
            const accelVec = inputDirection.clone().multiplyScalar(this.acceleration * deltaTime);
            this.velocity.add(accelVec);

            // 3. Clamp to Max Speed
            if (this.velocity.length() > this.maxSpeed) {
                this.velocity.setLength(this.maxSpeed);
            }

            // 4. Rotate Mesh towards Velocity
            const targetRotation = Math.atan2(this.velocity.x, this.velocity.z);
            const rotationStep = this.rotationSpeed * deltaTime;
            
            let deltaRotation = targetRotation - this.playerMesh.mesh.rotation.y;
            while (deltaRotation < -Math.PI) deltaRotation += Math.PI * 2;
            while (deltaRotation > Math.PI) deltaRotation -= Math.PI * 2;
            
            this.playerMesh.mesh.rotation.y += deltaRotation * Math.min(rotationStep, 1);
        } else {
            // 5. Apply Friction (Damping) when no input is provided
            // This creates the "organic" stop feel
            const frictionFactor = Math.max(0, 1 - this.friction * deltaTime);
            this.velocity.multiplyScalar(frictionFactor);

            // Stop completely if velocity is very low
            if (this.velocity.length() < 0.01) {
                this.velocity.set(0, 0, 0);
            }
        }

        // 6. Calculate new position
        const newPosition = this.playerMesh.mesh.position.clone().add(this.velocity.clone().multiplyScalar(deltaTime));

        // 7. Clamp Position to Room Boundaries
        const playerRadius = 0.5; // Half of the 1x1x1 cube width
        
        // Wait for the room to be instantiated
        if (this.experience.world.room) {
            const room = this.experience.world.room;
            const boundX = (room.width / 2) - playerRadius;
            const boundZ = (room.length / 2) - playerRadius;

            // Stop velocity if hitting a wall to prevent "sliding" against it indefinitely
            if (newPosition.x < -boundX || newPosition.x > boundX) this.velocity.x = 0;
            if (newPosition.z < -boundZ || newPosition.z > boundZ) this.velocity.z = 0;

            newPosition.x = THREE.MathUtils.clamp(newPosition.x, -boundX, boundX);
            newPosition.z = THREE.MathUtils.clamp(newPosition.z, -boundZ, boundZ);
        }

        // Apply clamped position
        this.playerMesh.mesh.position.copy(newPosition);
    }
}
