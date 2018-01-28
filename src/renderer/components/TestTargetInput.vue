<template>
    <div id="TestTargetInputComponent">
        <div class="ui form">
            <div class="field">
                <label>URLs to test separated by new lines</label>
                <textarea v-model="textareaRawInput" placeholder="Use relative url /my-page.html or full url e.g. http://myweb.tld."></textarea>
            </div>
        </div>
    </div>
</template>

<script>
  import jsonFile from 'lib/json-file';

  const validURL = (site, url) => {
    const absoluteURL = '^(https?://)(www\\.)?([-a-z0-9]{1,63}\\.)*?[a-z0-9][-a-z0-9]{0,61}[a-z0-9]\\.[a-z]{2,6}(/[-\\w@\\+\\.~#\\?&/=%]*)?$';
    const relativeURL = '^(/[-\\w@\\+\\.~#\\?&/=%]*)$';
    const absoluteURLTester = new RegExp(absoluteURL, 'i');
    const relativeURLTester = new RegExp(relativeURL, 'i');
    if (absoluteURLTester.test(url)) {
      return url;
    } else if (relativeURLTester.test(url)) {
      return site + (site.substr(-1) === '/' ? site.substr(-1) : '') + url;
    } else {
      return null;
    }
  };

  const updateTargets = (recursion, site, targets) => {
    const [target, ...tail] = targets;
    const url = validURL(site, target.trim());
    if (url !== null) {
      recursion.add(url);
    }
    if (targets.length > 1) {
      return updateTargets(recursion, site, tail);
    } else {
      return recursion;
    }
  };

  export default {
    data () {
      return {
        textareaRawInput: '',
        textareaRouteInputs: {}
      }
    },
    watch: {
      '$route.name' () {
        this.textareaRawInput = this.textareaRouteInputs[this.$route.name] || '';
      },
      '$store.state.Site.url' () {
        this.updateTextareaRouteInputs();
      },
      textareaRawInput () {
        this.updateTextareaRouteInputs();
      }
    },
    methods: {
      updateTextareaRouteInputs () {
        const computed = Array.from(updateTargets(new Set(), this.$store.state.Site.url, this.textareaRawInput.split('\n')));
        this.textareaRouteInputs[this.$route.name] = this.textareaRawInput;
        this.$emit('targetsUpdated', computed);
      }
    }
  }
</script>

<style scoped>
</style>
