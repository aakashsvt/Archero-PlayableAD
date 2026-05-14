import * as THREE from 'three'
import EventEmitter from './EventEmitter'

export default class Input extends EventEmitter {
    // Legacy keyboard state
    public keys: { [key: string]: boolean };
    
    // Unified movement direction (-1 to 1 on X and Z axes)
    public direction: THREE.Vector2;
    
    // Joystick state
    private joystickZone: HTMLElement | null;
    private joystickBase: HTMLElement | null;
    private joystickStick: HTMLElement | null;
    private isDragging: boolean = false;
    private center: THREE.Vector2 = new THREE.Vector2();
    private maxRadius: number = 60; // Half of 120px base width

    constructor() {
        super();

        this.direction = new THREE.Vector2(0, 0);
        this.keys = { up: false, down: false, left: false, right: false };

        // 1. Setup Keyboard
        window.addEventListener('keydown', (e) => this.onKeyChange(e.code, true));
        window.addEventListener('keyup', (e) => this.onKeyChange(e.code, false));

        // 2. Setup Joystick
        this.joystickZone = document.getElementById('joystick-zone');
        this.joystickBase = document.getElementById('joystick-base');
        this.joystickStick = document.getElementById('joystick-stick');

        if (this.joystickZone) {
            // Mouse Events (for desktop testing)
            this.joystickZone.addEventListener('mousedown', this.onStart.bind(this));
            window.addEventListener('mousemove', this.onMove.bind(this));
            window.addEventListener('mouseup', this.onEnd.bind(this));

            // Touch Events (for mobile)
            this.joystickZone.addEventListener('touchstart', this.onStart.bind(this), { passive: false });
            window.addEventListener('touchmove', this.onMove.bind(this), { passive: false });
            window.addEventListener('touchend', this.onEnd.bind(this));
            window.addEventListener('touchcancel', this.onEnd.bind(this));
        }
    }

    // --- KEYBOARD LOGIC ---
    private onKeyChange(code: string, isPressed: boolean): void {
        switch (code) {
            case 'ArrowUp': case 'KeyW': this.keys.up = isPressed; break;
            case 'ArrowDown': case 'KeyS': this.keys.down = isPressed; break;
            case 'ArrowLeft': case 'KeyA': this.keys.left = isPressed; break;
            case 'ArrowRight': case 'KeyD': this.keys.right = isPressed; break;
        }
        this.updateDirectionFromKeys();
    }

    private updateDirectionFromKeys(): void {
        if (this.isDragging) return; // Joystick takes precedence if active

        this.direction.set(0, 0);
        if (this.keys.up) this.direction.y -= 1;
        if (this.keys.down) this.direction.y += 1;
        if (this.keys.left) this.direction.x -= 1;
        if (this.keys.right) this.direction.x += 1;

        if (this.direction.length() > 0) {
            this.direction.normalize();
        }
    }

    // --- JOYSTICK LOGIC ---
    private getEventPosition(event: MouseEvent | TouchEvent): { clientX: number, clientY: number } {
        if (window.TouchEvent && event instanceof TouchEvent) {
            return {
                clientX: event.targetTouches[0].clientX,
                clientY: event.targetTouches[0].clientY
            };
        }
        return event as MouseEvent;
    }

    private onStart(event: MouseEvent | TouchEvent): void {
        if (event.cancelable) event.preventDefault();
        
        this.isDragging = true;

        if (this.joystickBase && this.joystickStick) {
            // Calculate center of the static base
            const rect = this.joystickBase.getBoundingClientRect();
            this.center.set(rect.left + rect.width / 2, rect.top + rect.height / 2);
            
            this.onMove(event); // Immediately update stick position
        }
    }

    private onMove(event: MouseEvent | TouchEvent): void {
        if (!this.isDragging) return;
        if (event.cancelable) event.preventDefault();

        const pos = this.getEventPosition(event);
        
        // Calculate delta from center
        const deltaX = pos.clientX - this.center.x;
        const deltaY = pos.clientY - this.center.y;

        // Calculate distance and clamp to max radius
        let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        let normalizedX = deltaX;
        let normalizedY = deltaY;

        if (distance > this.maxRadius) {
            const ratio = this.maxRadius / distance;
            normalizedX *= ratio;
            normalizedY *= ratio;
            distance = this.maxRadius;
        }

        // Update visual stick position
        if (this.joystickStick) {
            this.joystickStick.style.transform = `translate(-50%, -50%) translate(${normalizedX}px, ${normalizedY}px)`;
        }

        // Update logical direction (-1 to 1)
        this.direction.set(normalizedX / this.maxRadius, normalizedY / this.maxRadius);
    }

    private onEnd(): void {
        this.isDragging = false;
        
        if (this.joystickBase && this.joystickStick) {
            // Reset stick to center visually
            this.joystickStick.style.transform = `translate(-50%, -50%) translate(0px, 0px)`;
            
            // Reset base to default CSS position
            this.joystickBase.style.left = '50%';
            this.joystickBase.style.top = 'auto';
            this.joystickBase.style.bottom = '50px';
            this.joystickBase.style.transform = 'translateX(-50%)';
        }

        this.direction.set(0, 0);
        this.updateDirectionFromKeys(); // Fallback to keyboard if keys are still held
    }
}
