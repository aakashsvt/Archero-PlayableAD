import * as THREE from 'three'
import Experience from './Experience'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Sizes from './Utils/Sizes'

export default class Camera {
    private experience: Experience;
    private sizes: Sizes;
    private scene: THREE.Scene;
    private canvas: HTMLCanvasElement;
    public instance!: THREE.PerspectiveCamera;
    public controls!: OrbitControls;

    constructor() {
        this.experience = new Experience();
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;

        this.setInstance();
        this.setControls();
    }

    private setInstance(): void {
        this.instance = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 0.1, 100);
        this.instance.position.set(0, 4, 18);
        this.scene.add(this.instance);
    }

    private setControls(): void {
        this.controls = new OrbitControls(this.instance, this.canvas);
        this.controls.enableDamping = true;
    }

    public resize(): void {
        this.instance.aspect = this.sizes.width / this.sizes.height;
        this.instance.updateProjectionMatrix();
    }

    public update(): void {
        this.controls.update();
    }
}
