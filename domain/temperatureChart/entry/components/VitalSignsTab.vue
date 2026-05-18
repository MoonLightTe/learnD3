<template>
  <div class="vital-signs-tab" @keydown="handleKeyNav" tabindex="-1">
    <data-grid
      :form-data="formData"
      :template-config="templateConfig"
      @change="$emit('change')"
      @clear-column="handleClearColumn"
    />
    <non-timepoint-section
      :form-data="formData"
      :template-config="templateConfig"
      @change="$emit('change')"
      @label-change="payload => $emit('label-change', payload)"
    />
  </div>
</template>

<script>
import DataGrid from './DataGrid.vue'
import NonTimepointSection from './NonTimepointSection.vue'
import { handleTableKeyNav, filterRows, filterCells } from '../keyNav.js'

export default {
  name: 'VitalSignsTab',
  components: { DataGrid: DataGrid, NonTimepointSection: NonTimepointSection },
  props: {
    formData: { type: Object, required: true },
    templateConfig: { type: Object, required: true }
  },
  methods: {
    handleClearColumn: function (timepoint) {
      var tp = this.formData.timepoints[timepoint]
      if (tp) {
        tp.temperature = { collectionMode: null, value: '', coolingRecords: [] }
        tp.pulse = { value: '', source: null }
        tp.heartRate = { value: '', source: null }
        tp.respiration = { value: '', ventilator: false }
      }
      this.$emit('change')
      this.$message.success('已清空 ' + timepoint + ' 数据')
    },

    // 方向键导航：跨 DataGrid 和 NonTimepointSection
    handleKeyNav: function (e) {
      var self = this
      handleTableKeyNav(e, {
        container: this.$el,
        safeColMin: 1,
        findUp: function (ctx) {
          var prevTable = self.findPrevTable(ctx.currentTable)
          if (!prevTable) return null
          var prevTbody = prevTable.querySelector('tbody') || prevTable
          var prevRows = filterRows(prevTbody)
          if (prevRows.length === 0) return null
          var prevCells = filterCells(prevRows[prevRows.length - 1])
          return {
            rows: prevRows,
            rowIndex: prevRows.length - 1,
            cells: prevCells,
            colIndex: Math.min(ctx.colIndex, prevCells.length - 1),
            currentTable: prevTable
          }
        },
        findDown: function (ctx) {
          var nextTable = self.findNextTable(ctx.currentTable)
          if (!nextTable) return null
          var nextTbody = nextTable.querySelector('tbody') || nextTable
          var nextRows = filterRows(nextTbody)
          if (nextRows.length === 0) return null
          var nextCells = filterCells(nextRows[0])
          return {
            rows: nextRows,
            rowIndex: 0,
            cells: nextCells,
            colIndex: Math.min(ctx.colIndex, nextCells.length - 1),
            currentTable: nextTable
          }
        }
      })
    },

    getRowCells: function (tr) {
      return Array.from(tr.children).filter(function (el) { return el.tagName === 'TD' })
    },

    findPrevTable: function (currentTable) {
      var tables = Array.from(this.$el.querySelectorAll('table'))
      var idx = tables.indexOf(currentTable)
      return idx > 0 ? tables[idx - 1] : null
    },

    findNextTable: function (currentTable) {
      var tables = Array.from(this.$el.querySelectorAll('table'))
      var idx = tables.indexOf(currentTable)
      return idx < tables.length - 1 ? tables[idx + 1] : null
    }
  }
}
</script>
