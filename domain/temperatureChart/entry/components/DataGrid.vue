<template>
  <div class="data-grid">
    <table>
      <thead>
        <!-- 列清空行 -->
        <tr>
          <th class="row-label-col" style="color:#999;font-weight:400">项目</th>
          <th v-for="tp in timepoints" :key="'clear-' + tp">
            <span
              class="col-clear"
              :class="{ disabled: isColumnEmpty(tp) }"
              title="清空该列数据"
              @click="handleClearColumn(tp)"
            >清空</span>
          </th>
        </tr>
        <!-- 时间行 -->
        <tr>
          <th class="row-label-col" style="background:#fff;color:#666;font-weight:500">时间</th>
          <th v-for="tp in timepoints" :key="'time-' + tp">
            <span class="tp-dot" :class="isColumnEmpty(tp) ? 'empty' : 'filled'" :title="isColumnEmpty(tp) ? '未填写' : '已填写'"></span>
            {{ tp }}
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- 动态行：由 templateConfig.rows 驱动 -->
        <tr v-for="row in rows" :key="row.key">
          <td class="row-label">
            {{ row.label }}
            <span v-if="row.unit" class="unit">{{ row.unit }}</span>
          </td>
          <td v-for="tp in timepoints" :key="row.key + '-' + tp">
            <component
              :is="getComponentName(row.component)"
              :form-data="formData"
              :timepoint="tp"
              :row-config="row"
              :template-config="templateConfig"
              @change="$emit('change')"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import InlineTemperature from './InlineTemperature.vue'
import SimpleInputCell from './cells/SimpleInputCell.vue'
import RespirationCell from './cells/RespirationCell.vue'

// component 字段 → 实际组件名映射
var COMPONENT_MAP = {
  InlineTemperature: 'InlineTemperature',
  InputCell: 'SimpleInputCell',
  RespirationCell: 'RespirationCell'
}

export default {
  name: 'DataGrid',
  components: { InlineTemperature, SimpleInputCell, RespirationCell },
  props: {
    formData: { type: Object, required: true },
    templateConfig: { type: Object, required: true }
  },
  data: function () {
    return {}
  },
  computed: {
    timepoints: function () {
      return this.templateConfig.timepoints || []
    },
    rows: function () {
      return this.templateConfig.rows || []
    }
  },
  methods: {
    getComponentName: function (componentField) {
      return COMPONENT_MAP[componentField] || 'SimpleInputCell'
    },

    // 该列是否无任何数据
    isColumnEmpty: function (tp) {
      var tpData = this.formData.timepoints[tp]
      if (!tpData) return true
      var hasData = false
      this.rows.forEach(function (row) {
        var field = tpData[row.key]
        if (field && field.value) hasData = true
      })
      return !hasData
    },

    // 列清空：确认弹窗
    handleClearColumn: function (tp) {
      if (this.isColumnEmpty(tp)) return
      this.$confirm('确定清空 ' + tp + ' 时间点的所有数据？', '提示', {
        confirmButtonText: '确定清空',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function () {
        this.$emit('clear-column', tp)
      }.bind(this)).catch(function () {})
    }
  }
}
</script>

<style lang="less" scoped>
.data-grid {
  overflow: visible;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

th, td {
  border: 1px solid #eee;
  padding: 6px 4px;
  text-align: center;
  vertical-align: middle;
  position: relative;
  transition: background 0.15s;
}

tbody td:hover {
  background: #f0f4ff;
}

th {
  background: #f8f9fa;
  color: #1976d2;
  font-weight: 600;
  font-size: 12px;
  padding: 8px;
}

.row-label-col {
  width: 110px;
}

.row-label {
  background: #fafafa;
  text-align: left;
  font-weight: 500;
  width: 110px;
  padding-left: 12px;
  font-size: 12px;
  color: #555;
  .unit {
    font-size: 10px;
    color: #999;
    font-weight: normal;
  }
}

.col-clear {
  cursor: pointer;
  color: #ccc;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 3px;
  &:hover { color: #d32f2f; background: #fee; }
  &.disabled {
    color: #e0e0e0;
    cursor: not-allowed;
    &:hover { color: #e0e0e0; background: transparent; }
  }
}

.tp-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  margin-right: 3px;
  vertical-align: middle;
  &.filled { background: #1a73e8; }
  &.empty { background: transparent; border: 1px solid #ccc; }
}
</style>
