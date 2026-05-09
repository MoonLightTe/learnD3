<template>
  <el-dialog
    :title="'体温录入 — ' + (timepoint || '')"
    :visible.sync="visible"
    width="620px"
    @close="handleClose"
  >
    <div class="temp-form">
      <div class="form-inline">
        <div class="form-row">
          <div class="form-label">测量类型</div>
          <el-select :value="form.collectionMode" size="small" placeholder="请选择" @input="handleTypeChange">
            <el-option-group label="常规测温">
              <el-option
                v-for="t in normalTypes"
                :key="t.collectionMode"
                :label="t.label"
                :value="t.collectionMode"
              />
            </el-option-group>
            <el-option-group label="降温措施">
              <el-option
                v-for="t in coolingMeasureTypes"
                :key="t.collectionMode"
                :label="t.label"
                :value="t.collectionMode"
              />
            </el-option-group>
            <el-option-group label="特殊类型">
              <el-option
                v-for="t in specialTypes"
                :key="t.value"
                :label="t.label"
                :value="t.value"
              />
            </el-option-group>
          </el-select>
        </div>
        <div v-if="showValueInput" class="form-row">
          <div class="form-label">体温数值 ℃</div>
          <el-input
            :value="form.value"
            size="small"
            placeholder="请输入体温"
            :class="{ 'is-warn': alertMsg }"
            @input="handleValueInput"
          />
          <div v-if="alertMsg" class="alert-text">{{ alertMsg }}</div>
        </div>
      </div>

      <!-- 降温记录 -->
      <div class="cooling-section">
        <div class="cooling-header">
          <span class="cooling-title">降温记录</span>
          <el-button type="text" size="small" icon="el-icon-plus" @click="addCoolingRecord">添加</el-button>
        </div>
        <div v-if="form.coolingRecords.length === 0" class="cooling-empty">暂无降温记录</div>
        <div v-for="(record, index) in form.coolingRecords" :key="index" class="cooling-row">
          <el-select v-model="record.coolingType" size="small" placeholder="类型" style="width:120px">
            <el-option v-for="t in coolingTypes" :key="t" :label="t" :value="t" />
          </el-select>
          <el-input v-model="record.temperature" size="small" placeholder="体温" style="width:140px">
            <template slot="append">℃</template>
          </el-input>
          <el-select v-model="record.measureType" size="small" placeholder="方式" style="width:110px">
            <el-option v-for="m in measureTypes" :key="m.label" :label="m.label" :value="m.label" />
          </el-select>
          <el-time-picker v-model="record.time" size="small" format="HH:mm" value-format="HH:mm" placeholder="时间" style="width:140px" />
          <span class="del-btn" @click="removeCoolingRecord(index)"><i class="el-icon-delete"></i></span>
        </div>
      </div>
    </div>

    <span slot="footer">
      <el-button size="small" @click="handleClose">取消</el-button>
      <el-button size="small" type="primary" @click="handleConfirm">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { TEMPERATURE_TYPES, TEMPERATURE_SPECIAL_TYPES, TEMPERATURE_COOLING_TYPES, COOLING_RECORD_TYPES, COOLING_MEASURE_TYPES } from '../constants.js'

export default {
  name: 'TemperatureDialog',
  props: {
    visible: { type: Boolean, default: false },
    data: { type: Object, default: function () { return {} } },
    timepoint: { type: String, default: '' }
  },
  data: function () {
    return {
      normalTypes: TEMPERATURE_TYPES,
      coolingMeasureTypes: TEMPERATURE_COOLING_TYPES,
      specialTypes: TEMPERATURE_SPECIAL_TYPES,
      coolingTypes: COOLING_RECORD_TYPES,
      measureTypes: COOLING_MEASURE_TYPES,
      form: this.getDefaultForm()
    }
  },
  computed: {
    showValueInput: function () {
      return typeof this.form.collectionMode === 'number'
    },
    alertMsg: function () {
      var v = parseFloat(this.form.value)
      if (isNaN(v)) return ''
      if (v < 34) return '体温偏低，请确认'
      if (v > 42) return '体温偏高，请确认'
      if (v >= 38.5) return '超出警戒值（≥38.5℃），请确认'
      return ''
    }
  },
  watch: {
    visible: function (val) {
      if (val && this.data) {
        this.form = {
          collectionMode: this.data.collectionMode != null ? this.data.collectionMode : 2,
          value: this.data.value || '',
          coolingRecords: this.data.coolingRecords ? this.data.coolingRecords.slice() : []
        }
      }
    }
  },
  methods: {
    getDefaultForm: function () {
      return { collectionMode: 2, value: '', coolingRecords: [] }
    },
    // 限制1位小数
    handleValueInput: function (val) {
      var cleaned = val.replace(/[^\d.]/g, '')
      var parts = cleaned.split('.')
      if (parts.length > 1) {
        parts[1] = parts[1].substring(0, 1)
      }
      this.form.value = parts.join('.')
    },
    handleTypeChange: function (val) {
      if (typeof val === 'string') {
        if (this.form.value && !isNaN(Number(this.form.value))) {
          this.$confirm('当前已有体温数值 ' + this.form.value + '℃，切换为' + val + '将清空数值，是否继续？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(function () {
            this.form.value = val
            this.form.collectionMode = val
          }.bind(this)).catch(function () {})
        } else {
          this.form.value = val
          this.form.collectionMode = val
        }
      } else {
        this.form.collectionMode = val
        if (typeof this.form.value === 'string' && isNaN(Number(this.form.value))) {
          this.form.value = ''
        }
      }
    },
    addCoolingRecord: function () {
      this.form.coolingRecords.push({
        coolingType: '物理降温',
        temperature: '',
        measureType: '腋温',
        time: ''
      })
    },
    removeCoolingRecord: function (index) {
      this.form.coolingRecords.splice(index, 1)
    },
    handleConfirm: function () {
      this.$emit('confirm', Object.assign({}, this.form))
      this.$emit('update:visible', false)
    },
    handleClose: function () {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="less" scoped>
.temp-form {
  padding: 0 4px;
}

.form-inline {
  display: flex;
  gap: 16px;
}

.form-row {
  flex: 1;
  margin-bottom: 14px;
}

.form-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.alert-text {
  color: #e65100;
  font-size: 11px;
  margin-top: 4px;
}

.is-warn {
  /deep/ .el-input__inner {
    border-color: #f57c00;
    background: #fff8f8;
  }
}

.cooling-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.cooling-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.cooling-title {
  font-size: 13px;
  font-weight: 500;
  color: #2e7d32;
}

.cooling-empty {
  text-align: center;
  color: #c0c4cc;
  font-size: 12px;
  padding: 16px 0;
}

.cooling-row {
  display: flex;
  align-items: center;
  gap: 8px;
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
