#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

in vec2 v_texcoord;
uniform sampler2D u_texture;
uniform vec4 u_sprite_transp;
uniform vec4 u_aura_color;
uniform float t;
uniform float t_raw;
// we need to declare an output for the fragment shader
out vec4 outColor;

float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

void main() {
//   vec4 sprite_transp = vec4 (1.0,1.0,1.0,1.0);
  outColor = texture(u_texture, v_texcoord) * u_sprite_transp;
  // remove this when ready
  // return;

  if (outColor == vec4(0.0,0.0,0.0,0.0)) {
    // if (mod(v_texcoord.y * 352.0,16.0) > 14.0) {
    //   return;         
    // } else if (mod(v_texcoord.y * 352.0,16.0) < 2.0) {
    //   return;         
    // }

    if (mod(v_texcoord.y * 768.0,16.0) > 15.0) {
      return;         
    } else if (mod(v_texcoord.y * 768.0,16.0) < 1.0) {
      return;         
    } else if (mod(v_texcoord.x * 512.0,16.0) > 15.0) {
      return;
    } else if (mod(v_texcoord.x * 512.0,16.0) < 1.0) {
      return;
    }

    // vec4 blurDown1 = texture(u_texture, v_texcoord + vec2(0.0, 0.00283));
    // vec4 blurDown2 = texture(u_texture, v_texcoord + vec2(0.0, 0.00567));

    // vec4 blurDown1 = texture(u_texture, v_texcoord + vec2(0.0, 0.00130));
    // vec4 blurDown2 = texture(u_texture, v_texcoord + vec2(0.0, 0.00260));

    vec4 blurredColor = vec4(0.0,0.0,0.0,0.0);

    vec4 blurDown1 = texture(u_texture, v_texcoord + vec2(0.0, 0.00130));
    if (mod(v_texcoord.y * 768.0 + 1.0,16.0) <= 15.0) {
        blurredColor += blurDown1;
    }
    vec4 blurUp1 = texture(u_texture, v_texcoord + vec2(0.0, -0.00130));
    if (mod(v_texcoord.y * 768.0 - 1.0,16.0) >= 1.0) {
        blurredColor += blurUp1;
    }
    vec4 blurLeft1 = texture(u_texture, v_texcoord + vec2(0.00195, 0.0));
    if (mod(v_texcoord.x * 512.0 + 1.0,16.0) <= 15.0) {
        blurredColor += blurLeft1;
    }
    vec4 blurRight1 = texture(u_texture, v_texcoord + vec2(-0.00195, 0.0));
    if (mod(v_texcoord.x * 512.0 - 1.0,16.0) >= 1.0) {
        blurredColor += blurRight1;
    }

    // vec4 aura_color = vec4(1.0,0.0,0.0,1.0);
    vec4 auraHighlightColor = u_aura_color * vec4(0.5,0.5,0.5,1.0);

    // vec4 blurredColor = blurDown1 + blurUp1 + blurLeft1 + blurRight1;
    // outColor = blurredColor;
    if (blurredColor != vec4(0.0,0.0,0.0,0.0)) {
      vec4 noiseColor = mix(u_aura_color,auraHighlightColor,abs(noise(vec3(floor(v_texcoord.x * 512.0),floor(v_texcoord.y * 768.0),t_raw * 5.0))));
    //   vec4 noiseColor = vec4(1.0 - t,1.0-t,1.0 - t,1) * (0.4 * blurDown1 + 0.6 * blurDown2) * abs(noise(vec3(floor(v_texcoord.x * 512.0),floor(v_texcoord.y * 768.0),t_raw)));
      outColor = noiseColor;
    //   if (length(noiseColor) >= 0.6) {
    //     outColor = noiseColor;
    //   }

    } 
  } 
}