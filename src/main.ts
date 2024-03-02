import ActivityEnvelope from './ActivityEnvelope';

// Create an instance of the ActivityEnvelope class, and set up event listeners
const envelope = new ActivityEnvelope();
document.onkeydown = envelope.activate;
document.onclick = envelope.activate;
