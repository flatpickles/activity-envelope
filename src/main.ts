import REGL from 'regl';
import ActivityEnvelope from './ActivityEnvelope';
import vizFrag from './shaders/viz.frag';
import vizVert from './shaders/viz.vert';

// Create an instance of the ActivityEnvelope class, and set up event listeners
const envelope = new ActivityEnvelope();
document.onkeydown = envelope.activate;
document.onclick = envelope.activate;

// Setup REGL
const canvas = document.getElementById('regl-viz');
if (!canvas) throw new Error('Could not find canvas element');
const regl = REGL(canvas);
const frameFn = regl({
    frag: vizFrag,
    vert: vizVert,
    attributes: {
        position: [
            [-1, -1],
            [-1, 1],
            [1, 1],
            [1, 1],
            [1, -1],
            [-1, -1],
        ],
    },
    uniforms: {
        time: ({ time }) => time,
    },
    count: 6,
});
regl.frame(frameFn);
