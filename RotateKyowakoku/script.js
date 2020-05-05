function init() {

    const THREE = require('three');
    
    VolumetricFire.texturePath = '../textures/';
    let clock = new THREE.Clock();
    let scene = new THREE.Scene();

    let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 100, 300);
    camera.lookAt(scene.position);


    let webGLRenderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#main-canvas')
    });
    // webGLRenderer.setClearColor(new THREE.Color(0xEEEEEE));
    webGLRenderer.setSize(window.innerWidth, window.innerHeight);


    var ambiColor = "#f8f8ff";
    var ambientLight = new THREE.AmbientLight(ambiColor);
    scene.add(ambientLight);

    let spotLight = new THREE.SpotLight(0xff00ff);
    spotLight.position.set(0, 80, 0);
    spotLight.lookAt(scene.position);

    spotLight.castShadow = true;
    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.camera.fov = 30;
    spotLight.decay = 1;
    spotLight.intensity = 3;
    spotLight.distance = 0;
    spotLight.angle = 0.7;

    scene.add(spotLight);


    // let axis = new THREE.AxisHelper(50);
    // scene.add(axis);


    let mesh;

    var loader = new THREE.OBJLoader();
    loader.load('Kyowakoku.obj', function (loadedMesh) {
        var material = new THREE.MeshLambertMaterial({ color: 0x8b4513 });

        loadedMesh.children.forEach(function (child) {
            child.material = material;
            child.geometry.computeFaceNormals();
            child.geometry.computeVertexNormals();
        });

        loadedMesh.scale.set(5, 5, 5);
        loadedMesh.position.set(-70, 0, 0);
        loadedMesh.rotation.set(Math.PI / 2, 0, 0);
        mesh = loadedMesh;
        scene.add(mesh);
    });


    let fireWidth = 100;
    let fireHeight = 200;
    let fireDepth = 100;
    let sliceSpacing = 20;

    let fireLeft = new VolumetricFire(
        fireWidth,
        fireHeight,
        fireDepth,
        sliceSpacing,
        camera
    );

    scene.add(fireLeft.mesh);
    fireLeft.mesh.position.set(0, fireHeight / 2, 0 );


    let renderPass = new THREE.RenderPass(scene, camera);

    let effectGlitch = new THREE.GlitchPass(64);
    effectGlitch.renderToScreen = true;
    
    let composer = new THREE.EffectComposer(webGLRenderer);
    composer.addPass(renderPass);
    composer.addPass(effectGlitch);


    render();

    function render() {
        let elapsed = clock.getElapsedTime();
        let delta = clock.getDelta();

        fireLeft.update(elapsed);

        scene.rotation.y += 0.005;
        requestAnimationFrame(render);
        // webGLRenderer.render(scene, camera);
        composer.render(delta);
    }
}
window.onload = init;