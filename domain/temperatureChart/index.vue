<template>
  <div class="temperature-chart-page">
    <!-- 顶层 Tab 切换 -->
    <div class="top-tabs">
      <div class="top-tab" :class="{ active: pageMode === 'single' }" @click="pageMode = 'single'">单患者录入</div>
      <div class="top-tab" :class="{ active: pageMode === 'batch' }" @click="pageMode = 'batch'">批量录入</div>
    </div>

    <!-- ===== 单患者录入 ===== -->
    <template v-if="pageMode === 'single'">
    <div class="single-entry-layout">
      
      <div class="entry-col">
        <!-- 子 Tab -->
        <div class="entry-tabs">
          <div
            class="entry-tab"
            :class="{ active: activeTab === 'vitalSigns' }"
            @click="activeTab = 'vitalSigns'"
          >生命体征</div>
          <div
            class="entry-tab"
            :class="{ active: activeTab === 'events' }"
            @click="activeTab = 'events'"
          >记录事件</div>
        </div>

        <!-- 患者信息栏 -->
        <div class="patient-info-bar">
          <span class="name">{{ patientInfo.name }}</span>
          <span class="sep">|</span>
          <span>{{ patientInfo.officeName }}</span>
          <span class="sep">|</span>
          <span>床号 {{ patientInfo.cwh }}</span>
          <span class="sep">|</span>
          <span>住院号 {{ patientInfo.hospCode }}</span>
          <span class="sep">|</span>
          <span>入院 {{ patientInfo.hospDate }} 第{{ patientInfo.hospDays }}天</span>
          <span class="sep">|</span>
          <span class="diag">诊断: {{ patientInfo.inDiagName }}</span>
        </div>

        <!-- 工具栏 -->
        <div class="entry-toolbar">
          <div class="date-nav">
            <el-button size="mini" icon="el-icon-arrow-left" :disabled="!canPrevDay" @click="prevDay" circle></el-button>
            <el-date-picker
              v-model="currentDate"
              type="date"
              size="small"
              value-format="yyyy-MM-dd"
              :clearable="false"
              :picker-options="datePickerOptions"
              @change="handleDateChange"
              style="width: 130px"
            />
            <el-button size="mini" icon="el-icon-arrow-right" :disabled="!canNextDay" @click="nextDay" circle></el-button>
            <span class="week-label">{{ weekLabel }}</span>
          </div>
          <div class="toolbar-actions">
            <el-button size="small" @click="showSyncDialog = true">同步数据</el-button>
            <el-button size="small" @click="handlePrint">打印</el-button>
            <el-button size="small" type="danger" plain @click="handleClearAll">清空</el-button>
            <el-button size="small" :disabled="!hasUnsaved" @click="handleCancel">取消</el-button>
            <el-button size="small" type="primary" :loading="saving" @click="handleSave">保存 (Ctrl+S)</el-button>
          </div>
        </div>

        <!-- 生命体征 Tab -->
        <div v-show="activeTab === 'vitalSigns'" class="grid-container">
          <vital-signs-tab
            :form-data="formData"
            :template-config="templateConfig"
            @change="handleFormChange"
            @label-change="handleCustomLabelChange"
          />
        </div>

        <!-- 记录事件 Tab -->
        <div v-show="activeTab === 'events'" class="event-container">
          <event-record-tab
            :events="formData.events"
            @change="handleFormChange"
          />
        </div>

        <!-- 底部信息 -->
        <div class="entry-footer">
          <span>上次保存: {{ lastSaveTime || '暂无' }}</span>
          <span>记录人: {{ currentUser }}</span>
        </div>
      </div>

      <!-- 右侧：预览区 -->
      <div class="preview-col">
        <div class="chart-wrapper" id="chartWrapper"></div>
      </div>
    </div>
    </template>

    <!-- ===== 批量录入 ===== -->
    <template v-if="pageMode === 'batch'">
    <batch-entry-page
      :date="currentDate"
      :patients="batchPatients"
      :template-config="templateConfig"
      @date-change="handleDateChange"
      @save="handleBatchSave"
      @change="hasUnsaved = true"
      @preview="handleBatchPreview"
      @label-change="handleCustomLabelChange"
      @sync="handleSync"
    />
    </template>

    <!-- 同步数据弹窗 -->
    <sync-dialog :visible.sync="showSyncDialog" @sync="handleSync" />

    <!-- 批量预览弹窗 -->
    <el-dialog
      :title="'预览 — ' + (batchPreviewPatient.name || '')"
      :visible.sync="batchPreviewVisible"
      width="720px"
      top="5vh"
      @opened="renderBatchPreview"
    >
      <div class="batch-preview-body" :id="'batchPreviewChart'"></div>
    </el-dialog>
  </div>
</template>

<script>
import { init } from './utils/index.js'
import VitalSignsTab from './entry/components/VitalSignsTab.vue'
import EventRecordTab from './entry/components/EventRecordTab.vue'
import SyncDialog from './entry/components/SyncDialog.vue'
import BatchEntryPage from './entry/components/BatchEntryPage.vue'
import { renderToForm, formToRender } from './entry/adapter.js'
import TEMPLATE_CONFIG from './entry/template.json'
import dayjs from 'dayjs'

var STORAGE_KEY = 'temperatureChart_v2'

// 从 template 派生 typeCode 列表
var TP_ITEMS = TEMPLATE_CONFIG.rows || []
var NP_ITEMS = TEMPLATE_CONFIG.nonTimepoint || []
var CUSTOM_ITEMS = TEMPLATE_CONFIG.customItems || []
var ROW_TYPE_CODES = ['012', '013', '015'].concat(TP_ITEMS.map(function (item) { return item.typeCode }))
var NP_TYPE_CODES = NP_ITEMS.map(function (item) { return item.typeCode }).concat(
  CUSTOM_ITEMS.map(function (item) { return item.typeCode })
)

var MOCK_PATIENT = {
  age: 45, ageunit: '岁', birth: null, cwh: '12',
  hospCode: 'H20220401', hospDate: '2026-04-20', hospDays: 10, inDate: null,
  inDiagName: '急性上呼吸道感染', name: '张三', officeName: '内科一病区',
  title: '中心医院', operaDays: null, outdate: null, sex: '男', weekNo: '1'
}

var ADMISSION_DATE = '2026-04-20'

// 创建一周的空数据
// 确保 types 数组包含所有 NP_TYPE_CODES，补齐缺失的条目
function ensureTypeCodes(types, weekStart) {
  var dates = []
  for (var i = 0; i < TEMPLATE_CONFIG.dayNumber; i++) {
    dates.push(dayjs(weekStart).add(i, 'day').format('YYYY-MM-DD'))
  }
  var existing = {}
  types.forEach(function (t) {
    if (t.date) existing[t.date.substring(0, 10) + '_' + t.typeCode] = true
  })
  NP_TYPE_CODES.forEach(function (tc) {
    dates.forEach(function (d) {
      var key = d + '_' + tc
      if (!existing[key]) {
        types.push({ collectionMode: null, date: d + ' 00:00:00', times: null, typeCode: tc, typeValue: null })
      }
    })
  })
  return types
}

function createEmptyWeekData(weekStart) {
  var dates = []
  for (var i = 0; i < TEMPLATE_CONFIG.dayNumber; i++) {
    dates.push(dayjs(weekStart).add(i, 'day').format('YYYY-MM-DD'))
  }
  var timepoints = TEMPLATE_CONFIG.timepoints
  var rows = []
  for (var d = 0; d < dates.length; d++) {
    for (var t = 0; t < timepoints.length; t++) {
      var rowBOS = ROW_TYPE_CODES.map(function (tc) {
        return { collectionMode: null, date: dates[d], times: timepoints[t] + ':00', typeCode: tc, typeValue: null }
      })
      rows.push({ rowBOS: rowBOS })
    }
  }
  var types = []
  for (var d = 0; d < dates.length; d++) {
    for (var n = 0; n < NP_TYPE_CODES.length; n++) {
      types.push({ collectionMode: null, date: dates[d] + ' 00:00:00', times: null, typeCode: NP_TYPE_CODES[n], typeValue: null })
    }
  }
  return { rows: rows, types: types }
}

// 根据入院日计算某天所在的周起始日
function getWeekStart(date) {
  var diff = dayjs(date).diff(dayjs(ADMISSION_DATE), 'day')
  if (diff < 0) return ADMISSION_DATE
  var weekIndex = Math.floor(diff / 7)
  return dayjs(ADMISSION_DATE).add(weekIndex * 7, 'day').format('YYYY-MM-DD')
}

// 获取一周的 7 个日期
function getWeekDateList(weekStart) {
  var arr = []
  for (var i = 0; i < TEMPLATE_CONFIG.dayNumber; i++) {
    arr.push(dayjs(weekStart).add(i, 'day').format('YYYY-MM-DD'))
  }
  return arr
}

export default {
  name: 'TemperatureChart',
  components: { VitalSignsTab, EventRecordTab, SyncDialog, BatchEntryPage },
  data: function () {
    return {
      currentDate: dayjs().format('YYYY-MM-DD'),
      currentWeekStart: '',
      activeTab: 'vitalSigns',
      hasUnsaved: false,
      showSyncDialog: false,
      pageMode: 'single', // 'single' | 'batch'
      saving: false,
      lastSaveTime: '',
      currentUser: '当前用户',
      templateConfig: TEMPLATE_CONFIG,
      renderData: null,
      allWeeks: {},
      customNames: {},
      formData: {
        date: '',
        timepoints: {},
        nonTimepoint: {},
        events: []
      },
      previewTimer: null,
      batchPreviewVisible: false,
      batchPreviewPatient: {}
    }
  },
  computed: {
    patientInfo: function () {
      return Object.assign({}, MOCK_PATIENT, { beginDate: this.currentWeekStart })
    },
    weekLabel: function () {
      if (!this.currentWeekStart) return ''
      var diff = dayjs(this.currentWeekStart).diff(dayjs(ADMISSION_DATE), 'day')
      var weekNum = Math.floor(diff / 7) + 1
      var dates = getWeekDateList(this.currentWeekStart)
      return '第' + weekNum + '周 (' + dates[0].substring(5) + ' ~ ' + dates[6].substring(5) + ')'
    },
    canPrevDay: function () {
      return this.currentDate > ADMISSION_DATE
    },
    canNextDay: function () {
      return this.currentDate < dayjs().format('YYYY-MM-DD')
    },
    datePickerOptions: function () {
      var self = this
      return {
        disabledDate: function (date) {
          var d = dayjs(date).format('YYYY-MM-DD')
          return d < ADMISSION_DATE || d > dayjs().format('YYYY-MM-DD')
        }
      }
    },
    batchPatients: function () {
      // mock 多患者数据供批量录入
      return [
        { id: '1', name: '张三', bedNo: '12', dept: '内科', hospDate: '2026-04-20', postOpDays: '' },
        { id: '2', name: '李四', bedNo: '15', dept: '外科', hospDate: '2026-04-22', postOpDays: '1' },
        { id: '3', name: '王五', bedNo: '18', dept: '内科', hospDate: '2026-04-25', postOpDays: '' },
        { id: '4', name: '赵六', bedNo: '20', dept: '骨科', hospDate: '2026-04-28', postOpDays: '' }
      ]
    }
  },
  created: function () {
    // 从 localStorage 加载所有周数据
    var saved = null
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch (e) {}
    if (saved && saved.weeks) {
      this.allWeeks = saved.weeks
    }
    if (saved && saved.customNames) {
      this.customNames = saved.customNames
      this.applyCustomNames()
    }

    // 计算当前周
    var today = dayjs().format('YYYY-MM-DD')
    this.currentWeekStart = getWeekStart(today)
    this.currentDate = today
  },
  mounted: function () {
    this.loadCurrentWeek()
    this.$nextTick(function () { this.renderChart() }.bind(this))
    var self = this
    this._ctrlSHandler = function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        self.handleSave()
      }
    }
    document.addEventListener('keydown', this._ctrlSHandler)
  },
  beforeDestroy: function () {
    if (this._ctrlSHandler) document.removeEventListener('keydown', this._ctrlSHandler)
  },
  watch: {
    pageMode: function (mode) {
      if (mode === 'single') {
        this.$nextTick(function () { this.renderChart() }.bind(this))
      }
    }
  },
  beforeDestroy: function () {
    if (this.previewTimer) clearTimeout(this.previewTimer)
  },
  methods: {
    // 加载当前周数据到 renderData
    loadCurrentWeek: function () {
      var weekData = this.allWeeks[this.currentWeekStart]
      if (weekData) {
        weekData.types = ensureTypeCodes(weekData.types, this.currentWeekStart)
        this.renderData = {
          grParamBOS: [Object.assign({}, MOCK_PATIENT, { beginDate: this.currentWeekStart })],
          rows: weekData.rows,
          types: weekData.types
        }
      } else {
        var empty = createEmptyWeekData(this.currentWeekStart)
        this.renderData = {
          grParamBOS: [Object.assign({}, MOCK_PATIENT, { beginDate: this.currentWeekStart })],
          rows: empty.rows,
          types: empty.types
        }
      }
      this.applyCustomNames()
      this.loadFormData(this.currentDate)
    },

    // 将全局 customNames 应用到 templateConfig + renderData.types
    applyCustomNames: function () {
      var items = this.templateConfig.customItems || []
      var bottomKeys = this.templateConfig.bottomKeys || []
      // 构建 typeCode → customName 映射，避免嵌套循环
      var tcMap = {}
      for (var i = 0; i < items.length; i++) {
        var key = items[i].key
        if (!key || !this.customNames[key]) continue
        items[i].label = this.customNames[key]
        tcMap[items[i].typeCode] = this.customNames[key]
        for (var k = 0; k < bottomKeys.length; k++) {
          if (bottomKeys[k].typeCode === items[i].typeCode) {
            bottomKeys[k].name = this.customNames[key]
            break
          }
        }
      }
      if (this.renderData && this.renderData.types) {
        var types = this.renderData.types
        for (var t = 0; t < types.length; t++) {
          var name = tcMap[types[t].typeCode]
          if (name) types[t].customName = name
        }
      }
    },

    // 将 customNames 写入给定 types 数组（不修改原数组，返回深拷贝）
    applyCustomNamesToTypes: function (types) {
      var hasCustom = Object.keys(this.customNames).length > 0
      if (!hasCustom) return types
      var items = this.templateConfig.customItems || []
      var tcMap = {}
      for (var i = 0; i < items.length; i++) {
        if (this.customNames[items[i].key]) {
          tcMap[items[i].typeCode] = this.customNames[items[i].key]
        }
      }
      var cloned = JSON.parse(JSON.stringify(types))
      for (var t = 0; t < cloned.length; t++) {
        var name = tcMap[cloned[t].typeCode]
        if (name) cloned[t].customName = name
      }
      return cloned
    },

    // 保存当前周到 allWeeks
    saveCurrentWeek: function () {
      if (!this.renderData) return
      this.allWeeks[this.currentWeekStart] = {
        rows: this.renderData.rows,
        types: this.renderData.types
      }
    },

    // 切换到指定周
    switchToWeek: function (weekStart, selectDate) {
      this.saveCurrentWeek()
      this.currentWeekStart = weekStart
      this.currentDate = selectDate || weekStart
      this.loadCurrentWeek()
      this.renderChart()
      this.hasUnsaved = false
    },

    // 从渲染数据加载到表单
    loadFormData: function (date) {
      this.formData = renderToForm(this.renderData, date)
      this.hasUnsaved = false
    },

    // 渲染 D3 体温单
    renderChart: function () {
      var el = document.getElementById('chartWrapper')
      if (el) el.innerHTML = ''
      if (this.renderData) {
        this.renderData.surgeryDates = this.collectAllSurgeryDates()
        init(this.renderData, 'chartWrapper')
      }
    },

    collectAllSurgeryDates: function () {
      var dates = []
      var self = this
      Object.keys(this.allWeeks).forEach(function (weekStart) {
        var weekData = self.allWeeks[weekStart]
        if (!weekData || !weekData.rows) return
        weekData.rows.forEach(function (row) {
          if (!row.rowBOS) return
          var hasSurgery = false
          var rowDate = null
          row.rowBOS.forEach(function (item) {
            if (item.typeCode === '012' && item.typeValue === '手术') hasSurgery = true
            if (!rowDate && item.date) rowDate = item.date.split(' ')[0]
          })
          if (hasSurgery && rowDate && dates.indexOf(rowDate) === -1) dates.push(rowDate)
        })
      })
      return dates
    },

    // 表单数据变更 → 实时预览（防抖）
    handleFormChange: function () {
      this.hasUnsaved = true
      this.schedulePreview()
    },

    schedulePreview: function () {
      if (this.previewTimer) clearTimeout(this.previewTimer)
      var self = this
      this.previewTimer = setTimeout(function () { self.updatePreview() }, 500)
    },

    updatePreview: function () {
      var weekDates = getWeekDateList(this.currentWeekStart)
      var newRenderData = formToRender(
        this.formData, this.patientInfo, weekDates, this.renderData
      )
      this.renderData = newRenderData
      this.renderChart()
    },

    // 日期切换（可能在同周内切换，也可能跨周）
    handleDateChange: function (date) {
      if (!date) return
      if (date < ADMISSION_DATE || date > dayjs().format('YYYY-MM-DD')) return

      var newWeekStart = getWeekStart(date)
      if (newWeekStart !== this.currentWeekStart) {
        // 跨周切换
        var self = this
        if (this.hasUnsaved) {
          this.$confirm('有未保存的数据，是否保存？', '提示', {
            confirmButtonText: '保存并切换',
            cancelButtonText: '不保存切换',
            distinguishCancelAndClose: true,
            type: 'warning'
          }).then(function () {
            self.handleSave()
            self.switchToWeek(newWeekStart, date)
          }).catch(function (action) {
            if (action === 'cancel') self.switchToWeek(newWeekStart, date)
          })
        } else {
          this.switchToWeek(newWeekStart, date)
        }
      } else {
        // 同周内切换，只更新表单
        this.currentDate = date
        this.loadFormData(date)
      }
    },

    prevDay: function () {
      if (!this.canPrevDay) return
      var prev = dayjs(this.currentDate).subtract(1, 'day').format('YYYY-MM-DD')
      this.handleDateChange(prev)
    },

    nextDay: function () {
      if (!this.canNextDay) return
      var next = dayjs(this.currentDate).add(1, 'day').format('YYYY-MM-DD')
      this.handleDateChange(next)
    },

    // 保存到 localStorage
    handleSave: function () {
      this.saving = true
      this.updatePreview()
      this.saveCurrentWeek()
      var self = this
      setTimeout(function () {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ weeks: self.allWeeks, customNames: self.customNames }))
        } catch (e) { /* ignore */ }
        self.hasUnsaved = false
        self.saving = false
        self.lastSaveTime = dayjs().format('YYYY-MM-DD HH:mm')
        self.$message.success('保存成功')
      }, 300)
    },

    // 清空所有数据
    handleClearAll: function () {
      var self = this
      this.$confirm('确定清空所有数据？此操作不可恢复。', '警告', {
        confirmButtonText: '确定清空',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function () {
        localStorage.removeItem(STORAGE_KEY)
        self.allWeeks = {}
        self.customNames = {}
        self.currentWeekStart = getWeekStart(dayjs().format('YYYY-MM-DD'))
        self.currentDate = self.currentWeekStart
        self.loadCurrentWeek()
        self.renderChart()
        self.hasUnsaved = false
        self.lastSaveTime = ''
        self.$message.success('已清空所有数据')
      }).catch(function () {})
    },

    handleCancel: function () {
      if (!this.hasUnsaved) return
      var self = this
      this.$confirm('确定放弃所有未保存的修改？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function () {
        self.loadFormData(self.currentDate)
        self.renderChart()
      }).catch(function () {})
    },

    // 多页打印：每页一周（按入院周分组）
    handlePrint: function () {
      var weekKeys = Object.keys(this.allWeeks).sort()
      if (weekKeys.length === 0) {
        // 至少打印当前周
        weekKeys = [this.currentWeekStart]
      }

      var printContainer = document.getElementById('printContainer')
      if (printContainer) printContainer.remove()
      printContainer = document.createElement('div')
      printContainer.id = 'printContainer'
      printContainer.style.display = 'none'
      document.body.appendChild(printContainer)

      var patientInfo = Object.assign({}, MOCK_PATIENT)

      weekKeys.forEach(function (weekStart) {
        var weekData = this.allWeeks[weekStart]
        if (!weekData) return

        var page = document.createElement('div')
        page.className = 'print-page'

        var chartDiv = document.createElement('div')
        chartDiv.className = 'print-chart'
        page.appendChild(chartDiv)
        printContainer.appendChild(page)

        var weekRenderData = {
          grParamBOS: [Object.assign({}, patientInfo, { beginDate: weekStart })],
          rows: weekData.rows,
          types: this.applyCustomNamesToTypes(weekData.types)
        }
        init(weekRenderData, null, chartDiv)
      }.bind(this))

      printContainer.style.display = 'block'
      setTimeout(function () {
        window.print()
        setTimeout(function () { printContainer.style.display = 'none' }, 500)
      }, 300)
    },

    handleSync: function () {
      this.$message.info('同步功能待对接后端 API')
    },

    handleCustomLabelChange: function (payload) {
      var key = payload.key
      var label = payload.label
      // 存入全局 customNames
      this.$set(this.customNames, key, label)
      // 复用 applyCustomNames 统一刷新 templateConfig + renderData.types
      this.applyCustomNames()
      this.schedulePreview()
    },

    handleBatchSave: function (batchData) {
      this.$message.success('批量保存成功（共 ' + batchData.patientIds.length + ' 名患者）')
      this.hasUnsaved = false
    },

    handleBatchPreview: function (patient) {
      this.batchPreviewPatient = patient
      this.batchPreviewVisible = true
    },

    renderBatchPreview: function () {
      var el = document.getElementById('batchPreviewChart')
      if (el) el.innerHTML = ''
      var patient = this.batchPreviewPatient
      if (!patient || !patient.id) return
      var weekStart = getWeekStart(this.currentDate)
      var weekData = this.allWeeks[weekStart]
      var renderData
      if (weekData) {
        renderData = {
          grParamBOS: [Object.assign({}, MOCK_PATIENT, { name: patient.name, cwh: patient.bedNo, beginDate: weekStart })],
          rows: weekData.rows,
          types: weekData.types
        }
      } else {
        var empty = createEmptyWeekData(weekStart)
        renderData = {
          grParamBOS: [Object.assign({}, MOCK_PATIENT, { name: patient.name, cwh: patient.bedNo, beginDate: weekStart })],
          rows: empty.rows,
          types: empty.types
        }
      }
      init(renderData, 'batchPreviewChart')
    }
  }
}
</script>

<style lang="less" scoped>
.temperature-chart-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f4f6f8;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
  font-size: 13px;
  color: #333;
}

/* 顶层 Tab */
.top-tabs {
  display: flex;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.top-tab {
  padding: 12px 24px;
  cursor: pointer;
  color: #666;
  border-bottom: 2px solid transparent;
  font-weight: 500;
  user-select: none;
  &:hover { color: #333; }
  &.active {
    color: #1a73e8;
    border-bottom-color: #1a73e8;
  }
}

/* 单患者左右布局 */
.single-entry-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 左侧录入区 */
.entry-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  margin: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  overflow: hidden;
}

.entry-tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  padding: 0 16px;
  background: #fafafa;
}

.entry-tab {
  padding: 12px 20px;
  cursor: pointer;
  color: #888;
  font-weight: 400;
  user-select: none;
  &:hover { color: #333; }
  &.active {
    color: #333;
    font-weight: 600;
  }
}

.entry-toolbar {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
}

.date-nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.week-label {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  background: #f0f4ff;
  padding: 2px 8px;
  border-radius: 4px;
}

.patient-info-bar {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  color: #666;
  padding: 8px 16px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
  .name { font-weight: 600; font-size: 14px; color: #333; }
  .sep { color: #ddd; }
  .diag { color: #555; font-weight: 500; }
}

.toolbar-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.grid-container {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

.event-container {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.entry-footer {
  padding: 10px 16px;
  border-top: 1px solid #eee;
  font-size: 11px;
  color: #888;
  background: #fafafa;
  display: flex;
  justify-content: space-between;
}

/* 右侧预览区 */
.preview-col {
  flex: 0 0 55%;
  min-width: 600px;
  background: #fff;
  display: flex;
  flex-direction: column;
  margin: 12px 12px 12px 0;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  overflow: hidden;
}

.chart-wrapper {
  flex: 1;
  overflow: auto;
  padding: 12px;
  position: relative;
}

.chart-wrapper svg {
  width: 100%;
  height: auto;
}

/* 批量预览弹窗 */
.batch-preview-body {
  max-height: 75vh;
  overflow: hidden;
}
.batch-preview-body svg {
  width: 100%;
  height: auto;
}

/* 打印样式 */
@media print {
  .temperature-chart-page { display: none !important; }
  #printContainer {
    display: block !important;
    width: 100%;
    background: #fff;
  }
  .print-page {
    page-break-after: always;
    width: 100%;
    box-sizing: border-box;
  }
  .print-page:last-child {
    page-break-after: auto;
  }
  .print-chart {
    width: 100%;
  }
  .print-chart svg {
    width: 100% !important;
    height: auto !important;
  }
}</style>

<style>
/* 全局打印容器样式（非 scoped） */
#printContainer {
  display: none;
}
</style>
