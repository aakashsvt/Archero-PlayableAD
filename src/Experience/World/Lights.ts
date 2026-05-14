import * as THREE from 'three'
import Experience from '../Experience'
import Debug from '../Utils/Debug'
import GUI from 'lil-gui'

export default class Lights {
    private experience: Experience;
    private scene: THREE.Scene;
    private debug: Debug;
    private debugFolder?: GUI;
    public sunLight!: THREE.DirectionalLight;
    public ambientLight!: THREE.AmbientLight;

    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.debug = this.experience.debug;

        // Debug
        if (this.debug.active && this.debug.ui) {
            this.debugFolder = this.debug.ui.addFolder('lights');
        }

        this.setSunLight();
        this.setAmbientLight();
    }

    private setSunLight(): void {
        this.sunLight = new THREE.DirectionalLight('#ffffff', 4);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.camera.far = 15;
        this.sunLight.shadow.mapSize.set(1024, 1024);
        this.sunLight.shadow.normalBias = 0.05;
        this.sunLight.position.set(3.5, 2, -1.25);
        this.scene.add(this.sunLight);

        // Debug
        if (this.debug.active && this.debugFolder) {
            this.debugFolder
                .add(this.sunLight, 'intensity')
                .name('sunLightIntensity')
                .min(0)
                .max(10)
                .step(0.001);

            this.debugFolder
                .add(this.sunLight.position, 'x')
                .name('sunLightX')
                .min(-5)
                .max(5)
                .step(0.001);

            this.debugFolder
                .add(this.sunLight.position, 'y')
                .name('sunLightY')
                .min(-5)
                .max(5)
                .step(0.001);

            this.debugFolder
                .add(this.sunLight.position, 'z')
                .name('sunLightZ')
                .min(-5)
                .max(5)
                .step(0.001);
        }
    }

    private setAmbientLight(): void {
        this.ambientLight = new THREE.AmbientLight('#ffffff', 1);
        this.scene.add(this.ambientLight);

        // Debug
        if (this.debug.active && this.debugFolder) {
            this.debugFolder
                .add(this.ambientLight, 'intensity')
                .name('ambientIntensity')
                .min(0)
                .max(5)
                .step(0.001);
        }
    }
}
