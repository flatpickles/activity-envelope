# activity-envelope

## Installation

```
npm i activity-envelope
```

## Overview

ActivityEnvelope is an activity monitor of sorts, which can be used to drive visualizations or other responsive features in an interactive experience. It supports both pull and push models; the `linearValue` getter can be used to poll a calculated activity level, or external code can subscribe to phase change events.

The ActivityEnvelope is designed similarly to the classic ADSR envelopes used in sound design, with a key difference: "sustain" is not a fixed level, but a fixed duration. This is because we're monitoring discrete impulses, not sustained signals. The sustain phase is intended to model the period of time in which a new impulse will not change the activity level, but instead will further delay the release phase.

## Demo App

Find a demo app at the root level of the repository [here](https://github.com/flatpickles/activity-envelope).
