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

        // 6. Apply Final Velocity to Position
        this.playerMesh.mesh.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    }
}
