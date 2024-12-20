import {
  createProgramInfo,
  createBufferInfoFromArrays,
  setBuffersAndAttributes,
  setUniforms,
  drawBufferInfo,
} from 'twgl.js';

import fs from '../glsl/main.frag';
import vs from '../glsl/main.vert';

const c = document.getElementById('canvas');
const gl = c.getContext('webgl2');
const programInfo = createProgramInfo(gl, [vs, fs]);
const arrays = {
  position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
};
const bufferInfo = createBufferInfoFromArrays(gl, arrays);

function render(time: number) {
  // resizeCanvasToDisplaySize(gl.canvas)
  // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  gl.viewport(0, 0, 512, 512);

  const uniforms = {
    iTime: time * 0.001,
    // iResolution: [gl.canvas.width, gl.canvas.height]
  };

  gl.useProgram(programInfo.program);
  setBuffersAndAttributes(gl, programInfo, bufferInfo);
  setUniforms(programInfo, uniforms);
  drawBufferInfo(gl, bufferInfo);

  requestAnimationFrame(render);
}

requestAnimationFrame(render);
