<template>
  <div id="app">
    <div class="ui grid leftColumn">
      <div class="four wide column leftColumn">
        <navigation></navigation>
      </div>
      <div class="twelve wide column rightColumn">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
  import Navigation from 'components/Navigation';

  export default {
    name: 'martins-tester',
    components: {
      Navigation
    }
  }
</script>

<style>
  @import url(https://fonts.googleapis.com/css?family=Lato:300);
  * {
    margin: 0;
    padding: 0;
  }
  a {color: white;}
  html,
  body { height: 100%; }
  body {
    align-items: center;
    background:
      radial-gradient(
        ellipse at center,
        rgba(255, 255, 255, 1) 0%,
        rgba(229, 229, 229, .85) 100%
    );
    background-position: center;
    display: flex;
    font-family: Lato, Helvetica, sans-serif;
    justify-content: center;
    text-align: center;
  }
  .leftColumn {
    height: 100%;
    padding: 0 !important;
    margin: 0 !important;
  }
  .rightColumn {
    padding: 50px !important;
    text-align: left;
    overflow: scroll;
  }
  #app {
    width: 100%;
    height: 100%;
  }
</style>
