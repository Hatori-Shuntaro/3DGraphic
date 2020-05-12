'use strict'

onload = function() {

    // canvas要素を取得
    let c = document.getElementById('canvas');
    c.width = this.window.outerWidth;
    c.height = this.window.outerHeight;

    // webGLコンテキストを取得
    let gl = c.getContext('webgl');

    // 頂点シェーダーとフラグメントシェーダーの生成
    let v_shader = create_shader('vs');
    let f_shader = create_shader('fs');

    // プログラムオブジェクトの生成とリンク
    let prg = create_program(v_shader, f_shader);

    // attributeLocationの取得
    let attLocation = new Array();
    attLocation[0] = gl.getAttribLocation(prg, 'position');
    attLocation[1] = gl.getAttribLocation(prg, 'normal');
    attLocation[2] = gl.getAttribLocation(prg, 'color');

    // attributeの要素数を配列に格納
    let attStride = new Array(2);
    attStride[0] = 3;
    attStride[1] = 3;
    attStride[2] = 4;

    // トーラスを作成
    let [position, normal, color, index] = torus(50, 60, 2, 6);

    // VBOの生成
    let position_vbo = create_vbo(position);
    let normal_vbo = create_vbo(normal);
    let color_vbo = create_vbo(color);

    // VBOを登録する
    set_attribute([position_vbo, normal_vbo, color_vbo], attLocation, attStride);

    // IBOの生成
    let ibo = create_ibo(index);

    // IBOをバインドして登録する
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

    // uniformLocationの取得
    let uniLocation = new Array();
    uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix');
    uniLocation[1] = gl.getUniformLocation(prg, 'invMatrix');
    uniLocation[2] = gl.getUniformLocation(prg, 'lightDirection');
    uniLocation[3] = gl.getUniformLocation(prg, 'eyeDirection');
    uniLocation[4] = gl.getUniformLocation(prg, 'ambientColor');

    // 各種行列の生成と初期化
    let m = new matIV();
    let mMatrix = m.identity(m.create());
    let vMatrix = m.identity(m.create());
    let pMatrix = m.identity(m.create());
    let tmpMatrix = m.identity(m.create());
    let mvpMatrix = m.identity(m.create());
    let invMatrix = m.identity(m.create());

    // ビュー×プロジェクション座標変換行列
    m.lookAt([0.0, 0.0, 20.0], [0, 0, 0], [0, 1, 0], vMatrix);
    m.perspective(90, c.width / c.height, 0.1, 100, pMatrix);
    m.multiply(pMatrix, vMatrix, tmpMatrix);

    // 平行光源の向き
    let lightDirection = [-0.5, 0.5, 0.5];

    // 視点ベクトル
    let eyeDirection = [0.0, 0.0, 20.0];

    // 環境光の色
    let ambientColor = [0.1, 0.1, 0.1, 1.0];

    // 深度テストを有効にする
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);

    // カウンタの宣言
    let count = 0;

    // 恒常ループ(即時関数)
    (function loop() {
        // canvasの初期化
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        count++;

        // カウンタを元にラジアンを算出
        let rad = (count % 360) * Math.PI / 180;

        // モデル座標変換行列の生成
        m.identity(mMatrix);
        m.rotate(mMatrix, rad, [0, 1, 1], mMatrix);
        m.multiply(tmpMatrix, mMatrix, mvpMatrix);

        // モデル座標変換行列から逆行列を生成
        m.inverse(mMatrix, invMatrix);

        // uniform変数の登録
        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
        gl.uniform3fv(uniLocation[2], lightDirection);
        gl.uniform3fv(uniLocation[3], eyeDirection);
        gl.uniform4fv(uniLocation[4], ambientColor);

        // インデックスを用いた描画命令
        gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

        // コンテキストの再描画
        gl.flush();

        // ループのために再帰呼び出し
        setTimeout(loop, 1000 / 30);
    })();

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

    // トーラスのモデルデータを生成するメソッド
    function torus(row, column, irad, orad) {
        let pos = new Array();
        let col = new Array();
        let idx = new Array();
        let normal = new Array();

        for (let i = 0; i <= row; i++) {
            let r = Math.PI * 2 / row * i;
            let rr = Math.cos(r);
            let ry = Math.sin(r);

            for (let ii = 0; ii <= column; ii++) {
                let tr = Math.PI * 2 / column * ii;
                let tx = (rr * irad + orad) * Math.cos(tr);
                let ty = ry * irad;
                let tz = (rr * irad + orad) * Math.sin(tr);
                let rx = rr * Math.cos(tr);
                let rz = rr * Math.sin(tr);

                pos.push(tx, ty, tz);
                normal.push(rx, ry, rz);

                let tc = hsva(360 / column * ii, 1, 1, 1);

                col.push(tc[0], tc[1], tc[2], tc[3]);
            }
        }

        for (let i = 0; i < row; i++) {
            for (let ii = 0; ii < column; ii++) {
                let r = (column + 1) * i + ii;
                idx.push(r, r + column + 1, r + 1);
                idx.push(r + column + 1, r + column + 2, r + 1);
            }
        }

        return [pos, normal, col, idx];
    }

    // HSVからRGBへの返還を行うメソッド
    function hsva(h, s, v, a) {
        if (s > 1 || v > 1 || a > 1) {
            return;
        }

        var th = h % 360;
        var i = Math.floor(th / 60);
        var f = th / 60 - i;
        var m = v * (1 - s);
        var n = v * (1 - s * f);
        var k = v * (1 - s * (1 - f));
        var color = new Array();

        if (!s > 0 && !s < 0) {
            color.push(v, v, v, a); 
        } else {
            var r = new Array(v, n, m, m, k, v);
            var g = new Array(k, v, v, n, m, m);
            var b = new Array(m, m, k, v, v, n);
            color.push(r[i], g[i], b[i], a);
        }

        return color;
    }
};