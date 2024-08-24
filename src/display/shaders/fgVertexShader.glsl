#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;
in vec2 a_texcoord;
out vec2 v_texcoord;

// all shaders have a main function
void main() {

  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  float grid_unit = (600 / 8) / 600; // just 1/grid size
  vec4 ndc_a_position = a_position * grid_unit;

  gl_Position = ndc_a_position;
  v_texcoord = a_texcoord;


//   gl_Position = a_position;
//   v_texcoord = a_texcoord;

}