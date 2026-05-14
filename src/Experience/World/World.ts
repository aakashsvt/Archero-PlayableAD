import Experience from '../Experience'
import Resources from '../Utils/Resources'
import Environment from './Environment'
import Floor from './Floor'
import Fox from './Fox'

export default class World {
    private experience: Experience;
    private resources: Resources;
    public environment!: Environment;
    public floor!: Floor;
    public fox!: Fox;

    constructor() {
        this.experience = new Experience();
        this.resources = this.experience.resources;

        // Wait for resources
        this.resources.on('ready', () => {
            // Setup
            this.floor = new Floor();
            this.fox = new Fox();
            this.environment = new Environment();
        });
    }

    public update(): void {
        if (this.fox) {
            this.fox.update();
        }
    }
}
