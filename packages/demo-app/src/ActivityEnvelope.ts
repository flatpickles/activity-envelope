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
 *
 * Currently the attack will always take the same amount of time, even if retriggered during the
 * release phase, so the rate of change will be slower following these retriggered attacks.
 */

type EnvelopePhase =
    | 'inactive' // no activity
    | 'attack' // ramping up
    | 'sustain' // holding steady
    | 'release'; // ramping down

type PhaseSubscription = (phase: EnvelopePhase) => void;

export default class ActivityEnvelope {
    phase: EnvelopePhase = 'inactive';

    #attackMs: number;
    #sustainMs: number;
    #releaseMs: number;
    #constantAttackDuration: boolean;
    #lastPhaseChange = -Infinity;
    #phaseTimeout: number | undefined = undefined;
    #valueAtRetrigger = 0;
    #subscriptions: PhaseSubscription[] = [];

    get linearValue() {
        if (this.phase === 'inactive') return 0;
        if (this.phase === 'sustain') return 1;
        const timeSincePhaseChange = Date.now() - this.#lastPhaseChange;
        if (this.phase === 'attack') {
            if (!this.#constantAttackDuration)
                return Math.min(1, this.#valueAtRetrigger + timeSincePhaseChange / this.#attackMs);
            else return lerp(this.#valueAtRetrigger, 1, timeSincePhaseChange / this.#attackMs);
        }
        if (this.phase === 'release') {
            return 1 - timeSincePhaseChange / this.#releaseMs;
        }
        throw new Error('Unrecognized phase');
    }

    /**
     * @param attackMs - The duration of the attack phase, in milliseconds
     * @param sustainMs - The duration of the sustain phase, in milliseconds
     * @param releaseMs - The duration of the release phase, in milliseconds
     * @param constantAttackDuration - If true, even retriggered attacks will take the same amount
     *   of time from trigger to peak. If false, attacks will always happen at the same rate, but
     *   for abbreviated periods if retriggered during the release phase.
     */
    constructor(
        attackMs = 500,
        sustainMs = 1000,
        releaseMs = 2000,
        constantAttackDuration = false
    ) {
        this.#attackMs = attackMs;
        this.#sustainMs = sustainMs;
        this.#releaseMs = releaseMs;
        this.#constantAttackDuration = constantAttackDuration;
    }

    destroy() {
        clearTimeout(this.#phaseTimeout);
    }

    activate() {
        if (this.phase === 'inactive') {
            // If we're inactive, we'll start the attack phase
            this.phase = 'attack';
        } else if (this.phase === 'attack') {
            // If we're in the attack phase, we cannot retrigger the attack
            return;
        } else if (this.phase === 'sustain') {
            // If we're in the sustain phase, we'll simply extend the duration (below)
        } else if (this.phase === 'release') {
            // If we're in the release phase, we must capture the current value for continuity
            this.#valueAtRetrigger = this.linearValue;
            this.phase = 'attack';
        }

        // Note phase change, and schedule the next phase change
        this.#notePhaseChange();
        this.#schedulePhaseChange(this.#attackMs);
    }

    subscribe(subscription: PhaseSubscription) {
        this.#subscriptions.push(subscription);
    }

    #schedulePhaseChange(after: number) {
        clearTimeout(this.#phaseTimeout);
        this.#phaseTimeout = window.setTimeout(this.#phaseChange.bind(this), after);
    }

    #phaseChange() {
        this.#valueAtRetrigger = 0;
        if (this.phase === 'attack') {
            this.phase = 'sustain';
            this.#schedulePhaseChange(this.#sustainMs);
        } else if (this.phase === 'sustain') {
            this.phase = 'release';
            this.#schedulePhaseChange(this.#releaseMs);
        } else if (this.phase === 'release') {
            this.phase = 'inactive';
        } else {
            throw new Error('Phase should not change while inactive');
        }
        this.#notePhaseChange();
    }

    #notePhaseChange() {
        this.#lastPhaseChange = Date.now();
        for (const subscription of this.#subscriptions) {
            subscription(this.phase);
        }
    }
}

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}
