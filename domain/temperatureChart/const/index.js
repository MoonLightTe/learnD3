import dayjs from "dayjs";

export const timeNumber = [2, 6, 10, 14, 18, 22];
export const dayNumber = 7;
export const colCount = timeNumber.length * dayNumber
export const nightTime = [2, 18, 22]; //夜间红色高亮时间
export const leftTEXT = [
  ["脉搏,(次/分)", "160", "140", "120", "100", "80", "60", "40"],
  ["体温,(℃)", "41", "40", "39", "38", "37", "36", "35"],
]; // y轴
export const bodyTemperature = [35, 42];
export const starNumEnv = bodyTemperature[0]; // 开始体温
export const endNumEnv = bodyTemperature[1]; // 结束体温
export const heartRange = [40, 180];
export const INFO_KEYS = [
  {
    name: "姓名",
    key: "name",
  },
  {
    name: "入院日期",
    key: "hospDate",
  },
  {
    name: "诊断",
    key: "inDiagName",
  },
  {
    name: "科室",
    key: "officeName",
  },
  {
    name: "床位号",
    key: "cwh",
  },
  {
    name: "病案号",
    key: "bah",
  },
];
export const TOP_KEYS = [
  {
    name: "日   期",
    getValue: (i, renderData) => {
      const {
        beginDate,
        outdate = "",
        hospDate = "",
        dateClosed,
      } = renderData.infoData;
      const tieml = new Date();
      const timeNew = new Date((tieml / 1000 + 86400) * 1000);
      const todayDate = dayjs(timeNew).format("YYYY-MM-DD");
      const endDate = dayjs(outdate).format("YYYY-MM-DD");
      const startDate = dayjs(hospDate).format("YYYY-MM-DD");
      let eachTime = dayjs(beginDate).add(i, "day").format("YYYY-MM-DD");
      if (eachTime === endDate || eachTime === todayDate) {
        dateClosed.stopTime = false;
      }
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
      return dateClosed.stopTime ? eachTime : "";
    },
  },
  {
    name: "住院天数",
    getValue: (i, renderData) => {
      const {
        beginDate,
        hospDays,
        outdate = "",
        dateClosed,
      } = renderData.infoData;
      console.log(dateClosed, "dateClosed");
      const tieml = new Date();
      const timeNew = new Date((tieml / 1000 + 86400) * 1000);
      const todayDate = dayjs(timeNew).format("YYYY-MM-DD");
      const endDate = dayjs(outdate).format("YYYY-MM-DD");
      const eachTime = dayjs(beginDate).add(i, "day").format("YYYY-MM-DD");
      if (eachTime === endDate || todayDate === eachTime) {
        dateClosed.stopNumber = false;
      }
      return dateClosed.stopNumber ? hospDays + i + 1 : "";
    },
  },
  {
    name: "手术或产后日数",
    getValue: (i, renderData) => {
      const { postpartum } = renderData.infoData;
      return postpartum[i];
    },
  },
];
export const HEAD_HEIGHT = 100; // 头部文字预留位置
export const LINE_HEIGHT = 20; // 一行的行高
export const textLeftMargin = 4; // 文字左边边距
export const TEXT_MARGIN_BOTTOM = 6; // 文字向上偏移量
export const symbolArrowHeight = 20;
