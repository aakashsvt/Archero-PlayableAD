import EventEmitter from './EventEmitter'

export default class Input extends EventEmitter {
    public keys: { [key: string]: boolean };

    constructor() {
        super();

        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };

        window.addEventListener('keydown', (event) => {
            this.onKeyChange(event.code, true);
        });

        window.addEventListener('keyup', (event) => {
            this.onKeyChange(event.code, false);
        });
    }

    private onKeyChange(code: string, isPressed: boolean): void {
        switch (code) {
            case 'ArrowUp':
            case 'KeyW':
                this.keys.up = isPressed;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.keys.down = isPressed;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.keys.left = isPressed;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.keys.right = isPressed;
                break;
        }

        this.trigger('keyChange');
    }
}
