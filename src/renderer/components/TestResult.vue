<template>
    <div id="TestResultComponent" class='ui segment' @click='toggleDetailVisibility'>
        <div>
            <strong>{{testResult.url}}</strong>
            <i v-if="hasError || hasBlocker || hasFail" class='warning sign large icon'></i>
            <i v-else-if="hasWarning" class='warning large icon'></i>
            <i v-else class='checkmark large icon'></i>
        </div>
        <div>
            {{testCaseExecutionTime}} s |
            <span v-if="hasBlocker">blocked: 1,</span>
            <span v-if="hasFail">fails: {{numberOfFailed}},</span>
            <span v-if="hasWarning">warnings: {{numberOfWarnings}},</span>
            <span>passed: {{numberOfPassed}}</span>
        </div>
        <div v-if="hasError" class="red">
            {{testResult.error}}
        </div>
        <div v-if="hasBlocker" class="red">
            {{blockMessage}}
        </div>
        <div v-if="testResult.testCases && testResult.testCases.length > 0" class="details">
            <div class="ui list">
                <div v-for="testCase in testResult.testCases" class="item">
                    <i v-if="testCase.status === 'block' || testCase.status === 'fail'" class='warning sign large icon'></i>
                    <i v-else-if="testCase.status === 'warn'" class='warning large icon'></i>
                    <i v-else class='checkmark large icon'></i>
                    {{testCase.message}}
                    ({{(testCase.end - testCase.start)/1000}} s)
                </div>
            </div>
        </div>
    </div>
</template>

<script>
  const $ = window.jQuery = require('jquery');

  export default {
    props: ['testResult'],
    data () {
      return {
        hasBlocker: false,
        blockMessage: '',
        hasFail: false,
        hasWarning: false,
        numberOfPassed: 0,
        numberOfFailed: 0,
        numberOfWarnings: 0
      }
    },
    computed: {
      testCaseExecutionTime: {
        get () {
          return (this.testResult.end - this.testResult.start) / 1000;
        }
      },
      hasError: {
        get () {
          return this.testResult.error !== null;
        }
      },
      hasPassed: {
        get () {
          return !this.hasError && !this.hasBlocker && !this.hasFail && !this.hasWarning;
        }
      }
    },
    created () {
      this.testResult.testCases.forEach(testCase => {
        if (testCase.status === 'block') {
          this.hasBlocker = true;
          this.blockMessage = testCase.message;
        } else if (testCase.status === 'fail') {
          this.hasFail = true;
          ++this.numberOfFailed;
        } else if (testCase.status === 'warn') {
          this.hasWarning = true;
          ++this.numberOfWarnings;
        } else {
          ++this.numberOfPassed;
        }
      });
    },
    methods: {
      toggleDetailVisibility () {
        $(event.target).closest('.segment').find('.details').toggle();
      }
    }
  }
</script>

<style scoped>
    #TestResultComponent>div>i {float:right;}
    #TestResultComponent>div>i.checkmark {color:green;}
    .warning {color:orange;}
    .warning.sign {color:red;}
    .red {color:red;}
    .yellow {color:yellow;}
    .details {margin-top:10px;display:none;}
    .details i {position:relative;bottom:5px;}
</style>
