// Файл: cityNames.js
// Модуль для загрузки динамических названий города

// Базовые URL для SVG файлов
const SVG_URLS = {
    'Улала': 'https://raw.githubusercontent.com/ekrss04/Data-/main/visual/Улала.svg',
    'Ойрот-Тура': 'https://raw.githubusercontent.com/ekrss04/Data-/main/visual/Ойрот-Тура.svg',
    'Горно-Алтайска': 'https://raw.githubusercontent.com/ekrss04/Data-/main/visual/Горно-Алтайск.svg'
};

const GEOJSON_URL = 'https://raw.githubusercontent.com/ekrss04/Data-/main/visual/Названия.geojson';

// Вспомогательная функция для парсинга даты из формата "31.12.1823 17:00:00 (UTC)"
function parseCustomDate(dateStr) {
    try {
        let cleanStr = dateStr.replace(' (UTC)', '').trim();
        let parts = cleanStr.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
        
        if (parts) {
            const day = parseInt(parts[1]);
            const month = parseInt(parts[2]) - 1;
            const year = parseInt(parts[3]);
            const hour = parseInt(parts[4]);
            const minute = parseInt(parts[5]);
            const second = parseInt(parts[6]);
            
            return Cesium.JulianDate.fromDate(new Date(Date.UTC(year, month, day, hour, minute, second)));
        }
    } catch (e) {
        console.error('Ошибка парсинга даты:', dateStr, e);
    }
    return null;
}

// Основная функция загрузки названий города
function loadCityNames(viewer) {
    if (!viewer) {
        console.error('Viewer не передан в loadCityNames');
        return;
    }
    
    fetch(GEOJSON_URL)
        .then(response => response.json())
        .then(geojson => {
            geojson.features.forEach(feature => {
                const props = feature.properties;
                const name = props['Название'];
                const startDateStr = props['Начало'];
                const endDateStr = props['Конец'];
                const coordinates = feature.geometry.coordinates[0];
                
                if (!name || !startDateStr || !endDateStr || !coordinates) return;
                
                const startDate = parseCustomDate(startDateStr);
                const endDate = parseCustomDate(endDateStr);
                
                if (!startDate || !endDate) return;
                
                // Создаем билборд с SVG
                viewer.entities.add({
                    name: `city_name_${name}`,
                    position: Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1], 50),
                    billboard: {
                        image: SVG_URLS[name],
                        width: 300,
                        height: 100,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                        scale: 1.0,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    },
                    availability: new Cesium.TimeIntervalCollection([
                        new Cesium.TimeInterval({
                            start: startDate,
                            stop: endDate
                        })
                    ]),
                    show: true
                });
                
                console.log(`Добавлена вывеска "${name}" с ${startDateStr} по ${endDateStr}`);
            });
        })
        .catch(error => console.error('Ошибка загрузки названий города:', error));
}

// Экспортируем функцию для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadCityNames };
}
