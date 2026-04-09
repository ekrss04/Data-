// Файл: cityNames.js
// Маркер с меняющимся SVG изображением

// Функция определения какой SVG показывать в зависимости от года
function getCitySvgByYear(currentTime) {
    const date = Cesium.JulianDate.toDate(currentTime);
    const year = date.getUTCFullYear();
    
    if (year < 1932) {
        return 'https://raw.githubusercontent.com/ekrss04/Data-/main/visual/Улала.svg';
    } else if (year >= 1932 && year < 1948) {
        return 'https://raw.githubusercontent.com/ekrss04/Data-/main/visual/Ойрот-Тура.svg';
    } else {
        return 'https://raw.githubusercontent.com/ekrss04/Data-/main/visual/Горно-Алтайск.svg';
    }
}

// Функция добавления маркера
function addCityNameMarker(viewer) {
    if (!viewer) {
        console.error('Viewer не передан в addCityNameMarker');
        return;
    }
    
    const longitude = 85.891825054503002;
    const latitude = 51.977554608212493;
    
    const markerEntity = viewer.entities.add({
        name: 'city_name_marker',
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 0),
        billboard: {
            image: getCitySvgByYear(viewer.clock.currentTime),
            width: 120,
            height: 40,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            scale: 1.0,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000)
        }
    });
    
    // Обновляем маркер при изменении времени
    viewer.clock.onTick.addEventListener(function(clock) {
        const newImage = getCitySvgByYear(clock.currentTime);
        if (markerEntity.billboard.image !== newImage) {
            markerEntity.billboard.image = newImage;
        }
    });
    
    console.log("✅ Маркер с SVG добавлен (120x40)");
}

// Делаем функцию глобальной
window.addCityNameMarker = addCityNameMarker;
