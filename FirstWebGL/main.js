'use strict'

import vertexShader from 'vertexShader.vert';
import fragmentShader from 'fragmentShader.frag';

let v_shader = vertexShader;
let f_shader = fragmentShader;

let vertex_position = [
    // X, Y, Z
    0.0, 1.0, 0.0,
    1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0
];

// シェーダーを作成するメソッド
function create_shader(id) {
    let shader;

    let scriptElement = document.getElementById(id);
    if (!scriptElement) {
        return;
    }

    switch (scriptElement.type) {
        case 'x-shader/x-vertex':
            shader = gl.createShader(gl.VERTEX_SHADER);
            break;
        case 'x-shader/x-fragment':
            shader = gl.createShader(gl.FRAGMENT_SHADER);
            break;
        default:
            return;
    }

    gl.shaderSource(shader, scriptElemt.text);
    gl.compileShader(shader);

    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader;
    } else {
        alert(gl.getShaderInfoLog(shader));
    }
}

// プログラムオブジェクトを作成するメソッド
function create_program(vs, fs) {
    let program = gl.createProgram();

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);

    gl.linkProgram(program);
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.useProgram(program);
        
        return program;
    } else {
        alert(gl.getProgramInfoLog(program));
    }
}

// VBOを作成するメソッド
function create_vbo(data) {
    let vbo = gl.createBuffer();

    // バッファをバインド
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    
    // バッファにデータをセット
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

    // バッファのバインドを無効化
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return vbo;
}