precision highp float;
varying vec2 uv;
attribute vec2 position;
void main(){
    uv=vec2(.5,.5)*position+.5;
    gl_Position=vec4(position,0,1);
}