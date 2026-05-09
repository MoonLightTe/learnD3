<template>
  <div class="batch-entry-page">
    <!-- 操作栏 -->
    <div class="batch-toolbar">
      <div class="toolbar-left">
        <el-date-picker
          :value="date"
          type="date"
          size="small"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
          @input="$emit('date-change', $event)"
        />
        <span class="toolbar-label">时间点：</span>
        <el-checkbox-group v-model="selectedTimepoints" size="small">
          <el-checkbox v-for="tp in allTimepoints" :key="tp" :label="tp">{{ tp }}</el-checkbox>
        </el-checkbox-group>
      </div>
      <div class="toolbar-right">
        <!-- <el-button size="small" @click="$emit('sync')">同步数据</el-button> -->
        <el-button size="small" @click="$emit('cancel')">取消</el-button>
        <el-button size="small" type="primary" @click="handleBatchSave">保存</el-button>
      </div>
    </div>

    <div class="batch-content">
      <!-- 左侧：患者选择 -->
      <div class="patient-panel">
        <el-input
          v-model="searchText"
          size="small"
          placeholder="搜索姓名/床号"
          prefix-icon="el-icon-search"
          clearable
          style="margin-bottom:10px"
        />
        <div class="patient-list">
          <div
            v-for="p in filteredPatients"
            :key="p.id"
            class="patient-item"
            :class="{ selected: isSelected(p.id) }"
            @click="togglePatient(p.id)"
          >
            <el-checkbox :value="isSelected(p.id)" @click.native.prevent="togglePatient(p.id)" />
            <span class="p-name">{{ p.name }}</span>
            <span class="p-bed">{{ p.bedNo }}床</span>
            <span class="p-dept">{{ p.dept }}</span>
          </div>
          <div v-if="filteredPatients.length === 0" class="empty-patients">无匹配患者</div>
        </div>
      </div>

      <!-- 右侧：批量录入表格 -->
      <div class="batch-table-panel">
        <div v-if="selectedPatientIds.length === 0" class="empty-table">
          请在左侧勾选患者
        </div>
        <table v-else class="batch-table">
          <thead>
            <tr>
              <th class="col-action">操作</th>
              <th class="col-bed">床号</th>
              <th class="col-name">姓名</th>
              <th class="col-hosp">住院日</th>
              <th class="col-surgery">术后天</th>
              <th v-for="tp in selectedTimepoints" :key="tp" class="timepoint-th">
                {{ tp }}
                <div class="sub-cols">
                  <span v-for="row in allRowConfigs" :key="row.key" class="sub-col">{{ row.label }}</span>
                </div>
              </th>
              <th v-for="np in nonTimepointConfigs" :key="'np-' + np.key" style="width:160px">{{ np.label }}</th>
              <th v-for="ci in customConfigs" :key="'ci-' + ci.key" style="width:140px">{{ ci.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="patient in selectedPatients" :key="patient.id">
              <td class="cell-center">
                <el-button type="text" size="mini" @click="previewPatient(patient)">预览</el-button>
              </td>
              <td class="cell-center">{{ patient.bedNo }}</td>
              <td class="cell-center">{{ patient.name }}</td>
              <td class="cell-center">{{ patient.hospDate }}</td>
              <td class="cell-center">{{ patient.postOpDays || '' }}</td>
              <td v-for="tp in selectedTimepoints" :key="tp" class="batch-cell">
                <div class="sub-cells">
                  <div v-for="row in allRowConfigs" :key="row.key" class="sub-cell-inline">
                    <component
                      :is="getComponent(row.component)"
                      :form-data="getPatientForm(patient.id)"
                      :timepoint="tp"
                      :row-config="row"
                      :template-config="templateConfig"
                      @change="handleDataChange"
                    />
                  </div>
                </div>
              </td>
              <td v-for="np in nonTimepointConfigs" :key="'np-' + np.key" class="batch-cell np-batch-cell">
                <!-- 血压 -->
                <blood-pressure-row
                  v-if="np.component === 'BloodPressureRow'"
                  :value="getNp(patient.id, np.key, {})"
                  @input="val => setNonTimepoint(patient.id, np.key, val)"
                  @change="handleDataChange"
                />
                <!-- 大便 -->
                <stool-inline-row
                  v-else-if="np.component === 'StoolInlineRow'"
                  :form-data="getPatientForm(patient.id)"
                  :row-config="np"
                  @change="handleDataChange"
                />
                <!-- 尿量 -->
                <urine-cell
                  v-else-if="np.component === 'UrineCell'"
                  :value="getNpVal(patient.id, np.key, 'value', '')"
                  :mark="getNpVal(patient.id, np.key, 'mark', '')"
                  @input="val => setNestedValue(patient.id, np.key, 'value', val)"
                  @mark-change="val => setNestedValue(patient.id, np.key, 'mark', val)"
                  @change="handleDataChange"
                />
                <!-- 输入+下拉通用组件 -->
                <input-with-select
                  v-else-if="np.component === 'InputWithSelect'"
                  :form-data="getPatientForm(patient.id)"
                  :row-config="np"
                  :input-placeholder="np.inputPlaceholder || np.label"
                  :select-placeholder="np.selectPlaceholder || '请选择'"
                  :select-options="np.selectOptions || []"
                  :unit="np.unit || ''"
                  :disable-input-on="np.disableInputOn || ''"
                  @change="handleDataChange"
                />
                <!-- 体液入量 -->
                <fluid-input
                  v-else-if="np.component === 'FluidInput'"
                  :value="getNpVal(patient.id, np.key, 'value', '')"
                  :hours="getNpVal(patient.id, np.key, 'hours', '')"
                  @input="val => setNestedValue(patient.id, np.key, 'value', val)"
                  @hours-change="val => setNestedValue(patient.id, np.key, 'hours', val)"
                  @change="handleDataChange"
                />
                <!-- 简单数值 -->
                <np-simple-input
                  v-else
                  :form-data="getPatientForm(patient.id)"
                  :row-config="np"
                  @change="handleDataChange"
                />
              </td>
              <td v-for="ci in customConfigs" :key="'ci-' + ci.key" class="batch-cell np-batch-cell">
                <custom-item
                  :form-data="getPatientForm(patient.id)"
                  :row-config="ci"
                  :input-type="ci.inputType || 'text'"
                  :unit="ci.unit || ''"
                  :options="ci.options || []"
                  :value-placeholder="ci.label"
                  @change="handleDataChange"
                  @label-change="$emit('label-change', $event)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import TEMPLATE_CONFIG from '../template.json'
import InlineTemperature from './InlineTemperature.vue'
import SimpleInputCell from './cells/SimpleInputCell.vue'
import RespirationCell from './cells/RespirationCell.vue'
import BloodPressureRow from './BloodPressureRow.vue'
import StoolInlineRow from './StoolInlineRow.vue'
import FluidInput from './FluidInput.vue'
import UrineCell from './UrineCell.vue'
import InputWithSelect from './cells/InputWithSelect.vue'
import NpSimpleInput from './cells/NpSimpleInput.vue'
import CustomItem from './cells/CustomItem.vue'

var COMPONENT_MAP = {
  InlineTemperature: 'InlineTemperature',
  InputCell: 'SimpleInputCell',
  RespirationCell: 'RespirationCell'
}

function createEmptyTimepoint() {
  return {
    temperature: { collectionMode: 2, value: '', coolingRecords: [] },
    pulse: { value: '', source: null },
    heartRate: { value: '', source: null },
    respiration: { value: '', ventilator: false }
  }
}

export default {
  name: 'BatchEntryPage',
  components: {
    InlineTemperature: InlineTemperature,
    SimpleInputCell: SimpleInputCell,
    RespirationCell: RespirationCell,
    BloodPressureRow: BloodPressureRow,
    StoolInlineRow: StoolInlineRow,
    FluidInput: FluidInput,
    UrineCell: UrineCell,
    InputWithSelect: InputWithSelect,
    NpSimpleInput: NpSimpleInput,
    CustomItem: CustomItem
  },
  props: {
    date: { type: String, default: '' },
    patients: { type: Array, default: function () { return [] } },
    templateConfig: { type: Object, default: function () { return TEMPLATE_CONFIG } }
  },
  data: function () {
    return {
      searchText: '',
      selectedTimepoints: [TEMPLATE_CONFIG.timepoints[0]],
      selectedPatientIds: [],
      patientForms: {}
    }
  },
  computed: {
    allTimepoints: function () {
      return TEMPLATE_CONFIG.timepoints || []
    },
    allRowConfigs: function () {
      return TEMPLATE_CONFIG.rows || []
    },
    nonTimepointConfigs: function () {
      return TEMPLATE_CONFIG.nonTimepoint || []
    },
    customConfigs: function () {
      return (TEMPLATE_CONFIG.customItems || []).filter(function (item) {
        return item.key
      })
    },
    filteredPatients: function () {
      var q = this.searchText.trim().toLowerCase()
      if (!q) return this.patients
      return this.patients.filter(function (p) {
        return (p.name || '').toLowerCase().indexOf(q) >= 0 ||
               String(p.bedNo || '').indexOf(q) >= 0
      })
    },
    selectedPatients: function () {
      var ids = this.selectedPatientIds
      return this.patients.filter(function (p) { return ids.indexOf(p.id) >= 0 })
    }
  },
  methods: {
    isSelected: function (id) {
      return this.selectedPatientIds.indexOf(id) >= 0
    },
    togglePatient: function (id) {
      var idx = this.selectedPatientIds.indexOf(id)
      if (idx >= 0) {
        this.selectedPatientIds.splice(idx, 1)
      } else {
        this.selectedPatientIds.push(id)
        this.initPatientForm(id)
      }
    },

    // 初始化某患者的 formData
    initPatientForm: function (patientId) {
      if (this.patientForms[patientId]) return
      var form = {
        date: this.date,
        timepoints: {},
        nonTimepoint: {},
        events: []
      }
      var self = this
      this.allTimepoints.forEach(function (tp) {
        form.timepoints[tp] = createEmptyTimepoint()
      })
      var npConfigs = TEMPLATE_CONFIG.nonTimepoint || []
      npConfigs.forEach(function (item) {
        form.nonTimepoint[item.key] = {}
      })
      var customConfigs = TEMPLATE_CONFIG.customItems || []
      customConfigs.forEach(function (item) {
        if (item.key) form.nonTimepoint[item.key] = {}
      })
      this.$set(this.patientForms, patientId, form)
    },

    getPatientForm: function (patientId) {
      return this.patientForms[patientId] || { timepoints: {}, nonTimepoint: {}, events: [] }
    },

    getComponent: function (componentField) {
      return COMPONENT_MAP[componentField] || 'SimpleInputCell'
    },

    // nonTimepoint 读取
    getNp: function (patientId, key, fallback) {
      var form = this.patientForms[patientId]
      if (!form) return fallback
      var val = form.nonTimepoint[key]
      return val != null ? val : fallback
    },

    getNpVal: function (patientId, parent, key, fallback) {
      var form = this.patientForms[patientId]
      if (!form) return fallback != null ? fallback : ''
      var obj = form.nonTimepoint[parent]
      if (obj == null) return fallback != null ? fallback : ''
      var val = obj[key]
      return val != null ? val : (fallback != null ? fallback : '')
    },

    // nonTimepoint 写入
    setNonTimepoint: function (patientId, key, val) {
      var form = this.patientForms[patientId]
      if (!form) return
      if (!form.nonTimepoint[key]) {
        this.$set(form.nonTimepoint, key, val)
      } else {
        Object.assign(form.nonTimepoint[key], val)
      }
    },

    setNestedValue: function (patientId, parent, key, val) {
      var form = this.patientForms[patientId]
      if (!form) return
      if (!form.nonTimepoint[parent]) {
        this.$set(form.nonTimepoint, parent, {})
      }
      this.$set(form.nonTimepoint[parent], key, val)
    },

    handleDataChange: function () {
      this.$emit('change')
    },

    previewPatient: function (patient) {
      this.$emit('preview', patient)
    },

    handleBatchSave: function () {
      if (this.selectedPatientIds.length === 0) {
        this.$message.warning('请至少选择一个患者')
        return
      }
      if (this.selectedTimepoints.length === 0) {
        this.$message.warning('请至少选择一个时间点')
        return
      }
      this.$emit('save', {
        date: this.date,
        timepoints: this.selectedTimepoints,
        patientIds: this.selectedPatientIds,
        patientForms: this.patientForms
      })
    }
  }
}
</script>

<style lang="less" scoped>
.batch-entry-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.batch-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
}
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.toolbar-label {
  font-size: 13px;
  color: #606266;
}
.toolbar-right {
  display: flex;
  gap: 8px;
}
.batch-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.patient-panel {
  width: 220px;
  border-right: 1px solid #eee;
  padding: 12px;
  overflow-y: auto;
  background: #fafafa;
}
.patient-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.patient-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  &:hover { background: #f0f0f0; }
  &.selected { background: #e3f2fd; }
}
.p-name { font-weight: 500; }
.p-bed { color: #999; font-size: 12px; }
.p-dept { color: #bbb; font-size: 11px; margin-left: auto; }
.empty-patients {
  text-align: center;
  color: #c0c4cc;
  font-size: 12px;
  padding: 24px 0;
}
.batch-table-panel {
  flex: 1;
  overflow: auto;
  padding: 12px;
}
.empty-table {
  text-align: center;
  color: #c0c4cc;
  font-size: 13px;
  padding: 48px 0;
}
.batch-table {
  border-collapse: collapse;
  font-size: 12px;
}
.batch-table th {
  background: #f5f5f5;
  padding: 8px 6px;
  border: 1px solid #eee;
  font-weight: 500;
  text-align: center;
}
.col-action { width: 65px; }
.col-bed { width: 65px; }
.col-name { width: 80px; }
.col-hosp { width: 80px; }
.col-surgery { width: 70px; }
.batch-table td {
  padding: 4px;
  border: 1px solid #eee;
  text-align: center;
  vertical-align: middle;
}
.timepoint-th {
  width: 500px;
  min-width: 500px;
}
.sub-cols {
  display: flex;
  gap: 1px;
  margin-top: 4px;
  justify-content: space-around;
}
.sub-col {
  flex: 1;
  font-size: 10px;
  color: #999;
  font-weight: normal;
}
.sub-cells {
  display: flex;
  gap: 2px;
  align-items: center;
}
.sub-cell-inline {
  flex: 1;
  min-width: 0;
}
.batch-cell {
  text-align: center;
  padding: 2px 4px;
}
.np-batch-cell {
  padding: 4px 6px;
}
.cell-center {
  text-align: center;
}
</style>
