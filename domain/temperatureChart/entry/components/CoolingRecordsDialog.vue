<template>
  <el-dialog
    title="降温记录"
    :visible.sync="dialogVisible"
    width="560px"
    @close="handleClose"
  >
    <div class="cooling-section">
      <div class="cooling-header">
        <span class="cooling-count">共 {{ records.length }} 条记录</span>
        <el-button type="text" size="small" icon="el-icon-plus" @click="addRecord">添加</el-button>
      </div>
      <div v-if="records.length === 0" class="cooling-empty">暂无降温记录，点击上方「添加」新增</div>
      <div v-for="(record, index) in records" :key="index" class="cooling-row">
        <el-select v-model="record.coolingType" size="small" placeholder="类型" style="width:110px">
          <el-option v-for="t in coolingTypes" :key="t" :label="t" :value="t" />
        </el-select>
        <el-input v-model="record.temperature" size="small" placeholder="体温" style="width:120px">
          <template slot="append">℃</template>
        </el-input>
        <el-select v-model="record.measureType" size="small" placeholder="方式" style="width:100px">
          <el-option v-for="m in measureTypes" :key="m.label" :label="m.label" :value="m.label" />
        </el-select>
        <el-time-picker v-model="record.time" size="small" format="HH:mm" value-format="HH:mm" placeholder="时间" style="width:130px" />
        <span class="del-btn" @click="removeRecord(index)"><i class="el-icon-delete"></i></span>
      </div>
    </div>

    <span slot="footer">
      <el-button size="small" @click="handleClose">取消</el-button>
      <el-button size="small" type="primary" @click="handleConfirm">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { COOLING_RECORD_TYPES, COOLING_MEASURE_TYPES } from '../constants.js'

export default {
  name: 'CoolingRecordsDialog',
  props: {
    visible: { type: Boolean, default: false },
    records: { type: Array, default: function () { return [] } }
  },
  data: function () {
    return {
      coolingTypes: COOLING_RECORD_TYPES,
      measureTypes: COOLING_MEASURE_TYPES,
      localRecords: []
    }
  },
  computed: {
    dialogVisible: {
      get: function () { return this.visible },
      set: function (val) { this.$emit('update:visible', val) }
    }
  },
  watch: {
    visible: function (val) {
      if (val) {
        this.localRecords = this.records.map(function (r) { return Object.assign({}, r) })
      }
    }
  },
  methods: {
    addRecord: function () {
      this.localRecords.push({ coolingType: '物理降温', temperature: '', measureType: '腋温', time: '' })
    },
    removeRecord: function (index) {
      this.localRecords.splice(index, 1)
    },
    handleConfirm: function () {
      this.$emit('confirm', this.localRecords.slice())
      this.dialogVisible = false
    },
    handleClose: function () {
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.cooling-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.cooling-count {
  font-size: 12px;
  color: #999;
}
.cooling-empty {
  text-align: center;
  color: #c0c4cc;
  font-size: 12px;
  padding: 20px 0;
}
.cooling-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  padding: 8px 10px;
  background: #f9fbe7;
  border-radius: 4px;
}
.del-btn {
  cursor: pointer;
  color: #ccc;
  font-size: 14px;
  flex-shrink: 0;
  &:hover { color: #d32f2f; }
}
</style>
