// Файл: cityNames.js
// Простой маркер с меняющимся SVG изображением (без текстовой надписи)

// Функция определения какой SVG показывать в зависимости от года
function getCitySvgByYear(currentTime) {
    const date = Cesium.JulianDate.toDate(currentTime);
    const year = date.getUTCFullYear();
    
    // Определяем период по году
    if (year < 1932) {
        return 'https://raw.githubusercontent.com/ekrss04/Data-/main/visual/Улала.svg';
    } else if (year >= 1932 && year < 1948) {
        return 'https://raw.githubusercontent.com/ekrss04/Data-/main/visual/Ойрот-Тура.svg';
    } else {
        return 'https://raw.githubusercontent.com/ekrss04/Data-/main/visual/Горно-Алтайск.svg';
    }
}

// Основная функция добавления маркера
function addCityNameMarker(viewer) {
    if (!viewer) {
        console.error('Viewer не передан в addCityNameMarker');
        return;
    }
    
    // Координаты для маркера (гора, где находится надпись)
    const longitude = 85.891825054503002;
    const latitude = 51.977554608212493;
    
    // Создаем маркер, который будет менять изображение в зависимости от времени
    const markerEntity = viewer.entities.add({
        name: 'city_name_marker',
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 80),
        billboard: {
            image: getCitySvgByYear(viewer.clock.currentTime),
            width: 300,
            height: 100,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            scale: 1.0,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
    });
    
    // Обновляем маркер при изменении времени
    viewer.clock.onTick.addEventListener(function(clock) {
        const newImage = getCitySvgByYear(clock.currentTime);
        if (markerEntity.billboard.image !== newImage) {
            markerEntity.billboard.image = newImage;
        }
    });
    
    console.log("✅ Маркер с SVG добавлен");
}

// Экспортируем функцию для использования
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { addCityNameMarker };
}
