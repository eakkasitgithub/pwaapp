// Install dependencies: npm install vue leaflet axios

<template>
  <div id="app">
    <h1>Air Quality Map</h1>
    <div class="container">
      <div id="map-container">
        <div id="map"></div>
      </div>
      <div id="notification-log">
        <h2>Notification Log</h2>
        <div id="log-container">
          <div v-for="(log, index) in notificationLogs" :key="index" :class="{'log-white': index % 2 === 0, 'log-grey': index % 2 !== 0}">
            {{ log }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

export default {
  name: 'AirQualityMap',
  data() {
    return {
      map: null,
      markers: {},
      notificationLogs: [],
      token: 'f71c6c0da4d9d9c051af82970b1f421e9ae27d73',
      lastBounds: null,
      debounceTimer: null,
      cache: {} // Local object cache
    };
  },
  mounted() {
    console.log('Component Mounted: Initializing Map...');
    this.initMap();
  },
  methods: {
    initMap() {
      console.log('Initializing Leaflet Map...');
      
      if (L.DomEvent) {
        delete L.DomEvent._detectIE;
      }

      this.$nextTick(() => {
        if (!this.map) {
          this.map = L.map('map', {
            center: [13.736717, 100.523186],
            zoom: 10,
            zoomAnimation: true,
            preferCanvas: true
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(this.map);

          this.map.on('moveend', this.debouncedRefreshAirQualityData);
          console.log('Map initialized:', this.map);
          this.fetchAirQualityData();
        }
      });
    },
    clearMarkers() {
      Object.values(this.markers).forEach(marker => {
        this.map.removeLayer(marker);
      });
      this.markers = {};
    },
    debouncedRefreshAirQualityData() {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.refreshAirQualityData();
      }, 2000); // 2.00 - second delay to reduce API calls
    },
    refreshAirQualityData() {
      const bounds = this.map.getBounds();
      
      if (this.lastBounds && this.isBoundsSimilar(bounds, this.lastBounds)) {
        console.log("Bounds haven't changed significantly, skipping API call.");
        return;
      }
      
      this.lastBounds = bounds;
      this.clearMarkers();
      this.fetchAirQualityData();
    },
    isBoundsSimilar(newBounds, oldBounds) {
      const threshold = 0.1; // Define threshold for movement sensitivity
      return (
        Math.abs(newBounds.getSouth() - oldBounds.getSouth()) < threshold &&
        Math.abs(newBounds.getNorth() - oldBounds.getNorth()) < threshold &&
        Math.abs(newBounds.getWest() - oldBounds.getWest()) < threshold &&
        Math.abs(newBounds.getEast() - oldBounds.getEast()) < threshold
      );
    },
    async fetchAirQualityData() {
      if (!this.map) {
        console.error('Map is not initialized yet!');
        return;
      }
      
      const bounds = this.map.getBounds();
      const cacheKey = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
      
      if (this.cache[cacheKey]) {
        console.log('Using cached data for:', cacheKey);
        this.displayMarkers(this.cache[cacheKey]);
        return;
      }
      
      console.log('Fetching air quality data for bounds:', bounds);
      try {
        const response = await axios.get(`https://api.waqi.info/v2/map/bounds/?latlng=${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}&token=${this.token}`);
        if (response.data.status === 'ok') {
          this.cache[cacheKey] = response.data.data;
          this.displayMarkers(response.data.data);
          console.log('Markers updated after map movement.');
          this.addEventLog("IQA Data refreshed after map movement");
        }
      } catch (error) {
        console.error('Error fetching air quality data:', error);
      }
    },
    displayMarkers(data) {
      data.forEach(station => {
        this.addMarker(station.lat, station.lon, station.aqi, station.uid, station.station);
      });
    },
    addEventLog(message) {
      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}${now.toLocaleString('en-US', { month: 'short' }).toUpperCase()}-${now.toLocaleTimeString()}`;
      this.notificationLogs.unshift(`${formattedDate} : ${message}`);
    }
  }
};
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.container {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
}

#map-container {
  flex: 1;
  width: 100%;
}

#map {
  width: 100%;
  height: 100%;
  border: 1px solid black;
}

#notification-log {
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 10px;
  border-top: 1px solid #ccc;
  background: #f9f9f9;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

#log-container {
  display: flex;
  flex-direction: column;
}

.log-white {
  background-color: white;
  padding: 5px;
}

.log-grey {
  background-color: lightgrey;
  padding: 5px;
}
</style>
