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
      cache: {} 
    };
  },
  mounted() {
    console.log('Component Mounted: Initializing Map...');
    this.cache = this.loadCacheFromLocalStorage();
    this.$nextTick(() => {
      this.initMap();
    });
  },
  methods: {
    initMap() {
      console.log('Initializing Leaflet Map...');
      if (!document.getElementById('map')) {
        console.error('Map container not found!');
        return;
      }
      
      if (L.DomEvent) {
        delete L.DomEvent._detectIE;
      }

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
    },
    clearMarkers() {
      Object.values(this.markers).forEach(marker => {
        if (this.map && this.map.hasLayer(marker)) {
          this.map.removeLayer(marker);
        }
      });
      this.markers = {};
    },
    debouncedRefreshAirQualityData() {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.refreshAirQualityData();
      }, 2000);
    },
    refreshAirQualityData() {
      if (!this.map) return;
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
      const threshold = 0.1;
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
        console.log('Using cached data from localStorage for:', cacheKey);
        this.displayMarkers(this.cache[cacheKey]);
        this.addEventLog("[OLD] IQA Data loaded from cache");
        return;
      }
      
      console.log('Fetching air quality data for bounds:', bounds);
      try {
        const response = await axios.get(`https://api.waqi.info/v2/map/bounds/?latlng=${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}&token=${this.token}`);
        if (response.data.status === 'ok' && response.data.data.length > 0) {
          this.cache[cacheKey] = response.data.data;
          this.saveCacheToLocalStorage();
          this.displayMarkers(response.data.data);
          console.log('Markers updated after map movement.');
          this.addEventLog("[API] IQA Data refreshed from API");
        } else {
          console.warn("No data received from API");
          this.addEventLog("[API] No new IQA data available");
        }
      } catch (error) {
        console.error('Error fetching air quality data:', error);
      }
    },
    displayMarkers(data) {
      data.forEach(station => {
        const marker = L.circleMarker([station.lat, station.lon], {
          color: station.aqi > 100 ? 'red' : 'green',
          radius: 10
        }).addTo(this.map);
        
        marker.bindTooltip(`Station: ${station.station.name || 'Unknown'}<br> AQI: ${station.aqi}<br> Location: ${station.lat}, ${station.lon}`);
        
        marker.on('mouseover', () => {
          marker.openTooltip();
          this.addEventLog(`Hovered on ${station.station.name || 'Unknown'}, AQI: ${station.aqi}`);
        });
        
        marker.on('mouseout', () => {
          marker.closeTooltip();
        });
        
        this.markers[station.uid] = marker;
      });
    },
    saveCacheToLocalStorage() {
      localStorage.setItem('iqa_cache', JSON.stringify(this.cache));
    },
    loadCacheFromLocalStorage() {
      const cachedData = localStorage.getItem('iqa_cache');
      return cachedData ? JSON.parse(cachedData) : {};
    },
    addEventLog(message) {
      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}${now.toLocaleString('en-US', { month: 'short' }).toUpperCase()}-${now.toLocaleTimeString()}`;
      this.notificationLogs.unshift(`${formattedDate} : ${message}`);
    }
  }
};
</script>
