import Vue from "vue";
import App from "./App.vue";

function getComponent() {
  const btn = document.createElement("button");
  btn.innerHTML = "hello webpack";
  btn.onclick = printLog;
  return btn;
}

function printLog() {
  console.log("this is webpack");
}

document.body.appendChild(getComponent());

/* eslint-disable no-new */
const VueObj = new Vue({
  el: "#root",
  render: h => h(App)
});
export default VueObj;
