export interface Source {
    name: string;
    type: 'cubeTexture' | 'texture' | 'gltfModel';
    path: string | string[];
}

const sources: Source[] = [];

export default sources;
