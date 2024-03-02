precision highp float;

varying vec2 uv;
uniform float activity;

void main()	{
    vec3 background = vec3(1.0, 1.0, 1.0);
    vec3 foreground = vec3(0.5, 0.2, 0.5);
    vec3 mixed = mix(background, foreground, activity);
    gl_FragColor = vec4(mixed, 1.0);
}