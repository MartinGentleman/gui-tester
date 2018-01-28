<template>
    <div id="NavigationComponent" v-if="testGroups && routes" class="ui vertical inverted left menu container">
        <a @click="navigateByRouteName(route.name)" v-for="route in routes" class="item" title="Open test scenario">
            <i class="large icon" v-bind:class="testGroups[route.name].icon"></i>
            {{route.name}}
        </a>
        <a @click="navigateByRouteName('Test Editor')" class="item" title="Add new test scenario">
            <i class="large icon add square"></i>
            Add scenario
        </a>
    </div>
</template>

<script>
  import jsonFile from 'lib/json-file';

  export default {
    data () {
      return {
        testGroups: null,
        routes: null
      }
    },
    created () {
      const jsonTestGroups = jsonFile.readSync('data/tests/groups.json').testGroups;
      let counter = 0;
      const routes = Object.keys(jsonTestGroups).map(name => {
        return {
          path: '/test-group-' + ++counter,
          name: name,
          component: require('views/TestGroupView.vue')
        };
      });
      this.$router.addRoutes(routes);
      this.routes = routes;
      this.testGroups = jsonTestGroups;
    },
    mounted () {
      $('.ui.menu a.item').on('click', function () {
        $(this)
          .addClass('active')
          .siblings()
          .removeClass('active');
      });
    },
    methods: {
      navigateByRouteName (name) {
        this.$router.push({ name: name });
      }
    }
  }
</script>

<style scoped>
    i {
        position: relative;
        bottom: 3px;
    }
    #NavigationComponent {
        width: 100%;
        height: 100%;
        border-radius: 0;
        text-align: left;
    }
</style>
