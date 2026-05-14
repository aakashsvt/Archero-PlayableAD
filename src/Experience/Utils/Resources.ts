import * as THREE from 'three'
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import EventEmitter from './EventEmitter'
import { Source } from '../sources'

export default class Resources extends EventEmitter {
    public sources: Source[];
    public items: { [key: string]: any };
    public toLoad: number;
    public loaded: number;
    private loaders: {
        gltfLoader: GLTFLoader;
        textureLoader: THREE.TextureLoader;
        cubeTextureLoader: THREE.CubeTextureLoader;
    };

    constructor(sources: Source[]) {
        super();

        this.sources = sources;

        this.items = {};
        this.toLoad = this.sources.length;
        this.loaded = 0;

        this.loaders = {
            gltfLoader: new GLTFLoader(),
            textureLoader: new THREE.TextureLoader(),
            cubeTextureLoader: new THREE.CubeTextureLoader()
        };

        this.startLoading();
    }

    private startLoading(): void {
        // Load each source
        for (const source of this.sources) {
            if (source.type === 'gltfModel') {
                this.loaders.gltfLoader.load(
                    source.path as string,
                    (file: GLTF) => {
                        this.sourceLoaded(source, file);
                    }
                );
            } else if (source.type === 'texture') {
                this.loaders.textureLoader.load(
                    source.path as string,
                    (file: THREE.Texture) => {
                        this.sourceLoaded(source, file);
                    }
                );
            } else if (source.type === 'cubeTexture') {
                this.loaders.cubeTextureLoader.load(
                    source.path as string[],
                    (file: THREE.CubeTexture) => {
                        this.sourceLoaded(source, file);
                    }
                );
            }
        }
    }

    private sourceLoaded(source: Source, file: any): void {
        this.items[source.name] = file;

        this.loaded++;

        if (this.loaded === this.toLoad) {
            this.trigger('ready');
        }
    }
}
