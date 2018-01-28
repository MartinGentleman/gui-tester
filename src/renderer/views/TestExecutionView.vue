<template>
    <div id="TestExecutionView">
        <h1>{{$route.params.testGroup.title}}</h1>
        <button class="ui button" @click="toggleConsole">
            <i class="ui icon terminal"></i>
            <span v-if="consoleVisible">Close Console</span>
            <span v-else>View Console</span>
        </button>
        <div v-if="consoleVisible" v-html="debugInformation" id="console"></div>
        <h2 v-if="testRunning === true">Running...</h2>
        <h2 v-else class="minusMargin">Results</h2>
        <br />
        <div v-for="testResult in testResults" class="marginTop">
            <TestResult :testResult="testResult"></TestResult>
        </div>
    </div>
</template>

<script>
  import { spawn, fork } from 'child_process'
  import { chmodSync } from 'fs';
  import TestResult from 'components/TestResult';

  const unpackedStaticDir = __static.replace('app.asar', 'app.asar.unpacked');

  export default {
    components: {
      TestResult
    },
    data () {
      return {
        testResults: [],
        testRunning: true,
        consoleVisible: false,
        debugInformation: ''
      }
    },
    created () {
      this.startTestingInBatches(this.$route.params.testGroup, this.$route.params.targets);
    },
    methods: {
      toggleConsole () {
        this.consoleVisible = !this.consoleVisible;
        return this.consoleVisible;
      },
      getTestParserPromise (test, url) {
        return new Promise((resolve, reject) => {
          const node = fork(`${unpackedStaticDir}/bin/test-parser.js`, [`${unpackedStaticDir}/data/tests/definitions/${test}`, url, false], { silent: true });
          node.stdout.on('data', data => {
            this.debugInformation += `<strong style="color:green;">Test Parser:</strong> ${data}<br/>`;
            const json = JSON.parse(data);
            this.testResults.push(json);
            resolve(json);
          });
          node.stderr.on('data', data => {
              this.debugInformation += `<strong style="color:red;">Test Parser Error:</strong> ${data}<br/>`;
              return reject(data);
          });
        });
      },
      urlsToBatchesOfPromises (testGroup, urls) {
        let batches = [];
        for (let i = 0; i < urls.length; i++) {
          if (i % 5 === 0) {
            batches.push(urls.slice(i, i + 5));
          }
        }
        let promiseBatches = Promise.resolve();
        batches.forEach(batch => {
          promiseBatches = promiseBatches.then(() => {
            const promises = [];
            batch.forEach(url => {
              promises.push(this.getTestParserPromise(testGroup['test cases'][0]['definition'], url));
            });
            return Promise.all(promises);
          });
        });
        return promiseBatches;
      },
      startTestingInBatches (testGroup, targets) {
        chmodSync(`${unpackedStaticDir}/bin/chromedriver`, '755');
        const selenium = spawn('java', ['-jar', `-Dwebdriver.chrome.driver=${unpackedStaticDir}/bin/chromedriver`,
          `${unpackedStaticDir}/bin/selenium-server-standalone-3.4.0.jar`, '-role', 'standalone']);
        selenium.stderr.on('data', data => {
          this.debugInformation += `<strong>Selenium:</strong> ${data}<br/>`;
          if (('' + data).substr(-34) === 'Selenium Server is up and running\n') {
            this.urlsToBatchesOfPromises(testGroup, targets).then(
              () => {
                this.testRunning = false;
                selenium.kill();
              },
              () => {
                this.testRunning = false;
                selenium.kill();
              }
            );
          }
        });
      }
    }
  }
</script>

<style scoped>
    .marginTop {
        margin-top: 20px;
    }
    .minusMargin {
        margin-bottom: -20px;
    }
    #console {
        background: black;
        color: white;
        height: 300px;
        padding: 10px;
        overflow: scroll;
        margin: 20px 0;
    }
</style>
