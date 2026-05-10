// ========== РЕЖИМ ПРОГУЛКИ ==========
let walkModeActive = false;
let walkCameraPosition = null;
let walkCameraHeading = 0;
const WALK_SPEED = 8;
const ROTATE_SPEED = 1.5;
let moveForward = false, moveBack = false, moveLeft = false, moveRight = false;
let rotateLeft = false, rotateRight = false;
let walkAnimationId = null;
let walkViewer = null;

// Функция обновления позиции
function updateWalkPosition() {
    if (!walkModeActive || !walkViewer) return;
    
    const deltaTime = 1 / 60;
    let moved = false;
    let rotated = false;
    
    if (rotateLeft) {
        walkCameraHeading -= Cesium.Math.toRadians(ROTATE_SPEED);
        rotated = true;
    }
    if (rotateRight) {
        walkCameraHeading += Cesium.Math.toRadians(ROTATE_SPEED);
        rotated = true;
    }
    
    if (rotated) {
        walkViewer.camera.setView({
            orientation: { heading: walkCameraHeading, pitch: Cesium.Math.toRadians(-10), roll: 0 }
        });
    }
    
    if (moveForward || moveBack || moveLeft || moveRight) {
        const speed = WALK_SPEED * deltaTime;
        const direction = new Cesium.Cartesian3();
        const forward = walkViewer.camera.direction;
        const right = walkViewer.camera.right;
        
        if (moveForward) { direction.x += forward.x; direction.y += forward.y; direction.z += forward.z; }
        if (moveBack) { direction.x -= forward.x; direction.y -= forward.y; direction.z -= forward.z; }
        if (moveRight) { direction.x += right.x; direction.y += right.y; direction.z += right.z; }
        if (moveLeft) { direction.x -= right.x; direction.y -= right.y; direction.z -= right.z; }
        
        const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
        if (length > 0) {
            direction.x /= length;
            direction.y /= length;
            direction.z /= length;
        }
        
        let newPosition = Cesium.Cartesian3.add(walkCameraPosition, 
            new Cesium.Cartesian3(direction.x * speed, direction.y * speed, direction.z * speed), 
            new Cesium.Cartesian3());
        
        const cartographic = Cesium.Cartographic.fromCartesian(newPosition);
        const terrainHeight = walkViewer.scene.globe.getHeight(cartographic);
        
        if (terrainHeight !== undefined && !isNaN(terrainHeight)) {
            cartographic.height = terrainHeight + 1.7;
        } else {
            cartographic.height = 1.7;
        }
        
        newPosition = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height);
        walkCameraPosition = newPosition;
        walkViewer.camera.setView({ destination: walkCameraPosition });
        moved = true;
    }
    
    walkAnimationId = requestAnimationFrame(updateWalkPosition);
}

// Запуск анимации
function startWalkAnimation() {
    if (walkAnimationId) cancelAnimationFrame(walkAnimationId);
    walkAnimationId = requestAnimationFrame(updateWalkPosition);
}

// Вход в режим прогулки
function startWalkMode(viewer) {
    if (walkModeActive) return;
    walkViewer = viewer;
    walkModeActive = true;
    
    const currentPosition = viewer.camera.position;
    const currentHeading = viewer.camera.heading;
    walkCameraPosition = currentPosition.clone();
    walkCameraHeading = currentHeading;
    
    viewer.scene.screenSpaceCameraController.enableTilt = false;
    viewer.scene.screenSpaceCameraController.enableLook = false;
    viewer.scene.screenSpaceCameraController.enableRotate = false;
    viewer.scene.screenSpaceCameraController.enableTranslate = false;
    viewer.scene.screenSpaceCameraController.enableZoom = false;
    
    const cartographic = Cesium.Cartographic.fromCartesian(walkCameraPosition);
    cartographic.height = 1.7;
    const newPosition = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height);
    viewer.camera.setView({
        destination: newPosition,
        orientation: { heading: walkCameraHeading, pitch: Cesium.Math.toRadians(-10), roll: 0 }
    });
    
    startWalkAnimation();
    if (window.updateWalkButtonUI) window.updateWalkButtonUI(true);
    console.log("Режим прогулки активирован");
}

// Выход из режима прогулки
function stopWalkMode() {
    if (!walkModeActive) return;
    walkModeActive = false;
    
    if (walkViewer) {
        walkViewer.scene.screenSpaceCameraController.enableTilt = true;
        walkViewer.scene.screenSpaceCameraController.enableLook = true;
        walkViewer.scene.screenSpaceCameraController.enableRotate = true;
        walkViewer.scene.screenSpaceCameraController.enableTranslate = true;
        walkViewer.scene.screenSpaceCameraController.enableZoom = true;
    }
    
    if (walkAnimationId) {
        cancelAnimationFrame(walkAnimationId);
        walkAnimationId = null;
    }
    
    moveForward = moveBack = moveLeft = moveRight = rotateLeft = rotateRight = false;
    if (window.updateWalkButtonUI) window.updateWalkButtonUI(false);
    console.log("Режим прогулки деактивирован");
}

// Обработчики клавиатуры
function walkHandleKeyDown(e) {
    if (!walkModeActive) return;
    switch(e.key) {
        case 'ArrowUp': case 'w': case 'W': moveForward = true; e.preventDefault(); break;
        case 'ArrowDown': case 's': case 'S': moveBack = true; e.preventDefault(); break;
        case 'ArrowLeft': case 'a': case 'A': moveLeft = true; e.preventDefault(); break;
        case 'ArrowRight': case 'd': case 'D': moveRight = true; e.preventDefault(); break;
        case 'q': case 'Q': rotateLeft = true; e.preventDefault(); break;
        case 'e': case 'E': rotateRight = true; e.preventDefault(); break;
        case 'Escape': stopWalkMode(); break;
    }
}

function walkHandleKeyUp(e) {
    if (!walkModeActive) return;
    switch(e.key) {
        case 'ArrowUp': case 'w': case 'W': moveForward = false; e.preventDefault(); break;
        case 'ArrowDown': case 's': case 'S': moveBack = false; e.preventDefault(); break;
        case 'ArrowLeft': case 'a': case 'A': moveLeft = false; e.preventDefault(); break;
        case 'ArrowRight': case 'd': case 'D': moveRight = false; e.preventDefault(); break;
        case 'q': case 'Q': rotateLeft = false; e.preventDefault(); break;
        case 'e': case 'E': rotateRight = false; e.preventDefault(); break;
    }
}

function updateWalkButtonUI(isActive) {
    const btnWalk = document.getElementById('btnWalk');
    if (btnWalk) {
        if (isActive) {
            btnWalk.style.backgroundColor = 'rgba(66, 133, 244, 0.5)';
            btnWalk.style.boxShadow = '0 0 15px rgba(66, 133, 244, 0.8)';
        } else {
            btnWalk.style.backgroundColor = 'rgba(30, 30, 30, 0.85)';
            btnWalk.style.boxShadow = 'none';
        }
    }
}

// Регистрация обработчиков клавиатуры
document.addEventListener('keydown', walkHandleKeyDown);
document.addEventListener('keyup', walkHandleKeyUp);

// Делаем функции глобальными
window.startWalkMode = startWalkMode;
window.stopWalkMode = stopWalkMode;
window.updateWalkButtonUI = updateWalkButtonUI;
