'use strict'

onload = function() {

    // canvas要素を取得
    let c = document.getElementById('canvas');
    c.width = window.outerWidth;
    c.height = window.outerHeight;

    // webGLコンテキストを取得
    let gl = c.getContext('webgl');

    // 頂点シェーダーとフラグメントシェーダーの生成
    let v_shader = create_shader('vs');
    let f_shader = create_shader('fs');

    // プログラムオブジェクトの生成とリンク
    let prg = create_program(v_shader, f_shader);

    // attributeLocationの取得
    let attLocation = new Array(2);
    attLocation[0] = gl.getAttribLocation(prg, 'position');
    attLocation[1] = gl.getAttribLocation(prg, 'color');

    // attributeの要素数を配列に格納
    let attStride = new Array(2);
    attStride[0] = 3;
    attStride[1] = 4;

    // 頂点の位置情報を格納する配列
    let vertex_position = [
        // X, Y, Z
        0.0, 0.5, 0.0,
        0.25, 0.0, 0.0,
        -0.25, 0.0, 0.0
    ];

    // 頂点の色情報を格納する配列
    let vertex_color = [
        1.0, 0.0, 0.0, 0.5,
        0.0, 1.0, 0.0, 0.5,
        0.0, 0.0, 1.0, 0.5
    ];

    // VBOの生成
    let position_vbo = create_vbo(vertex_position);
    let color_vbo = create_vbo(vertex_color);

    // VBOを登録する
    set_attribute([position_vbo, color_vbo], attLocation, attStride);

    let uniLocation = gl.getUniformLocation(prg, 'mvpMatrix');

    // 各種行列の生成と初期化
    let m = new matIV();
    let mMatrix = m.identity(m.create());
    let vMatrix = m.identity(m.create());
    let pMatrix = m.identity(m.create());
    let tmpMatrix = m.identity(m.create());
    let mvpMatrix = m.identity(m.create());

    // ビュー×プロジェクション座標変換行列
    m.lookAt([0.0, 0.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix);
    m.perspective(90, c.width / c.height, 0.1, 100, pMatrix);
    m.multiply(pMatrix, vMatrix, tmpMatrix);

    let count = 0;
    const triangleNum = 1000;
    let randomPos = CreateRandomPos();

    // 恒常ループ(即時関数)
    (function loop() {
        // canvasの初期化
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        count++;

        // カウンタを元にラジアンを算出
        let rad = (count % 360) * Math.PI / 180;

        for (let i = 0; i < randomPos.length; i = i + 2) {
            
            // モデル1は円の軌道を描く
            let x = Math.cos(rad);
            let y = Math.sin(rad);
            m.identity(mMatrix);
            m.translate(mMatrix, [x + randomPos[i], y + randomPos[i + 1], 0.0], mMatrix);
    
            // モデル1の座標変換行列を完成させレンダリングする
            m.multiply(tmpMatrix, mMatrix, mvpMatrix);
            gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
    
            // モデル2はY軸を中心に回転する
            m.identity(mMatrix);
            m.translate(mMatrix, [randomPos[i], randomPos[i + 1], 0.0], mMatrix);
            m.rotate(mMatrix, rad, [0, 1, 0], mMatrix);
    
            // モデル2の座標変換行列を完成させレンダリングする
            m.multiply(tmpMatrix, mMatrix, mvpMatrix);
            gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
    
            // モデル3は拡大縮小する
            let scale = Math.sin(rad) + 1.0;
            m.identity(mMatrix);
            m.translate(mMatrix, [randomPos[i + 1], randomPos[i], 0.0], mMatrix);
            m.scale(mMatrix, [scale, scale, 0.0], mMatrix);
    
            // モデル3の座標変換行列を完成させレンダリングする
            m.multiply(tmpMatrix, mMatrix, mvpMatrix);
            gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
            gl.drawArrays(gl.TRIANGLES, 0, 3);

        }

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

    // ランダムなx, y座標の組み合わせを100個作成するメソッド
    function CreateRandomPos() {
        // x, y座標の値を順番に入れる配列(100組 × 2)
        let array = new Array(triangleNum);

        // -2~2の間でランダムな値を代入
        for (let i = 0; i < array.length; i++) {
            // Math.random() * (max + 1 - min) + min
            array[i] = Math.random() * 15 - 7
        }

        return array;
    }
};