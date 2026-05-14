import * as THREE from 'three'
import Experience from '../Experience'

export default class PlayerMesh {
    private experience: Experience;
    private scene: THREE.Scene;
    private meshScale: number;
    public mesh!: THREE.Mesh;
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.meshScale = 0.5;
        this.setMesh();
    }

    private setMesh(): void {
        const geometry = new THREE.BoxGeometry(this.meshScale, this.meshScale, this.meshScale);
        const material = new THREE.MeshStandardMaterial({ color: 0x0066ff }); // Bright Blue
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.position.y = this.meshScale / 2; // Sit on the ground
        this.scene.add(this.mesh);
    }

    public destroy(): void {
        this.mesh.geometry.dispose();
        (this.mesh.material as THREE.Material).dispose();
        this.scene.remove(this.mesh);
    }
}
