/**
 * ActivityEnvelope is an activity monitor of sorts, which can be used to drive visualizations. It
 * supports both pull and push models; the `linearValue` getter can be used to poll a calculated
 * activity level, or external code can subscribe to phase change events.
 *
 * The ActivityEnvelope is designed similarly to the classic ADSR envelopes used in sound design,
 * with a key difference: "sustain" is not a fixed level, but a fixed duration. This is because
 * we're monitoring discrete impulses, not sustained signals, and the sustain phase is intended to
 * model the period of time in which a new impulse will not change the activity level, but will
 * reset the envelope to its state at the end of the attack phase.
 */

type EnvelopePhase =
    | 'inactive' // no activity
    | 'attack' // ramping up
    | 'sustain' // holding steady
    | 'release'; // ramping down

export default class ActivityEnvelope {
    phase: EnvelopePhase = 'inactive';

    #attackMs: number;
    #sustainMs: number;
    #releaseMs: number;
    #lastActivation = -Infinity;
    #phaseTimeout: number | undefined = undefined;

    get linearValue() {
        return 0.9;
    }

    constructor(attackMs = 100, sustainMs = 1000, releaseMs = 1000) {
        this.#attackMs = attackMs;
        this.#sustainMs = sustainMs;
        this.#releaseMs = releaseMs;
    }

    activate() {
        this.#lastActivation = Date.now();
        if (this.phase === 'inactive') {
            // start the attack phase
            this.phase = 'attack';
            this.#schedulePhaseChange(this.#attackMs);
        } else if (this.phase === 'sustain') {
            // retrigger: push the sustain phase to the end of the new activation
            this.#schedulePhaseChange(this.#sustainMs);
        } else if (this.phase === 'release') {
            // retrigger: restart the attack phase
            const currentValue = this.linearValue;
            this.phase = 'attack';
            this.#schedulePhaseChange(this.#attackMs * currentValue);
        }
        console.log(this.phase);
    }

    #schedulePhaseChange(after: number) {
        clearTimeout(this.#phaseTimeout);
        this.#phaseTimeout = window.setTimeout(() => this.#phaseChange(), after);
    }

    #phaseChange() {
        if (this.phase === 'attack') {
            this.phase = 'sustain';
            this.#schedulePhaseChange(this.#sustainMs);
        } else if (this.phase === 'sustain') {
            this.phase = 'release';
            this.#schedulePhaseChange(this.#releaseMs);
        } else if (this.phase === 'release') {
            this.phase = 'inactive';
        }
        console.log(this.phase);
    }
}
