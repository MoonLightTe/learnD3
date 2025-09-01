<template>
  <div class="container">
    <div id="temperatureChart"></div>
  </div>
</template>

<script>
import data from "./mock/datas";
import { init } from "./utils/index.js";
export default {
  name: "temperatureChart",
  mounted() {
    init(data);
  },
};
</script>

<style lang="less" scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background-color: rgb(20, 161, 226);
  #temperatureChart {
    width: 980px;
    height: 100%;
    background-color: #fff;
  }
}
</style>
