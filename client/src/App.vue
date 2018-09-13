<template>
  <div id="app">
    <MapDiv
      :basin='basin'
      :downstreamRights='downstreamRights'
      @traceSuccess='traceSuccess'
      @next='next'
    ></MapDiv>
    <Display
      :counter='counter'
      @increaseCounter='increaseCounter'
      @saveStream='saveStream'
      @queryDatabase='queryDatabase'
    ></Display>
  </div>
</template>

<script>
import MapDiv from './components/Map.vue'
import Display from './components/Display.vue'
import axios from 'axios';

export default {
  name: 'app',
  components: {
    MapDiv, Display
  },
  data(){
    return {
      counter: 1,
      loading: false,
      extent: {},
      point: undefined,
      downstreamRights: [],
      basin: []
    }
  },
  methods: {
    traceSuccess(layers){
      this.stream = layers.polyline.graphics.map(graphic => {
        return graphic.geometry.paths[0]
      })[0];
      this.point = layers.origin;
    },

    next(isTrue){
      if (isTrue) {
        this.increaseCounter();
      }
      else {
        this.decreaseCounter();
      }
    },

    increaseCounter(){
      this.counter ++;
    },

    decreaseCounter() {
      if (this.counter > 1) {
        this.counter --;
      }
    },

    // saveStream(){
    //   console.log('save stream')
    //   this.loading = true;
    //   let stream = this.stream;

    //   try {
    //     axios.post('/save-stream', {
    //       geometry: stream
    //     })
    //     .then(() => {
    //       return this.queryDatabaseByStream();
    //     })
    //     .catch(err => {
    //       console.log(err);
    //     });
    //   }
    //   catch(err){
    //     console.log(err);
    //   }
    // },

    queryDatabaseByStream() {
      console.log('query database');
      let that = this;
      this.loading = true;
      // find points in RDS that are on the stream
      try {
        axios.post('/find-diverters', {
          geometry: that.stream
        })
        .then(res => {
          if (res.length > 0) {
            that.downstreamRights = res;
            // on success, define watershed from most downstream point
            console.log('most downstream pod: ', res[0])
            return that.findBasin(res);
          }
          else {
            throw new Error('no senior rights found');
          }
        })
        .catch(err => {
          throw err;
        })
      }
      catch(err) {
        console.log(err);
      }
    },

    findBasin(pnts) {
      console.log('find basin for all points and point: ', pnts[0]);
      this.basin = pnts[0];
      let that = this;

      try {
        Promise.all(pnts.map((point, index) => {
          return axios.get(`https://streamstatsags.cr.usgs.gov/streamstatsservices/watershed.geojson?rcode=CA&xlocation=${point.lat}&ylocation=${point.lng}&crs=4326&includeparameters=false&includeflowtypes=false&includefeatures=true&simplify=true`)
          .then(fc => {
            that.downstreamRights[index] = {
              basin: fc,
              point: point
            };
          })
          .catch(err => {
            throw err;
          })
        }))
        .then(() => {
          // draw basin and senior rights on map
          that.loading = false;
          that.increaseCounter();
        })
        .catch(err => {
          throw err;
        })
      }
      catch(err) {
        console.log(err);
      }
    },

    queryDatabaseByBasin() {
      let that = this;
      this.loading = true;
      try {
        axios.get('/sum-face-values', {
          basin: that.basin,
          points: that.downstreamRights
        })
        .then(res => {
          that.loading = false;
          console.log('upstream diverters at each pod on stream', res);
          // create table with downstreamRights PODs on stream and the upstream demand at each POD
        })
        .catch(err => {
          throw err;
        })
      }
      catch(err){
        console.log(err);
      }
    }
  }
}
</script>

<style>
/* esri styles */

@import url('https://fonts.googleapis.com/css?family=Poppins');

#app {
  font-family: 'Poppins', 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  display: flex;
}

html, body, #map, #info{
    height: 100vh;
    width: 100%;
    margin: 0px;
    padding: 0px;
    overflow: hidden;
}

* {
  box-sizing: border-box;
}
</style>
