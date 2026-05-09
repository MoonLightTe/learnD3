import Vue from "vue";
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from "./App.vue";
import temperatureChart from './temperatureChart/index.vue'

Vue.use(ElementUI);

Vue.component("temperatureChart", temperatureChart)
const app = new Vue({
  el: "#root",
  render: (h) => h(App),
});

export default app;
