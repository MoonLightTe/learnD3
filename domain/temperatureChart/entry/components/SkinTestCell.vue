<template>
  <div class="skin-test-cell" :class="{ 'positive': result === '阳性' }">
    <el-input :value="drugName" size="mini" placeholder="药物名称" style="width:160px" @input="handleDrugChange" />
    <el-select :value="result" size="mini" style="width:80px" @change="handleResultChange">
      <el-option v-for="r in results" :key="r" :label="r" :value="r" />
    </el-select>
  </div>
</template>

<script>
import { SKIN_TEST_RESULTS } from '../constants.js'

export default {
  name: 'SkinTestCell',
  props: {
    drugName: { type: String, default: '' },
    result: { type: String, default: '' }
  },
  data() {
    return { results: SKIN_TEST_RESULTS }
  },
  methods: {
    handleDrugChange(val) {
      this.$emit('drug-change', val)
      this.$emit('change')
    },
    handleResultChange(val) {
      this.$emit('result-change', val)
      this.$emit('change')
    }
  }
}
</script>

<style lang="less" scoped>
.skin-test-cell {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  border: 2px solid transparent;
  transition: all 0.2s;
}
.skin-test-cell.positive {
  border-color: #f57c00;
  background: #fff3e0;
}
</style>
