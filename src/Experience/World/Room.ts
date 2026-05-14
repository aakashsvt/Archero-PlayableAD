import * as THREE from 'three'
import Experience from '../Experience'

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

    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;

        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.setGround();
        this.setWalls();
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
}
