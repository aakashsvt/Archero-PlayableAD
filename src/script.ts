import Experience from './Experience/Experience'

const canvas = document.querySelector('canvas.webgl');
if (canvas instanceof HTMLCanvasElement) {
    new Experience(canvas);
} else {
    console.error('Canvas element not found');
}
