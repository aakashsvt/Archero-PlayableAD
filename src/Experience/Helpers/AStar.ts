import * as THREE from 'three';

export class Node {
    public gridX: number;
    public gridY: number;
    public walkable: boolean;
    public worldPosition: THREE.Vector3;

    public gCost: number = 0;
    public hCost: number = 0;
    public parent: Node | null = null;

    constructor(walkable: boolean, worldPosition: THREE.Vector3, gridX: number, gridY: number) {
        this.walkable = walkable;
        this.worldPosition = worldPosition;
        this.gridX = gridX;
        this.gridY = gridY;
    }

    public get fCost(): number {
        return this.gCost + this.hCost;
    }
}

export class Grid {
    public grid: Node[][] = [];
    public gridSizeX: number;
    public gridSizeY: number;
    public nodeRadius: number;
    public nodeDiameter: number;

    constructor(gridSizeX: number, gridSizeY: number, nodeRadius: number) {
        this.gridSizeX = gridSizeX;
        this.gridSizeY = gridSizeY;
        this.nodeRadius = nodeRadius;
        this.nodeDiameter = nodeRadius * 2;
        this.createGrid();
    }

    private createGrid(): void {
        const worldBottomLeft = new THREE.Vector3(
            -this.gridSizeX / 2,
            0,
            -this.gridSizeY / 2
        );

        const cols = Math.round(this.gridSizeX / this.nodeDiameter);
        const rows = Math.round(this.gridSizeY / this.nodeDiameter);

        for (let x = 0; x < cols; x++) {
            this.grid[x] = [];
            for (let y = 0; y < rows; y++) {
                const worldPoint = worldBottomLeft.clone().add(
                    new THREE.Vector3(
                        x * this.nodeDiameter + this.nodeRadius,
                        0,
                        y * this.nodeDiameter + this.nodeRadius
                    )
                );
                // Initially all walkable
                this.grid[x][y] = new Node(true, worldPoint, x, y);
            }
        }
    }

    public nodeFromWorldPoint(worldPosition: THREE.Vector3): Node {
        const percentX = (worldPosition.x + this.gridSizeX / 2) / this.gridSizeX;
        const percentY = (worldPosition.z + this.gridSizeY / 2) / this.gridSizeY;

        const clampedX = THREE.MathUtils.clamp(percentX, 0, 1);
        const clampedY = THREE.MathUtils.clamp(percentY, 0, 1);

        const cols = Math.round(this.gridSizeX / this.nodeDiameter);
        const rows = Math.round(this.gridSizeY / this.nodeDiameter);

        let x = Math.floor(clampedX * cols);
        let y = Math.floor(clampedY * rows);

        // Prevent out of bounds
        if (x === cols) x--;
        if (y === rows) y--;

        return this.grid[x][y];
    }

    public getNeighbors(node: Node): Node[] {
        const neighbors: Node[] = [];
        const cols = Math.round(this.gridSizeX / this.nodeDiameter);
        const rows = Math.round(this.gridSizeY / this.nodeDiameter);

        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                if (x === 0 && y === 0) continue;

                const checkX = node.gridX + x;
                const checkY = node.gridY + y;

                if (checkX >= 0 && checkX < cols && checkY >= 0 && checkY < rows) {
                    neighbors.push(this.grid[checkX][checkY]);
                }
            }
        }
        return neighbors;
    }
}

export class AStar {
    public grid: Grid;

    constructor(grid: Grid) {
        this.grid = grid;
    }

    public findPath(startPos: THREE.Vector3, targetPos: THREE.Vector3): Node[] | null {
        const startNode = this.grid.nodeFromWorldPoint(startPos);
        const targetNode = this.grid.nodeFromWorldPoint(targetPos);

        const openSet: Node[] = [];
        const closedSet: Set<Node> = new Set();

        openSet.push(startNode);

        while (openSet.length > 0) {
            let currentNode = openSet[0];
            let currentIndex = 0;

            for (let i = 1; i < openSet.length; i++) {
                if (openSet[i].fCost < currentNode.fCost || 
                   (openSet[i].fCost === currentNode.fCost && openSet[i].hCost < currentNode.hCost)) {
                    currentNode = openSet[i];
                    currentIndex = i;
                }
            }

            openSet.splice(currentIndex, 1);
            closedSet.add(currentNode);

            if (currentNode === targetNode) {
                return this.retracePath(startNode, targetNode);
            }

            const neighbors = this.grid.getNeighbors(currentNode);
            for (const neighbor of neighbors) {
                if (!neighbor.walkable || closedSet.has(neighbor)) {
                    continue;
                }

                const moveCost = this.getDistance(currentNode, neighbor);
                const newMovementCostToNeighbor = currentNode.gCost + moveCost;

                if (newMovementCostToNeighbor < neighbor.gCost || !openSet.includes(neighbor)) {
                    neighbor.gCost = newMovementCostToNeighbor;
                    neighbor.hCost = this.getDistance(neighbor, targetNode);
                    neighbor.parent = currentNode;

                    if (!openSet.includes(neighbor)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }

        return null; // No path found
    }

    private retracePath(startNode: Node, endNode: Node): Node[] {
        const path: Node[] = [];
        let currentNode: Node | null = endNode;

        while (currentNode !== startNode && currentNode !== null) {
            path.push(currentNode);
            currentNode = currentNode.parent;
        }

        path.reverse();
        return path;
    }

    private getDistance(nodeA: Node, nodeB: Node): number {
        const dstX = Math.abs(nodeA.gridX - nodeB.gridX);
        const dstY = Math.abs(nodeA.gridY - nodeB.gridY);

        if (dstX > dstY) {
            return 14 * dstY + 10 * (dstX - dstY);
        }
        return 14 * dstX + 10 * (dstY - dstX);
    }
}
