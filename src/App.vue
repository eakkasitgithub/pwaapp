// Install dependencies: npm install vue leaflet axios

<template>
  <div id="map"></div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

export default {
  name: 'AirQualityMap',
  data() {
    return {
      map: null,
      markers: {},
      token: 'f71c6c0da4d9d9c051af82970b1f421e9ae27d73'
    };
  },
  mounted() {
    this.initMap();
    this.fetchAirQualityData();
  },
  methods: {
    initMap() {
      this.map = L.map('map').setView([13.736717, 100.523186], 10); // Default center (Bangkok)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      this.map.on('moveend', () => {
        let bounds = this.map.getBounds();
        let boundsStr = `${bounds.getNorth()},${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()}`;
        this.populateMarkers(boundsStr);
      });
    },
    async fetchAirQualityData() {
      try {
        const response = await axios.get(`https://api.waqi.info/v2/map/bounds/?latlng=13.5,100.4,13.9,100.7&token=${this.token}`);
        if (response.data.status === 'ok') {
          response.data.data.forEach(station => {
            this.addMarker(station.lat, station.lon, station.aqi, station.uid);
          });
        }
      } catch (error) {
        console.error('Error fetching air quality data:', error);
      }
    },
    async populateMarkers(bounds) {
      try {
        const response = await axios.get(`https://api.waqi.info/v2/map/bounds/?latlng=${bounds}&token=${this.token}`);
        if (response.data.status === 'ok') {
          response.data.data.forEach(station => {
            if (!this.markers[station.uid]) {
              this.addMarker(station.lat, station.lon, station.aqi, station.uid);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching markers:', error);
      }
    },
    addMarker(lat, lon, aqi, uid) {
      const color = aqi > 100 ? 'red' : 'green';
      const marker = L.circleMarker([lat, lon], {
        color,
        radius: 10
      }).addTo(this.map);
      marker.bindTooltip(`AQI: ${aqi}`).openTooltip();
      this.markers[uid] = marker;
    }
  }
};
</script>

<style>
#map {
  height: 500px;
  width: 100%;
}
</style>
