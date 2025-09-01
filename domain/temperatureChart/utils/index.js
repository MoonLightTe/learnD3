import * as d3 from "d3-6";
import { starNumEnv, endNumEnv } from "../const/index";
import ViewConfig from "./viewConfig";

const options = {
  x: (d) => d.year,
  y: (d) => d.gas,
  xType: d3.scaleBand,
  yDomain: [starNumEnv, endNumEnv],
  width: 980,
  height: 1180,
  marginLeft: 10,
  marginRight: 10,
  marginTop: 10,
  marginBottom: 80,
  duration: 5000, // for the intro animation; 0 to disable
};

export function init(data) {
  console.log("🚀 ~ init ~ data:", data);
  //第一步处理数据
  const groupData = groupTemperatureData(data);
  Reflect.set(options, "renderData", groupData);
  console.log("🚀 ~ init ~ options:", options);
  const chart = ConnectedScatterplot(options);
  document.getElementById("temperatureChart").appendChild(chart);
}

function ConnectedScatterplot(options) {
  const viewConfig = new ViewConfig(options);
  console.log("🚀 ~ ConnectedScatterplot ~ viewConfig:", viewConfig);
  let tooltip;
  const svg = d3
    .create("svg")
    .attr("id", "printsvg")
    .attr("width", viewConfig.width)
    .attr("height", viewConfig.height)
    .attr("viewBox", [0, 0, viewConfig.width, viewConfig.height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
    .attr("transform", `translate(0,${viewConfig.marginTop})`);
  setTimeout(() => {
    tooltip = svg.append("g").style("pointer-events", "none");
  });
  const range = d3.range(viewConfig.renderData.rowsData.length);
  console.log("🚀 ~ ConnectedScatterplot ~ range:", range);
  // 很方便的知道x轴的坐标
  const xScale = d3.scaleBand().domain(range).rangeRound(viewConfig.xRange);
  const bodyScale = d3.scaleLinear(
    [bodyTemperature[0], bodyTemperature[1]],
    viewConfig.yRange
  );
  const heartScale = d3.scaleLinear(
    [heartRange[0], heartRange[1]],
    viewConfig.yRange
  );

  // 心率上限
  const bodyOverflowData = getMaxList({
    list: viewConfig.renderData.datasetHeartRate.flat(Infinity),
    max: heartRange[1],
    min: heartRange[0],
    maxDefault: 180,
    minDefault: 40,
  });
  // 脉搏上限
  const datasetPulse = getMaxList({
    list: viewConfig.renderData.datasetPulse.flat(Infinity),
    max: heartRange[1],
    min: heartRange[0],
    maxDefault: 180,
    minDefault: 40,
  });
  // 口温下限
  const bodyData = getMaxList({
    list: viewConfig.renderData.bodyData,
    max: bodyTemperature[1],
    min: bodyTemperature[0],
    maxDefault: 42,
    minDefault: 35,
  });
  // 腋温下限
  const datasetAnus = getMaxList({
    list: viewConfig.renderData.datasetAnus,
    max: bodyTemperature[1],
    min: bodyTemperature[0],
    maxDefault: 42,
    minDefault: 35,
  });
  // 肛温下限
  const datasetHeartrate = getMaxList({
    list: viewConfig.renderData.datasetHeartrate,
    max: bodyTemperature[1],
    min: bodyTemperature[0],
    maxDefault: 42,
    minDefault: 35,
  });

  // 耳温下限
  const earCool = getMaxList({
    list: viewConfig.renderData.earCool,
    max: bodyTemperature[1],
    min: bodyTemperature[0],
    maxDefault: 42,
    minDefault: 35,
  });
  const allTemperature = [
    bodyOverflowData,
    datasetPulse,
    bodyData,
    datasetAnus,
    datasetHeartrate,
    earCool,
  ];
  return svg.node();
}

function getMaxList({
  list = [],
  max = 0,
  min = 0,
  maxDefault = 0,
  minDefault = 0,
} = {}) {
  return list.map((item) => {
    if ((item.value > max || item.value < min) && item.value !== null) {
      const ismax = item.value > max;
      return {
        ...item,
        value: ismax ? maxDefault : minDefault,
        sourceValue: item.value,
        ismax: ismax,
        max,
        min,
      };
    } else {
      return null;
    }
  });
}

function groupTemperatureData(datas) {
  const rowsData = datas.rows;
  const infoData = datas.grParamBOS[0];
  const typesData = datas.types;
  const selectOp = datas.selectOp;
  const symbolTextArr = getTypeData("012", rowsData, false);
  console.log("🚀 ~ groupTemperatureData ~ symbolTextArr:", symbolTextArr);
  const symbolGoUp = getTypeData("003", rowsData, false);
  console.log("🚀 ~ groupTemperatureData ~ symbolGoUp:", symbolGoUp);
  const symbolContent = getTypeData("013", rowsData, false);
  console.log("🚀 ~ groupTemperatureData ~ symbolContent:", symbolContent);
  const mergeTag = setMergeTag(symbolTextArr, symbolContent);
  console.log("🚀 ~ groupTemperatureData ~ mergeTag:", mergeTag);
  const bodyData = getTypeAnimalHeat("003", rowsData, "1");
  console.log(bodyData, "口温");
  const datasetAnus = getTypeAnimalHeat("003", rowsData, "2");
  console.log(datasetAnus, "腋温【x】");
  const datasetHeartrate = getTypeAnimalHeat("003", rowsData, "3");
  console.log(datasetHeartrate, "肛温【红空圆】");
  const earCool = getTypeAnimalHeat("003", rowsData, "4");
  console.log(earCool, "耳朵温");
  const allTemperatureData = [bodyData, datasetAnus, datasetHeartrate, earCool]; // 所有的温度记录
  console.log(
    "🚀 ~ groupTemperatureData ~ allTemperatureData:",
    allTemperatureData
  );
  const datasetPulse = getTypeData("002", rowsData);
  console.log("🚀 ~ groupTemperatureData ~ datasetPulse:", datasetPulse);
  const datasetHeartRate = getTypeData("014", rowsData);
  console.log(
    "🚀 ~ groupTemperatureData ~ datasetHeartRate:",
    datasetHeartRate
  );
  const dataCool = getTypeData("015", rowsData);
  console.log(dataCool, "【物理降温】");
  const datasetPain = getTypeData("001", rowsData, false);
  console.log(datasetPain, "呼吸");
  const title = infoData.title;
  return {
    title,
    datasetHeartRate,
    bodyData,
    datasetAnus,
    datasetHeartrate,
    earCool,
    allTemperatureData,
    datasetPulse: [datasetPulse],
    mergeTag,
    dataCool,
    datasetPain,
    typesData,
    infoData,
    rowsData,
    symbolGoUp,
    brokenLineData: [symbolGoUp],
  };
}

function getTypeData(type, datas = [], isNumber = true) {
  return datas.map((col, index) => {
    const rowBOS = col.rowBOS;
    const currentItem = rowBOS.find((item) => item.typeCode === type) || {};
    return {
      index,
      date: currentItem.date,
      value:
        (isNumber ? +currentItem.typeValue : currentItem.typeValue) || null,
    };
  });
}

function setMergeTag(ymbolTextArr = [], symbolContent = []) {
  const arr = [];
  ymbolTextArr.forEach((item) => {
    symbolContent.forEach((res) => {
      if (item.index === res.index) {
        arr.push({
          ...item,
          ...res,
          value: item.value
            ? (item.value ? item.value : "") + (res.value ? res.value : "")
            : "",
        });
      }
    });
  });
  return arr;
}

function getTypeAnimalHeat(type, allData = [], code) {
  return allData
    .map((rowBOSItem, index) => {
      const rowBOS = rowBOSItem.rowBOS;
      const cur =
        rowBOS.find((item) => {
          return item.typeCode === type;
        }) || {};
      return {
        index: index,
        date: cur.date,
        value: (+cur.collectionMode === +code ? +cur.typeValue : null) || null,
      };
    })
    .map((item) => {
      if (item.value) {
        // item.value = NaN
      }
      return item;
    });
}
