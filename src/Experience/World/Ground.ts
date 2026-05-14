import * as THREE from 'three'
import Experience from '../Experience'

export default class Ground {
    private experience: Experience;
    private scene: THREE.Scene;
    private geometry!: THREE.PlaneGeometry;
    private material!: THREE.MeshStandardMaterial;
    public mesh!: THREE.Mesh;

    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;

        this.setGeometry();
        this.setMaterial();
        this.setMesh();
    }

    private setGeometry(): void {
        this.geometry = new THREE.PlaneGeometry(6, 11);
    }

    private setMaterial(): void {
        this.material = new THREE.MeshStandardMaterial({
            color: "#c5f32f",
        });
    }

    private setMesh(): void {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.x = -Math.PI * 0.5;
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);
    }
}
