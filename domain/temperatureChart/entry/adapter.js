import dayjs from 'dayjs'
import { timeNumber } from '../const/index'
import TEMPLATE_CONFIG from './template.json'

var ADMISSION_DATE = '2026-04-20'

/**
 * 渲染引擎数据 → 前端表单数据（按日期提取某一天的数据）
 */
export function renderToForm(renderData, date) {
  const form = {
    date,
    timepoints: {},
    nonTimepoint: {},
    events: []
  }

  const dayRows = renderData.rows.filter(row => {
    const first = row.rowBOS[0]
    return first && first.date === date
  })

  TEMPLATE_CONFIG.timepoints.forEach((time) => {
    const timeStr = time + ':00'
    const row = dayRows.find(r => r.rowBOS[0]?.times === timeStr)
    const tp = { temperature: {}, pulse: {}, heartRate: {}, respiration: {} }

    if (row) {
      var coolingValue = null
      row.rowBOS.forEach(item => {
        switch (item.typeCode) {
          case '015':
            coolingValue = item.typeValue
            break
          case '003':
            tp.temperature = {
              collectionMode: item.collectionMode,
              value: item.typeValue,
              coolingRecords: []
            }
            break
          case '002':
            tp.pulse = { value: item.typeValue, source: item.typeValue ? 'unknown' : null }
            break
          case '014':
            tp.heartRate = { value: item.typeValue, source: item.typeValue ? 'unknown' : null }
            break
          case '001':
            tp.respiration = { value: item.typeValue === '®' ? '' : item.typeValue, ventilator: item.typeValue === '®' }
            break
          case '012':
            if (item.typeValue) {
              // 读取同行的 013 作为事件标题
              var contentItem = row.rowBOS.find(function (r) { return r.typeCode === '013' })
              form.events.push({
                type: item.typeValue,
                content: contentItem ? contentItem.typeValue || '' : '',
                eventTime: time,
                recordTime: '',
                recorder: ''
              })
            }
            break
        }
      })
      if (coolingValue && tp.temperature.coolingRecords) {
        tp.temperature.coolingRecords = [{
          temperature: coolingValue,
          coolingType: '物理降温',
          measureType: '',
          time: ''
        }]
      }
    }

    form.timepoints[time] = tp
  })

  const dayTypes = renderData.types.filter(t => {
    return t.date && t.date.startsWith(date)
  })

  const np = form.nonTimepoint
  dayTypes.forEach(item => {
    switch (item.typeCode) {
      case '005': np.stool = { rawValue: item.typeValue }; break
      case '006': np.fluidIntake = parseFluidIntake(item.typeValue); break
      case '007': np.otherOutput = { value: item.typeValue }; break
      case '008': np.bloodPressure = parseBloodPressure(item.typeValue); break
      case '009': np.weight = parseWeight(item.typeValue); break
      case '011': np.urineVolume = parseUrineVolume(item.typeValue); break
      case '016': np.skinTest = parseSkinTest(item.typeValue); break
      case '004': np.urinationCount = { value: item.typeValue }; break
      case '010': np.allergyDrug = { value: item.typeValue }; break
      case '030': np.height = { value: item.typeValue }; break
      case '020': np.custom_1 = parseCustomItem(item); break
      case '021': np.custom_2 = parseCustomItem(item); break
    }
  })

  return form
}

/**
 * 表单数据 → 渲染引擎数据（只更新目标日期，保留其他日期的原始数据）
 */
export function formToRender(formData, patientInfo, weekDates, existingRenderData) {
  // 保留原始数据作为基础
  const rows = JSON.parse(JSON.stringify(existingRenderData.rows || []))
  const types = JSON.parse(JSON.stringify(existingRenderData.types || []))

  const targetDate = formData.date

  // 更新目标日期的 timepoint 数据
  TEMPLATE_CONFIG.timepoints.forEach(time => {
    const timeStr = time + ':00'
    const tp = formData.timepoints[time]
    if (!tp) return

    // 在 rows 中找到该日期+时间的行
    const rowIndex = rows.findIndex(r => {
      const first = r.rowBOS && r.rowBOS[0]
      return first && first.date === targetDate && first.times === timeStr
    })

    if (rowIndex < 0) return

    const row = rows[rowIndex]
    row.rowBOS.forEach(item => {
      if (item.date !== targetDate || item.times !== timeStr) return
      switch (item.typeCode) {
        case '003':
          item.collectionMode = tp.temperature ? tp.temperature.collectionMode : null
          item.typeValue = tp.temperature && tp.temperature.value != null ? String(tp.temperature.value) : null
          break
        case '015':
          var cr = tp.temperature && tp.temperature.coolingRecords
          item.typeValue = (cr && cr.length > 0 && cr[0].temperature) ? String(cr[0].temperature) : null
          break
        case '002':
          item.typeValue = tp.pulse && tp.pulse.value ? String(tp.pulse.value) : null
          break
        case '014':
          item.typeValue = tp.heartRate && tp.heartRate.value ? String(tp.heartRate.value) : null
          break
        case '001':
          item.typeValue = tp.respiration && tp.respiration.ventilator ? '®' : (tp.respiration && tp.respiration.value ? String(tp.respiration.value) : null)
          break
      }
    })
  })

  // 更新目标日期的事件数据（typeCode 012/013）
  // 同一时间点多条事件，只保留最新一条写入
  var events = formData.events || []
  var latestEventByTime = {}
  events.forEach(function (evt) {
    if (evt.eventTime) {
      latestEventByTime[evt.eventTime] = evt
    }
  })

  TEMPLATE_CONFIG.timepoints.forEach(function (time) {
    var timeStr = time + ':00'
    var rowIndex = rows.findIndex(function (r) {
      var first = r.rowBOS && r.rowBOS[0]
      return first && first.date === targetDate && first.times === timeStr
    })
    if (rowIndex < 0) return

    var evt = latestEventByTime[time]
    var row = rows[rowIndex]
    row.rowBOS.forEach(function (item) {
      if (item.date !== targetDate || item.times !== timeStr) return
      if (item.typeCode === '012') {
        item.typeValue = evt ? evt.type : null
      }
      if (item.typeCode === '013') {
        item.typeValue = evt && evt.content ? evt.content : null
      }
    })
  })

  // 更新目标日期的非时间点数据
  const np = formData.nonTimepoint || {}
  const targetDatePrefix = targetDate

  types.forEach(item => {
    if (!item.date || !item.date.startsWith(targetDatePrefix)) return
    if (item.times !== null) return // 只处理非时间点数据

    switch (item.typeCode) {
      case '008':
        item.typeValue = np.bloodPressure ? assembleBloodPressure(np.bloodPressure) : null
        break
      case '005':
        item.typeValue = np.stool ? np.stool.rawValue || null : null
        break
      case '011':
        item.typeValue = np.urineVolume ? assembleUrineVolume(np.urineVolume) : null
        break
      case '006':
        item.typeValue = np.fluidIntake ? assembleFluidIntake(np.fluidIntake) : null
        break
      case '007':
        item.typeValue = np.otherOutput && np.otherOutput.value ? String(np.otherOutput.value) : null
        break
      case '009':
        item.typeValue = np.weight ? assembleWeight(np.weight) : null
        break
      case '016':
        item.typeValue = np.skinTest ? assembleSkinTest(np.skinTest) : null
        break
      case '004':
        item.typeValue = np.urinationCount && np.urinationCount.value ? String(np.urinationCount.value) : null
        break
      case '010':
        item.typeValue = np.allergyDrug && np.allergyDrug.value ? String(np.allergyDrug.value) : null
        break
      case '030':
        item.typeValue = np.height && np.height.value ? String(np.height.value) : null
        break
      case '020':
        item.typeValue = np.custom_1 ? assembleCustomItem(np.custom_1) : null
        if (np.custom_1 && np.custom_1.label) item.customName = np.custom_1.label
        break
      case '021':
        item.typeValue = np.custom_2 ? assembleCustomItem(np.custom_2) : null
        if (np.custom_2 && np.custom_2.label) item.customName = np.custom_2.label
        break
    }
  })

  return {
    grParamBOS: [patientInfo],
    rows,
    types
  }
}

// --- 血压 ---
function parseBloodPressure(typeValue) {
  var result = { am: { systolic: '', diastolic: '' }, pm: { systolic: '', diastolic: '' } }
  if (!typeValue) return result
  var str = String(typeValue).trim()
  if (!str) return result
  // 格式："上午收缩压/舒张压 下午收缩压/舒张压"，如 "120/80 130/85"
  var parts = str.split(/\s+/)
  if (parts[0] && parts[0].indexOf('/') > -1) {
    var am = parts[0].split('/')
    result.am = { systolic: am[0] || '', diastolic: am[1] || '' }
  }
  if (parts[1] && parts[1].indexOf('/') > -1) {
    var pm = parts[1].split('/')
    result.pm = { systolic: pm[0] || '', diastolic: pm[1] || '' }
  }
  return result
}

/**
 * 拼接血压格式：上午收缩压/舒张压 下午收缩压/舒张压
 */
function assembleBloodPressure(bp) {
  if (!bp) return null
  const am = bp.am || {}
  const pm = bp.pm || {}
  const amStr = (am.systolic && am.diastolic) ? am.systolic + '/' + am.diastolic : ''
  const pmStr = (pm.systolic && pm.diastolic) ? pm.systolic + '/' + pm.diastolic : ''
  const result = [amStr, pmStr].filter(Boolean).join(' ')
  return result || null
}

// --- 尿量 ---
function parseUrineVolume(typeValue) {
  if (!typeValue) return { value: '', mark: '' }
  var str = String(typeValue)
  if (str === '※') return { value: '', mark: '※' }
  if (str.indexOf('/') > -1) {
    var parts = str.split('/')
    return { value: parts[0] || '', mark: parts[1] || '' }
  }
  return { value: str, mark: '' }
}

function assembleUrineVolume(data) {
  if (!data) return null
  var sv = data.selectValue || data.mark || ''
  if (sv === '※') return '※'
  if (data.value && sv) return data.value + '/' + sv
  if (data.value) return String(data.value)
  if (sv) return sv
  return null
}

// --- 体重 ---
function parseWeight(typeValue) {
  if (!typeValue) return { value: '', selectValue: '无' }
  var str = String(typeValue)
  if (str === '卧床') return { value: '', selectValue: '卧床' }
  if (str.indexOf('/') > -1) {
    var parts = str.split('/')
    return { value: parts[0] || '', selectValue: parts[1] || '无' }
  }
  return { value: str, selectValue: '无' }
}

function assembleWeight(data) {
  if (!data) return null
  var sv = data.selectValue || data.assistMethod || '无'
  if (sv === '卧床') return '卧床'
  if (data.value && sv && sv !== '无') return data.value + '/' + sv
  if (data.value) return String(data.value)
  return null
}

// --- 出入量 ---
function parseFluidIntake(typeValue) {
  if (!typeValue) return { value: '', hours: '' }
  var str = String(typeValue)
  if (str.indexOf('/') > -1) {
    var parts = str.split('/')
    return { value: parts[0] || '', hours: parts[1] || '' }
  }
  return { value: str, hours: '' }
}

function assembleFluidIntake(data) {
  if (!data) return null
  if (data.value && data.hours) return data.value + '/' + data.hours
  if (data.value) return String(data.value)
  return null
}

// --- 皮试 ---
function parseSkinTest(typeValue) {
  if (!typeValue) return { value: '', selectValue: '' }
  var str = String(typeValue)
  if (str.indexOf('/') > -1) {
    var parts = str.split('/')
    return { value: parts[0] || '', selectValue: parts[1] || '' }
  }
  return { value: str, selectValue: '' }
}

function assembleSkinTest(data) {
  if (!data) return null
  var v = data.value || data.drugName || ''
  var sv = data.selectValue || data.result || ''
  if (v && sv) return v + '/' + sv
  if (v) return v
  return null
}

// --- 自定义项（名称可编辑） ---
function parseCustomItem(item) {
  return { label: item.customName || '', value: item.typeValue || '' }
}
function assembleCustomItem(data) {
  if (!data) return null
  return data.value || null
}

/**
 * 计算某日所在周的日期数组
 */
export function getWeekDates(targetDate) {
  var diff = dayjs(targetDate).diff(dayjs(ADMISSION_DATE), 'day')
  if (diff < 0) diff = 0
  var weekIndex = Math.floor(diff / 7)
  var weekStart = dayjs(ADMISSION_DATE).add(weekIndex * 7, 'day')
  return Array.from({ length: TEMPLATE_CONFIG.dayNumber }, function (_, i) {
    return weekStart.add(i, 'day').format('YYYY-MM-DD')
  })
}
