// Install dependencies: npm install vue leaflet axios

<template>
  <div id="app">
    <h1>Air Quality Map</h1>
    <div id="map"></div>
  </div>
</template>

<script>
import * as L from 'leaflet'; // Correct import for Leaflet
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

export default {
  name: 'AirQualityMap',
  data() {
    return {
      map: null,
      markers: {},
      token: 'f71c6c0da4d9d9c051af82970b1f421e9ae27d73' // Fetch token from .env
    };
  },
  mounted() {
    console.log('Component Mounted: Initializing Map...');
    this.initMap();
  },
  methods: {
    initMap() {
      console.log('Initializing Leaflet Map...');

      // FIX: Prevent Leaflet from using deprecated Mutation Events
      if (L.DomEvent) {
        delete L.DomEvent._detectIE;
      }

      // Delay map initialization to ensure the DOM is ready
      this.$nextTick(() => {
        if (!this.map) {
          this.map = L.map('map', {
            center: [13.736717, 100.523186], // Bangkok
            zoom: 10,
            zoomAnimation: true,
            preferCanvas: true
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(this.map);

          console.log('Map initialized:', this.map);
          this.fetchAirQualityData(); // Ensure API call is made only after the map is initialized
        }
      });
    },
    async fetchAirQualityData() {
      if (!this.map) {
        console.error('Map is not initialized yet!');
        return;
      }

      console.log('Fetching air quality data...');
      try {
        const response = await axios.get(`https://api.waqi.info/v2/map/bounds/?latlng=13.5,100.4,13.9,100.7&token=${this.token}`);
        if (response.data.status === 'ok') {
          response.data.data.forEach(station => {
            if (this.map) {
              this.addMarker(station.lat, station.lon, station.aqi, station.uid);
            }
          });
          console.log('Markers added successfully.');
        }
      } catch (error) {
        console.error('Error fetching air quality data:', error);
      }
    },
    addMarker(lat, lon, aqi, uid) {
      console.log(`Adding marker at (${lat}, ${lon}) with AQI: ${aqi}`);
      const color = aqi > 100 ? 'red' : 'green';
      const marker = L.circleMarker([lat, lon], {
        color,
        radius: 10
      }).addTo(this.map);
      marker.bindTooltip(`AQI: ${aqi}`);
      
      // Show tooltip on hover
      marker.on('mouseover', function () {
        marker.openTooltip();
      });
      
      // Hide tooltip on mouseout
      marker.on('mouseout', function () {
        marker.closeTooltip();
      });
      
      this.markers[uid] = marker;
    }
  }
};
</script>

<style>
#map {
  height: 500px;
  width: 100%;
  border: 1px solid black; /* Add a border to see if the div exists */
}
</style>
 