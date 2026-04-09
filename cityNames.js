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
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 0), // Высота 0 - привязан к земле
        billboard: {
            image: getCitySvgByYear(viewer.clock.currentTime),
            width: 120,          // Уменьшенный размер
            height: 40,          // Уменьшенный размер
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            scale: 1.0,
            // Убираем disableDepthTestDistance - маркер будет нормально масштабироваться
            // Добавляем расстояние видимости (опционально)
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000) // Виден от 0 до 10 км
        }
    });
    
    viewer.clock.onTick.addEventListener(function(clock) {
        const newImage = getCitySvgByYear(clock.currentTime);
        if (markerEntity.billboard.image !== newImage) {
            markerEntity.billboard.image = newImage;
        }
    });
    
    console.log("✅ Маркер с SVG добавлен (привязан к земле, постоянный размер)");
}
