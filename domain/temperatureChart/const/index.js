import dayjs from "dayjs";
import TEMPLATE_CONFIG from '../entry/template.json'

// 从 template.json 派生的核心常量
export const timeNumber = TEMPLATE_CONFIG.timepoints.map(t => parseInt(t, 10));
export const dayNumber = TEMPLATE_CONFIG.dayNumber;
export const colCount = timeNumber.length * dayNumber;
export const nightTime = TEMPLATE_CONFIG.nightTime;
export const bodyTemperature = TEMPLATE_CONFIG.ranges.bodyTemperature;
export const heartRange = TEMPLATE_CONFIG.ranges.heartRate;

export const leftTEXT = [
  ["脉搏,(次/分)", "160", "140", "120", "100", "80", "60", "40"],
  ["体温,(℃)", "41", "40", "39", "38", "37", "36", "35"],
]; // y轴
export const starNumEnv = bodyTemperature[0]; // 开始体温
export const endNumEnv = bodyTemperature[1]; // 结束体温

export const INFO_KEYS = TEMPLATE_CONFIG.infoKeys;

export const TOP_KEYS = [
  {
    name: "日   期",
    getValue: (i, renderData) => {
      const { beginDate, hospDate = "" } = renderData.infoData;
      const startDate = dayjs(hospDate).format("YYYY-MM-DD");
      let eachTime = dayjs(beginDate).add(i, "day").format("YYYY-MM-DD");
      if (
        (startDate === eachTime && i === 0) ||
        dayjs(eachTime).format("MM-DD") === "01-01"
      ) {
        eachTime = dayjs(eachTime).format("YYYY-MM-DD");
      } else if (i === 0 || dayjs(eachTime).format("DD") === "01") {
        eachTime = dayjs(eachTime).format("MM-DD");
      } else {
        eachTime = dayjs(eachTime).format("DD");
      }
      return eachTime;
    },
  },
  {
    name: "住院天数",
    getValue: (i, renderData) => {
      const { hospDays } = renderData.infoData;
      return hospDays + i + 1;
    },
  },
  {
    name: "术后天数",
    getValue: (i, renderData) => {
      const surgeryDates = getSurgeryDates(renderData);
      if (surgeryDates.length === 0) return "";
      const { beginDate } = renderData.infoData;
      const currentDate = dayjs(beginDate).add(i, "day");
      const parts = surgeryDates.map(function (surgDate) {
        const diff = currentDate.diff(dayjs(surgDate), "day");
        if (diff <= 0) return "";
        return String(diff);
      }).filter(Boolean);
      return parts.length > 0 ? parts.join("/") : "";
    },
  },
];

// 从数据中找到所有手术事件的日期
function getSurgeryDates(renderData) {
  var dates = [];
  var rowsData = renderData.rowsData || [];
  rowsData.forEach(function (row) {
    if (!row.rowBOS) return;
    var hasSurgery = false;
    var rowDate = null;
    row.rowBOS.forEach(function (item) {
      if (item.typeCode === "012" && item.typeValue === "手术") {
        hasSurgery = true;
      }
      if (!rowDate && item.date) {
        rowDate = item.date.split(" ")[0];
      }
    });
    if (hasSurgery && rowDate && dates.indexOf(rowDate) === -1) {
      dates.push(rowDate);
    }
  });
  return dates;
}

// 从 template.json bottomKeys 派生，统一为 { name, key, splitAmPm } 结构
export const BOTTOM_KEYS = (TEMPLATE_CONFIG.bottomKeys || []).map(function (item) {
  return { name: item.name, key: item.typeCode, splitAmPm: item.splitAmPm || false, customLabel: item.customLabel || false }
}).concat(
  // fallback: 如果 bottomKeys 为空，从 nonTimepoint 派生
  !TEMPLATE_CONFIG.bottomKeys || TEMPLATE_CONFIG.bottomKeys.length === 0
    ? (TEMPLATE_CONFIG.nonTimepoint || []).map(function (item) {
        var name = item.unit ? item.label + '(' + item.unit + ')' : item.label
        return { name: name, key: item.typeCode, splitAmPm: false }
      })
    : []
);

export const HEAD_HEIGHT = 100; // 头部文字预留位置
export const LINE_HEIGHT = 20; // 一行的行高
export const textLeftMargin = 4; // 文字左边边距
export const TEXT_MARGIN_BOTTOM = 6; // 文字向上偏移量
export const symbolArrowHeight = 20;

export { TEMPLATE_CONFIG }
