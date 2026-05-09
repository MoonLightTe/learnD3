// 体温测量类型 collectionMode 映射
export const TEMPERATURE_TYPES = [
  { label: '口温', collectionMode: 1 },
  { label: '腋温', collectionMode: 2 },
  { label: '肛温', collectionMode: 3 },
  { label: '耳温', collectionMode: 4 }
]

export const TEMPERATURE_SPECIAL_TYPES = [
  { label: '不升', collectionMode: null, value: '不升' },
  { label: '拒测', collectionMode: null, value: '拒测' }
]

export const TEMPERATURE_COOLING_TYPES = [
  { label: '冰床降温', collectionMode: 5 },
  { label: '冰敷', collectionMode: 6 },
  { label: '冰帽', collectionMode: 7 }
]

export const COOLING_MEASURE_TYPES = [
  { label: '口温', collectionMode: 1 },
  { label: '腋温', collectionMode: 2 },
  { label: '肛温', collectionMode: 3 },
  { label: '耳温', collectionMode: 4 }
]

export const COOLING_RECORD_TYPES = ['物理降温', '药物降温']

export const EVENT_TYPES = [
  '入院', '转入', '转出', '回室', '拒测', '请假', '查房',
  '手术', '分娩', '出生', '转科', '外出', '出院', '死亡', '院外分娩'
]

export const STOOL_SPECIAL_STATUS = [
  { label: '无', value: '' },
  { label: '人工肛门', symbol: '☆' },
  { label: '大便失禁', symbol: '※' }
]

export const URINE_MARKS = [
  { label: '无', value: '' },
  { label: '导尿', value: 'C' },
  { label: '长置导管', value: 'C+' },
  { label: '失禁', value: '※' }
]

export const WEIGHT_ASSIST_METHODS = ['无', '平车', '轮椅', '卧床']

export const SKIN_TEST_RESULTS = ['阴性', '阳性']

export const TYPE_CODE_LABELS = {
  '001': '呼吸',
  '002': '脉搏',
  '003': '体温',
  '004': '小便',
  '005': '大便',
  '006': '体液入量',
  '007': '其他排出量',
  '008': '血压',
  '009': '体重',
  '010': '过敏药',
  '011': '尿量',
  '012': '事件标记',
  '013': '自定义文本',
  '014': '心率',
  '015': '物理降温',
  '030': '身高'
}
