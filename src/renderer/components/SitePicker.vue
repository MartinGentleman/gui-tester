<template>
  <div id="SitePickerComponent">
    <form>
      <div>
        <label>
            Choose a site to test
        </label>
        <select class='ui dropdown' v-model='site'>
          <option v-for='(value, key) in sites' v-bind:value="key">
            {{ key }}
          </option>
        </select>
        <button class="circular ui icon tiny button" title="Edit list of sites">
          <i class="icon configure"></i>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
  import jsonFile from 'lib/json-file';
  export default {
    data () {
      return {
        sites: jsonFile.readSync('data/configuration/sites.json').sites
      }
    },
    created () {
      this.updateSite(Object.keys(this.sites)[0], this.sites[Object.keys(this.sites)[0]]);
    },
    mounted () {
      $('.ui.dropdown').dropdown();
    },
    computed: {
      site: {
        get () {
          return this.$store.state.Site.site;
        },
        set (site) {
          this.updateSite(site, this.sites[site]);
        }
      }
    },
    methods: {
      updateSite (site, url) {
        this.$store.commit('UPDATE_SITE', {
          site: site,
          url: url
        });
      }
    }
  }
</script>

<style scoped>
  label {
    display: block;
    font-weight: bold;
    clear: right;
  }
  select {
    width: auto !important;
  }
  button {
    position: relative;
    left: 5px;
  }
</style>
