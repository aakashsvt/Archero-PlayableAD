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

    // Movement configuration
    private moveSpeed: number = 3; // Units per second
    private rotationSpeed: number = 20; // Radians per second

    constructor() {
        this.experience = new Experience();
        this.time = this.experience.time;
        this.input = this.experience.input;
        
        // Initialize the simple cube mesh
        this.playerMesh = new PlayerMesh();
    }

    public update(): void {
        const movement = new THREE.Vector3();

        if (this.input.keys.up) movement.z -= 1;
        if (this.input.keys.down) movement.z += 1;
        if (this.input.keys.left) movement.x -= 1;
        if (this.input.keys.right) movement.x += 1;

        if (movement.length() > 0) {
            movement.normalize();
            
            // Convert delta from milliseconds to seconds
            const deltaTimeInSeconds = this.time.delta / 1000;
            
            // Move player mesh
            const frameDistance = this.moveSpeed * deltaTimeInSeconds;
            this.playerMesh.mesh.position.add(movement.clone().multiplyScalar(frameDistance));

            // Rotate towards movement direction
            const targetRotation = Math.atan2(movement.x, movement.z);
            const rotationStep = this.rotationSpeed * deltaTimeInSeconds;
            
            // Shortest path rotation logic (handling PI/-PI wrap around)
            let deltaRotation = targetRotation - this.playerMesh.mesh.rotation.y;
            while (deltaRotation < -Math.PI) deltaRotation += Math.PI * 2;
            while (deltaRotation > Math.PI) deltaRotation -= Math.PI * 2;
            
            this.playerMesh.mesh.rotation.y += deltaRotation * Math.min(rotationStep, 1);
        }
    }
}
