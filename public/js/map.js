import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import {fromLonLat} from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import {Style, Icon, Stroke} from 'ol/style';

// Crear el mapa
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: fromLonLat([0, 0]),
    zoom: 2
  })
});

// Fuente vectorial para la ISS y la trayectoria
const issSource = new VectorSource();
const issLayer = new VectorLayer({
  source: issSource
});
map.addLayer(issLayer);

// Lista para almacenar la trayectoria
let trajectoryCoordinates = [];

// Crear el icono de la ISS
const issIconStyle = new Style({
  image: new Icon({
    src: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
    scale: 0.05
  })
});

const lineStyle = new Style({
  stroke: new Stroke({
    color: 'red',
    width: 2
  })
});

// Función para obtener la posición de la ISS
async function fetchISSPosition() {
  try {
    const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
    const data = await response.json();

    const lon = parseFloat(data.longitude);
    const lat = parseFloat(data.latitude);

    console.log(`Posición ISS: Lon ${lon}, Lat ${lat}`);

    // Limpiar la capa anterior
    issSource.clear();

    // Guardar la nueva posición en la trayectoria
    const currentPosition = fromLonLat([lon, lat]);
    trajectoryCoordinates.push(currentPosition);

    // Crear la feature de la ISS
    const issFeature = new Feature({
      geometry: new Point(currentPosition)
    });

    // Aplicar estilo al icono
    issFeature.setStyle(issIconStyle);
    issSource.addFeature(issFeature);

    // Crear la línea de la trayectoria
    if (trajectoryCoordinates.length > 1) {
      const trajectoryFeature = new Feature({
        geometry: new LineString(trajectoryCoordinates)
      });
      trajectoryFeature.setStyle(lineStyle);
      issSource.addFeature(trajectoryFeature);
    }

    // Centrar la vista en la ISS
    map.getView().animate({
      center: currentPosition,
      duration: 1000
    });
  } catch (error) {
    console.error('Error al obtener la posición de la ISS:', error);
  }
}

// Actualizar la posición cada 5 segundos
setInterval(fetchISSPosition, 5000);

// Llamar a la función por primera vez
fetchISSPosition();
