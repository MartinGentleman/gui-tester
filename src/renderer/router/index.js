import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Landing Page',
      component: require('views/LandingPageView')
    },
    {
      path: '/test-execution',
      name: 'Test Execution',
      component: require('views/TestExecutionView')
    },
    {
      path: '/test-editor',
      name: 'Test Editor',
      component: require('views/TestEditorView')
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
