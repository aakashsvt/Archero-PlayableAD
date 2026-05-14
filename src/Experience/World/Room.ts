import * as THREE from 'three'
import Experience from '../Experience'
import { Grid } from '../Helpers/AStar'

export default class Room {
    private experience: Experience;
    private scene: THREE.Scene;
    public group!: THREE.Group;

    public readonly width: number = 10;
    public readonly length: number = 14;
    private readonly wallHeight: number = 1.5;
    private readonly wallThickness: number = 0.5;
    
    // Toggle wall visibility
    public showWalls: boolean = false;
    
    // Navigation Grid
    public navGrid!: Grid;
    public showDebugGrid: boolean = true;

    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;

        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.setGround();
        this.setWalls();
        
        // Initialize A* Grid (0.5x0.5 cells)
        this.navGrid = new Grid(this.width, this.length, 0.25);
        this.setDebugGrid();
    }

    private setGround(): void {
        const geometry = new THREE.PlaneGeometry(this.width, this.length);
        const material = new THREE.MeshStandardMaterial({ color: '#c5f32f' });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI * 0.5;
        mesh.receiveShadow = true;
        this.group.add(mesh);
    }

    private setWalls(): void {
        const material = new THREE.MeshStandardMaterial({ color: '#8b9bb4' });

        // Top Wall (North)
        const topWallGeometry = new THREE.BoxGeometry(this.width + this.wallThickness * 2, this.wallHeight, this.wallThickness);
        const topWall = new THREE.Mesh(topWallGeometry, material);
        topWall.position.set(0, this.wallHeight / 2, -this.length / 2 - this.wallThickness / 2);
        topWall.castShadow = true;
        topWall.receiveShadow = true;
        topWall.visible = this.showWalls;
        this.group.add(topWall);

        // Bottom Wall (South)
        const bottomWall = new THREE.Mesh(topWallGeometry, material);
        bottomWall.position.set(0, this.wallHeight / 2, this.length / 2 + this.wallThickness / 2);
        bottomWall.castShadow = true;
        bottomWall.receiveShadow = true;
        bottomWall.visible = this.showWalls;
        this.group.add(bottomWall);

        // Left Wall (West)
        const sideWallGeometry = new THREE.BoxGeometry(this.wallThickness, this.wallHeight, this.length);
        const leftWall = new THREE.Mesh(sideWallGeometry, material);
        leftWall.position.set(-this.width / 2 - this.wallThickness / 2, this.wallHeight / 2, 0);
        leftWall.castShadow = true;
        leftWall.receiveShadow = true;
        leftWall.visible = this.showWalls;
        this.group.add(leftWall);

        // Right Wall (East)
        const rightWall = new THREE.Mesh(sideWallGeometry, material);
        rightWall.position.set(this.width / 2 + this.wallThickness / 2, this.wallHeight / 2, 0);
        rightWall.castShadow = true;
        rightWall.receiveShadow = true;
        rightWall.visible = this.showWalls;
        this.group.add(rightWall);
    }
    
    private setDebugGrid(): void {
        if (!this.showDebugGrid) return;

        const material = new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.5, transparent: true });
        const points: THREE.Vector3[] = [];

        const startX = -this.width / 2;
        const endX = this.width / 2;
        const startZ = -this.length / 2;
        const endZ = this.length / 2;
        const step = this.navGrid.nodeDiameter;

        // Draw vertical lines
        for (let x = startX; x <= endX; x += step) {
            points.push(new THREE.Vector3(x, 0.01, startZ));
            points.push(new THREE.Vector3(x, 0.01, endZ));
        }

        // Draw horizontal lines
        for (let z = startZ; z <= endZ; z += step) {
            points.push(new THREE.Vector3(startX, 0.01, z));
            points.push(new THREE.Vector3(endX, 0.01, z));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const gridLines = new THREE.LineSegments(geometry, material);
        this.group.add(gridLines);
    }
}
