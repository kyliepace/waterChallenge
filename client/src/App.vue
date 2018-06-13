<template>
  <div id="app">
    <div class='content'>
      <Map />
      <Info />
    </div>
    <Footer />
  </div>
</template>

<script>
import Map from './components/Map';
import Info from './components/Info';
import Footer from './components/Footer';

export default {
  name: 'app',
  components: {
    Map, 
    Info,
    Footer
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
