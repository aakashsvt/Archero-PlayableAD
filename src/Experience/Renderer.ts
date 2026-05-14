import * as THREE from 'three'
import Experience from './Experience'
import Sizes from './Utils/Sizes'
import Camera from './Camera'

export default class Renderer {
    private experience: Experience;
    private canvas: HTMLCanvasElement;
    private sizes: Sizes;
    private scene: THREE.Scene;
    private camera: Camera;
    public instance!: THREE.WebGLRenderer;

    constructor() {
        this.experience = new Experience();
        this.canvas = this.experience.canvas;
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.camera = this.experience.camera;

        this.setInstance();
    }

    private setInstance(): void {
        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.instance.toneMapping = THREE.CineonToneMapping;
        this.instance.toneMappingExposure = 1.75;
        this.instance.shadowMap.enabled = true;
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
        this.instance.setClearColor("#75ddfd");
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(this.sizes.pixelRatio);
    }

    public resize(): void {
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(this.sizes.pixelRatio);
    }

    public update(): void {
        this.instance.render(this.scene, this.camera.instance);
    }
}
