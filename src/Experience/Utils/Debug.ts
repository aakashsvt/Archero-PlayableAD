import GUI from 'lil-gui'

export default class Debug {
    public active: boolean;
    public ui?: GUI;

    constructor() {
        this.active = window.location.hash === '#debug';

        if (this.active) {
            this.ui = new GUI();
        }
    }
}
