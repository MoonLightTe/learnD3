<template>
  <div class="non-timepoint-section">
    <table class="np-table">
      <tbody>
        <!-- 动态行：由 templateConfig.nonTimepoint 驱动 -->
        <tr v-for="row in rows" :key="row.key">
          <td class="row-label">
            {{ row.label }}
            <span v-if="row.unit" class="unit">{{ row.unit }}</span>
          </td>
          <td class="np-cell" colspan="4">
            <!-- 血压 -->
            <blood-pressure-row
              v-if="row.component === 'BloodPressureRow'"
              :value="getNp(row.key, {})"
              @input="val => setNonTimepoint(row.key, val)"
            />
            <!-- 大便 -->
            <stool-inline-row
              v-else-if="row.component === 'StoolInlineRow'"
              :form-data="formData"
              :row-config="row"
              @change="$emit('change')"
            />
            <!-- 输入+下拉通用组件 -->
            <input-with-select
              v-else-if="row.component === 'InputWithSelect'"
              :form-data="formData"
              :row-config="row"
              :input-placeholder="row.inputPlaceholder || row.label"
              :select-placeholder="row.selectPlaceholder || '请选择'"
              :select-options="row.selectOptions || []"
              :unit="row.unit || ''"
              :disable-input-on="row.disableInputOn || ''"
              @change="$emit('change')"
            />
            <!-- 尿量 -->
            <urine-cell
              v-else-if="row.component === 'UrineCell'"
              :value="getNpVal(row.key, 'value', '')"
              :mark="getNpVal(row.key, 'mark', '')"
              @input="val => setNestedValue(row.key, 'value', val)"
              @mark-change="val => setNestedValue(row.key, 'mark', val)"
              @change="$emit('change')"
            />
            <!-- 体液入量 -->
            <fluid-input
              v-else-if="row.component === 'FluidInput'"
              :value="getNpVal(row.key, 'value', '')"
              :hours="getNpVal(row.key, 'hours', '')"
              @input="val => setNestedValue(row.key, 'value', val)"
              @hours-change="val => setNestedValue(row.key, 'hours', val)"
              @change="$emit('change')"
            />
            <!-- 简单数值输入 -->
            <np-simple-input
              v-else
              :form-data="formData"
              :row-config="row"
              @change="$emit('change')"
            />
          </td>
        </tr>
        <!-- 自定义录入项 -->
        <tr v-for="row in customRows" :key="row.key">
          <td class="row-label">
            <span style="color:#1a73e8;font-size:11px">★</span>
            {{ row.label }}
            <span v-if="row.unit" class="unit">{{ row.unit }}</span>
          </td>
          <td class="np-cell" colspan="4">
            <custom-item
              :form-data="formData"
              :row-config="row"
              :input-type="row.inputType || 'text'"
              :unit="row.unit || ''"
              :options="row.options || []"
              :value-placeholder="row.label"
              @change="$emit('change')"
              @label-change="payload => $emit('label-change', payload)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import BloodPressureRow from './BloodPressureRow.vue'
import StoolInlineRow from './StoolInlineRow.vue'
import UrineCell from './UrineCell.vue'
import FluidInput from './FluidInput.vue'
import InputWithSelect from './cells/InputWithSelect.vue'
import NpSimpleInput from './cells/NpSimpleInput.vue'
import CustomItem from './cells/CustomItem.vue'

export default {
  name: 'NonTimepointSection',
  components: { BloodPressureRow, StoolInlineRow, UrineCell, FluidInput, InputWithSelect, NpSimpleInput, CustomItem },
  props: {
    formData: { type: Object, required: true },
    templateConfig: { type: Object, required: true }
  },
  computed: {
    rows: function () {
      return this.templateConfig.nonTimepoint || []
    },
    customRows: function () {
      return (this.templateConfig.customItems || []).filter(function (item) {
        return item.key
      })
    }
  },
  methods: {
    getNp: function (key, fallback) {
      var val = this.formData.nonTimepoint[key]
      return val != null ? val : fallback
    },

    getNpVal: function (parent, key, fallback) {
      var obj = this.formData.nonTimepoint[parent]
      if (obj == null) return fallback != null ? fallback : ''
      var val = obj[key]
      return val != null ? val : (fallback != null ? fallback : '')
    },

    setNonTimepoint: function (key, val) {
      if (!this.formData.nonTimepoint[key]) {
        this.$set(this.formData.nonTimepoint, key, val)
      } else {
        Object.assign(this.formData.nonTimepoint[key], val)
      }
      this.$emit('change')
    },

    setNestedValue: function (parent, key, val) {
      if (!this.formData.nonTimepoint[parent]) {
        this.$set(this.formData.nonTimepoint, parent, {})
      }
      this.$set(this.formData.nonTimepoint[parent], key, val)
      this.$emit('change')
    }
  }
}
</script>

<style lang="less" scoped>
.non-timepoint-section {
  margin-top: 0;
}

.np-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.np-table td {
  border: 1px solid #eee;
  padding: 6px 4px;
  vertical-align: middle;
  transition: background 0.15s;
}

.np-table tbody td:hover {
  background: #f0f4ff;
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

.np-cell {
  text-align: left;
  padding-left: 12px;
}
</style>
