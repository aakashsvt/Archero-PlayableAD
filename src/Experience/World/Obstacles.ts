import * as THREE from 'three'
import Experience from '../Experience'

export default class Obstacles {
    private experience: Experience;
    private scene: THREE.Scene;
    public group: THREE.Group;
    public boundingBoxes: THREE.Box3[] = [];

    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.group = new THREE.Group();
        this.scene.add(this.group);
        
        this.spawnObstacles();
    }

    private spawnObstacles(): void {
        const material = new THREE.MeshStandardMaterial({ color: '#ff0000' });
        const size = 0.5; // 0.5x0.5x0.5 cubes to match grid cell size
        const geometry = new THREE.BoxGeometry(size, size, size);

        // Grid-aligned positions (cell centers are at offsets of .25 or .75)
        const positions = [
            new THREE.Vector3(2.25, 0, 3.25),
            new THREE.Vector3(-2.25, 0, 3.25),
            new THREE.Vector3(0.25, 0, -2.25),
            new THREE.Vector3(-3.25, 0, -4.25),
            new THREE.Vector3(3.25, 0, -4.25),
        ];

        for (const pos of positions) {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(pos.x, size / 2, pos.z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.group.add(mesh);

            // Compute AABB for collision with player
            mesh.updateMatrixWorld();
            const box = new THREE.Box3().setFromObject(mesh);
            this.boundingBoxes.push(box);
        }

        // Delay updating the navGrid until the world is fully constructed
        window.setTimeout(() => {
            const room = this.experience.world.room;
            if (room && room.navGrid) {
                for (const pos of positions) {
                    const margin = 0.1; // Slight margin to ensure we select interior nodes
                    const minNode = room.navGrid.nodeFromWorldPoint(new THREE.Vector3(pos.x - size / 2 + margin, 0, pos.z - size / 2 + margin));
                    const maxNode = room.navGrid.nodeFromWorldPoint(new THREE.Vector3(pos.x + size / 2 - margin, 0, pos.z + size / 2 - margin));

                    for (let x = minNode.gridX; x <= maxNode.gridX; x++) {
                        for (let y = minNode.gridY; y <= maxNode.gridY; y++) {
                            if (room.navGrid.grid[x] && room.navGrid.grid[x][y]) {
                                room.navGrid.grid[x][y].walkable = false;
                            }
                        }
                    }
                }
            }
        }, 0);
    }
}
