'use strict'

{
    let count = 0;

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 300);
    
    const webGLRenderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#background-canvas')
    });
    webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    
    const scene = new THREE.Scene();
    
    const sphereGeometry = new THREE.SphereGeometry(70, 30, 30);
    const sphereMaterial = new THREE.MeshNormalMaterial();
    sphereMaterial.wireframe = true;

    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphereMesh);

    const boxGeometry = new THREE.BoxGeometry(20, 20, 20, 10, 10, 10);
    const boxMaterial = new THREE.MeshNormalMaterial();
    boxMaterial.wireframe = true;
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    scene.add(boxMesh);

    const torusGeometry = new THREE.TorusGeometry(80, 5, 10, 80, 2 * Math.PI);
    const torusMaterial = new THREE.MeshNormalMaterial();
    torusMaterial.wireframe = true;
    const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
    torusMesh.position.set(0, -70, 0);
    torusMesh.rotation.set(Math.PI / 2, 0, 0);
    scene.add(torusMesh);

    Update();
    
    window.addEventListener('resize', onResize);
    
    function Update() {
        count += 0.05;

        sphereMesh.rotation.y += 0.01;

        boxMesh.rotation.x += 0.01;
        boxMesh.rotation.y += 0.01;
        boxMesh.position.y = 5 * Math.sin(count);

        torusMesh.rotation.z -= 0.005;

        webGLRenderer.render(scene, camera);
        requestAnimationFrame(Update);
    }

    function onResize() {
        let width = window.innerWidth;
        let height = window.innerHeight;

        let canvas = document.getElementById('background-canvas');
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        webGLRenderer.setPixelRatio(window.devicePixelRatio);
        webGLRenderer.setSize(width, height);

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    // function createParticles() {
    //     let particleGeometry = new THREE.Geometry();
    //     let particleMaterial = new THREE.PointsMaterial({
    //         size: 4,
    //         vertexColors: true,
    //         color: 0xffffff,
    //     });

    //     for (let x = -30; x < 30; x++) {
    //         for (let y = -30; y < 30; y++) {
    //             let particle = new THREE.Vector3(x * 10, y * 10, 0);
    //             particleGeometry.vertices.push(particle);
    //             particleGeometry.colors.push(new THREE.Color(Math.random() * 0x00ffff));
    //         }
    //     }

    //     let backgroundParticle = new THREE.Points(particleGeometry, particleMaterial);
    //     scene.add(backgroundParticle);
    // }
}
