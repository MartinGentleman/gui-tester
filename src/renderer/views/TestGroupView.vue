<template>
    <div id="TestGroupView">
        <div v-if="testGroup.title && testGroup['test cases']">
            <h1>{{testGroup.title}}</h1>
            <div class="ui icon top right floated pointing dropdown button" title="Test scenario settings">
                <i class="setting icon"></i>
                <i class="dropdown icon"></i>
                <div class="menu">
                    <a class="item">
                        <i class="edit icon"></i>
                        Edit
                    </a>
                    <a class="item">
                        <i class="trash icon"></i>
                        Delete
                    </a>
                </div>
            </div>
            <site-picker class="clear"></site-picker>
            <TestTargetInput v-on:targetsUpdated="updateTargets" class="marginTop"></TestTargetInput>
            <br />
            <p>Number of urls: {{targets.length}}</p>
            <button :class="{ disabled: pickedTargets.length === 0 }"  class='ui primary button' @click='startTesting' title="Execute test scenario">
                Start Testing
            </button>
            <TestTargetPicker v-on:pickedTargetsUpdated="updatePickedTargets" :targets="targets" class="marginTop"></TestTargetPicker>
        </div>
        <div v-else>
            <h1>Configuration Issue</h1>
            <p>Test group configuration is malformed.</p>
        </div>
    </div>
</template>

<script>
  import jsonFile from 'lib/json-file';
  import SitePicker from 'components/SitePicker';
  import TestTargetInput from 'components/TestTargetInput';
  import TestTargetPicker from 'components/TestTargetPicker';

  export default {
    components: {
      SitePicker,
      TestTargetInput,
      TestTargetPicker
    },
    data () {
      return {
        targets: [],
        pickedTargets: []
      }
    },
    mounted () {
      $('.ui.dropdown').dropdown();
    },
    computed: {
      testGroup: {
        get () {
          return jsonFile.readSync('data/tests/groups.json').testGroups[this.$route.name];
        }
      }
    },
    methods: {
      updateTargets (targets) {
        this.targets = targets;
      },
      updatePickedTargets (pickedTargets) {
        this.pickedTargets = pickedTargets;
      },
      startTesting () {
        this.$router.push({name: 'Test Execution', params: {testGroup: this.testGroup, targets: this.targets}})
      }
    }
  }
</script>

<style scoped>
    h1 {
        float: left;
    }
    .marginTop {
        margin-top: 20px !important;
    }
    .clear {
        clear: both !important;
    }
</style>
