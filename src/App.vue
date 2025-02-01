<template>
  <div id="app">
    <h1>Hello World HELLO</h1>
    <p>Last saved at: {{ lastSaved }}</p>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      lastSaved: ''
    }
  },
  created() {
    // Capture the time when the component is created.
    this.lastSaved = new Date().toLocaleString();
  }
}
</script>

<style>
/* Your styles here */
</style>
