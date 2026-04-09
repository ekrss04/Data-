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
function addCityNameMarker() {
    const longitude = 85.891825054503002;
    const latitude = 51.977554608212493;
    
    const markerEntity = viewer.entities.add({
        name: 'city_name_marker',
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 0),
        billboard: {
            image: getCitySvgByYear(viewer.clock.currentTime),
            width: 50,           // Размер иконки (как обычный маркер)
            height: 50,          // Размер иконки (как обычный маркер)
            verticalOrigin: Cesium.VerticalOrigin.CENTER,  // Центрируем по точке
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            scale: 1.0,
            pixelOffset: new Cesium.Cartesian2(0, 0),  // Без смещения
            disableDepthTestDistance: Number.POSITIVE_INFINITY, // Всегда видно
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000) // Виден до 5 км
        }
    });
    
    viewer.clock.onTick.addEventListener(function(clock) {
        const newImage = getCitySvgByYear(clock.currentTime);
        if (markerEntity.billboard.image !== newImage) {
            markerEntity.billboard.image = newImage;
        }
    });
    
    console.log("✅ Точечный маркер с SVG добавлен");
}

// В основном коде вызовите:
// addCityNameMarker();
