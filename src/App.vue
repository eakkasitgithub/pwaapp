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
      token: 'f71c6c0da4d9d9c051af82970b1f421e9ae27d73'
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

          console.log('Map initialized:', this.map);
          this.fetchAirQualityData();
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
              this.addMarker(station.lat, station.lon, station.aqi, station.uid, station.station);
            }
          });
          console.log('Markers added successfully.');
          this.addEventLog("IQA Data is updated");
        }
      } catch (error) {
        console.error('Error fetching air quality data:', error);
      }
    },
    async fetchLocationDetails(lat, lon) {
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        return response.data.address || {};
      } catch (error) {
        console.error('Error fetching location details:', error);
        return {};
      }
    },
    async addMarker(lat, lon, aqi, uid, station) {
      console.log(`Adding marker at (${lat}, ${lon}) with AQI: ${aqi}`);
      const color = aqi > 100 ? 'red' : 'green';
      const marker = L.circleMarker([lat, lon], {
        color,
        radius: 10
      }).addTo(this.map);

      const location = await this.fetchLocationDetails(lat, lon);
      const locationText = `${location.road || ''}, ${location.suburb || ''}, ${location.city || ''}, ${location.state || ''}, ${location.country || ''}`.replace(/, ,/g, ',');
      marker.bindTooltip(`Station: ${station.name}<br> AQI: ${aqi}<br> Location: ${lat}, ${lon}<br> ${locationText}`);
      
      marker.on('mouseover', () => {
        marker.openTooltip();
        this.addEventLog(`Hovered on Station: ${station.name}, AQI: ${aqi}, Location: ${locationText}`);
      });
      
      marker.on('mouseout', () => {
        marker.closeTooltip();
      });
      
      this.markers[uid] = marker;
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
