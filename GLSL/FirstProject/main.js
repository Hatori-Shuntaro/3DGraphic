'use strict'

let c, cw, ch, mx, my, gl, run, eCheck;
let startTime;
let time = 0.0;
let tempTime = 0.0;
let fps = 1000 / 30;
let uniLocation = new Array();

window.onload = function() {
    c = this.document.getElementById('canvas');

    cw = 512;
    ch = 512;
    c.width = cw;
    c.height = ch;

    eCheck = this.document.getElementById('check');

    c.addEventListener('mousemove', mouseMove, true);
    eCheck.addEventListener('change', checkChange, true);

    gl = c.getContext('webgl');

    let prg = create_program(create_shader('vs'), create_shader('fs'));
    run = (prg != null);
    if (!run) {
        eCheck.checked = false;
    }

    uniLocation[0] = gl.getUniformLocation(prg, 'time');
    uniLocation[1] = gl.getUniformLocation(prg, 'mouse');
    uniLocation[2] = gl.getUniformLocation(prg, 'resolution');

    let position = [
        -1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0
    ];

    let index = [
        0, 2, 1,
        1, 2, 3
    ];

    let vPos = create_vbo(position);
    let vIndex = create_ibo(index);
    let vAttLocation = gl.getAttribLocation(prg, 'position');
    gl.bindBuffer(gl.ARRAY_BUFFER, vPos);
    gl.enableVertexAttribArray(vAttLocation);
    gl.vertexAttribPointer(vAttLocation, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_BUFFER, vIndex);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    mx = 0.5;
    my = 0.5;
    startTime = new this.Date().getTime();

    render();

    function render() {
        if (!run) {
            return;
        }

        time = (new Date().getTime() - startTime) * 0.001;

        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.uniform1f(uniLocation[0], time + tempTime);
        gl.uniform2fv(uniLocation[1], [mx, my]);
        gl.uniform2fv(uniLocation[2], [cw, ch]);

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        gl.flush();

        setTimeout(render, fps);
    }

    function checkChange(e) {
        run = e.currentTarget.checked;

        if (run) {
            startTime = new Date().getTime();
            render();
        } else {
            tempTime += time;
        }
    }

    function mouseMove(e) {
        mx = e.offsetX / cw;
        my = e.offsetY / ch;
    }

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

        gl.shaderSource(shader, scriptElement.text);
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

    // VBOをバインドし登録するメソッド
    function set_attribute(vbo, attLocation, attStride) {
        // 引数として受け取った配列を処理する
        for (let i in vbo) {
            // バッファをバインドする
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);

            // attributeLoacationを有効化する
            gl.enableVertexAttribArray(attLocation[i]);

            // attributeLoacaitonを通知し登録する
            gl.vertexAttribPointer(attLocation[i], attStride[i], gl.FLOAT, false, 0, 0);
        }
    }

    // IBOを生成するメソッド
    function create_ibo(data) {
        let ibo = gl.createBuffer();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        return ibo;
    }
};