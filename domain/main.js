import Vue from "vue";
import App from "./App.vue";
import temperatureChart from './temperatureChart/index.vue'

Vue.component("temperatureChart", temperatureChart)
const app = new Vue({
  el: "#root",
  render: (h) => h(App),
});

export default app;
