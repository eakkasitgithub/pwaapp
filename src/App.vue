// Install Vue.js, Vue2-Leaflet, and Axios before running this code
// npm install vue leaflet vue2-leaflet axios

<template>
  <div id="app">
    <l-map @click="onMapClick" @contextmenu="onRightClick" :zoom="zoom" :center="center" style="height: 100vh;">
      <l-tile-layer :url="tileUrl" :attribution="tileAttribution" />
      <l-marker v-for="(marker, index) in markers" :key="index" :lat-lng="[marker.lat, marker.lng]">
        <l-popup>{{ marker.name }}<br>Carbon Rate: {{ marker.carbonRate }}</l-popup>
      </l-marker>
    </l-map>

    <div v-if="showDialog" class="dialog">
      <h3>Add Location</h3>
      <label>Name: <input v-model="newMarker.name" /></label>
      <label>Latitude: <input v-model="newMarker.lat" disabled /></label>
      <label>Longitude: <input v-model="newMarker.lng" disabled /></label>
      <label>Carbon Rate: <input v-model="newMarker.carbonRate" type="number" /></label>
      <button @click="addMarker">Save</button>
      <button @click="showDialog = false">Cancel</button>
    </div>

    <div v-if="showDeleteMenu" class="delete-menu" :style="{ top: menuY + 'px', left: menuX + 'px' }">
      <button @click="confirmDelete">Delete Marker</button>
    </div>
  </div>
</template>

<script>
import { LMap, LTileLayer, LMarker, LPopup } from 'vue2-leaflet';
import axios from 'axios';

export default {
  components: { LMap, LTileLayer, LMarker, LPopup },
  data() {
    return {
      zoom: 10,
      center: [13.736717, 100.523186], // Default location (Bangkok)
      tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      tileAttribution: '&copy; OpenStreetMap contributors',
      markers: [],
      showDialog: false,
      newMarker: { name: '', lat: 0, lng: 0, carbonRate: 0 },
      showDeleteMenu: false,
      selectedMarkerIndex: null,
      menuX: 0,
      menuY: 0,
    };
  },
  methods: {
    async fetchMarkers() {
      try {
        const response = await axios.get('YOUR_GOOGLE_SHEETS_API_URL');
        this.markers = response.data;
      } catch (error) {
        console.error('Error fetching markers:', error);
      }
    },
    onMapClick(e) {
      this.newMarker.lat = e.latlng.lat;
      this.newMarker.lng = e.latlng.lng;
      this.showDialog = true;
    },
    async addMarker() {
      try {
        await axios.post('YOUR_GOOGLE_SHEETS_API_URL', this.newMarker);
        this.markers.push({ ...this.newMarker });
        this.showDialog = false;
        this.newMarker = { name: '', lat: 0, lng: 0, carbonRate: 0 };
      } catch (error) {
        console.error('Error adding marker:', error);
      }
    },
    onRightClick(e) {
      const markerIndex = this.markers.findIndex(m => Math.abs(m.lat - e.latlng.lat) < 0.0001 && Math.abs(m.lng - e.latlng.lng) < 0.0001);
      if (markerIndex !== -1) {
        this.selectedMarkerIndex = markerIndex;
        this.menuX = e.originalEvent.pageX;
        this.menuY = e.originalEvent.pageY;
        this.showDeleteMenu = true;
      }
    },
    async confirmDelete() {
      if (this.selectedMarkerIndex !== null) {
        try {
          await axios.delete('YOUR_GOOGLE_SHEETS_API_URL', { data: this.markers[this.selectedMarkerIndex] });
          this.markers.splice(this.selectedMarkerIndex, 1);
        } catch (error) {
          console.error('Error deleting marker:', error);
        }
      }
      this.showDeleteMenu = false;
    },
  },
  mounted() {
    this.fetchMarkers();
  }
};
</script>

<style>
.dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}
.delete-menu {
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  padding: 5px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}
</style>
