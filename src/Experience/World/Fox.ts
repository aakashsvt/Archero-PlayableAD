import * as THREE from 'three'
import Experience from '../Experience'
import Resources from '../Utils/Resources'
import Time from '../Utils/Time'
import Debug from '../Utils/Debug'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import GUI from 'lil-gui'

export default class Fox {
    private experience: Experience;
    private scene: THREE.Scene;
    private resources: Resources;
    private time: Time;
    private debug: Debug;
    private debugFolder?: GUI;
    private resource: GLTF;
    public model!: THREE.Group;
    public animation!: {
        mixer: THREE.AnimationMixer;
        actions: {
            idle: THREE.AnimationAction;
            walking: THREE.AnimationAction;
            running: THREE.AnimationAction;
            current: THREE.AnimationAction;
        };
        play: (name: 'idle' | 'walking' | 'running') => void;
    };

    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.time = this.experience.time;
        this.debug = this.experience.debug;

        // Debug
        if (this.debug.active && this.debug.ui) {
            this.debugFolder = this.debug.ui.addFolder('fox');
        }

        // Resource
        this.resource = this.resources.items.foxModel;

        this.setModel();
        this.setAnimation();
    }

    private setModel(): void {
        this.model = this.resource.scene;
        this.model.scale.set(0.02, 0.02, 0.02);
        this.scene.add(this.model);

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
            }
        });
    }

    private setAnimation(): void {
        this.animation = {
            mixer: new THREE.AnimationMixer(this.model),
            actions: {
                idle: null!,
                walking: null!,
                running: null!,
                current: null!
            },
            play: (name: 'idle' | 'walking' | 'running') => {
                const newAction = this.animation.actions[name];
                const oldAction = this.animation.actions.current;

                newAction.reset();
                newAction.play();
                newAction.crossFadeFrom(oldAction, 1);

                this.animation.actions.current = newAction;
            }
        };

        // Actions
        this.animation.actions.idle = this.animation.mixer.clipAction(this.resource.animations[0]);
        this.animation.actions.walking = this.animation.mixer.clipAction(this.resource.animations[1]);
        this.animation.actions.running = this.animation.mixer.clipAction(this.resource.animations[2]);

        this.animation.actions.current = this.animation.actions.idle;
        this.animation.actions.current.play();

        // Debug
        if (this.debug.active && this.debugFolder) {
            const debugObject = {
                playIdle: () => { this.animation.play('idle') },
                playWalking: () => { this.animation.play('walking') },
                playRunning: () => { this.animation.play('running') }
            };
            this.debugFolder.add(debugObject, 'playIdle');
            this.debugFolder.add(debugObject, 'playWalking');
            this.debugFolder.add(debugObject, 'playRunning');
        }
    }

    public update(): void {
        this.animation.mixer.update(this.time.delta * 0.001);
    }
}
