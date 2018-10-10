<template>
  <div id='loading' v-show='loading'>
    <h1>Loading</h1>
  </div>
</template>

<script>
export default {
  name: 'Loading',
  props: ['loading']
}
</script>

<style scoped>
  #loading{
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: white;
    padding-left: 50%;
    padding-top: 40%;
  }
</style>

