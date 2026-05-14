import Experience from '../Experience'
import Resources from '../Utils/Resources'
import Lights from './Lights'
import Ground from './Ground'
import Player from './Player'

export default class World {
    private experience: Experience;
    private resources: Resources;
    public ground!: Ground;
    public lights!: Lights;
    public player!: Player;

    constructor() {
        this.experience = new Experience();
        this.resources = this.experience.resources;

        // Setup if already ready
        if (this.resources.loaded === this.resources.toLoad) {
            this.setup();
        } else {
            // Wait for resources
            this.resources.on('ready', () => {
                this.setup();
            });
        }
    }

    private setup(): void {
        this.ground = new Ground();
        this.lights = new Lights();
        this.player = new Player();
    }

    public update(): void {
        if (this.player) {
            this.player.update();
        }
    }
}
