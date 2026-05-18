import * as d3 from "d3-6";
import {
  starNumEnv,
  endNumEnv,
  bodyTemperature,
  heartRange,
  leftTEXT,
  HEAD_HEIGHT,
  timeNumber,
  dayNumber,
  colCount,
  textLeftMargin,
  TEXT_MARGIN_BOTTOM,
  TOP_KEYS,
  LINE_HEIGHT,
  BOTTOM_KEYS,
  nightTime,
  INFO_KEYS,
} from "../const/index";
import ViewConfig from "./viewConfig";
import TEMPLATE_CONFIG from "../entry/template.json";

// 事件类型 → 颜色映射
var EVENT_COLOR_MAP = {};
(TEMPLATE_CONFIG.events || []).forEach(function (evt) {
  EVENT_COLOR_MAP[evt.type] = evt.color;
});

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

export function init(data, containerId, containerEl) {
  //第一步处理数据
  const groupData = groupTemperatureData(data);
  Reflect.set(options, "renderData", groupData);
  const chart = ConnectedScatterplot(options);
  const container = containerEl || document.getElementById(containerId || "chartWrapper")
  if (container) container.appendChild(chart);
}

function ConnectedScatterplot(options) {
  const viewConfig = new ViewConfig(options);
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
    viewConfig.tooltip = tooltip;
  });
  const range = d3.range(viewConfig.renderData.rowsData.length);
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
  viewConfig.xScale = xScale;
  viewConfig.bodyScale = bodyScale;
  viewConfig.heartScale = heartScale;
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
  initArrow(svg);
  drwaPulse(svg, viewConfig);
  drawBgLine(svg, viewConfig);
  drawVerticalLine(svg, viewConfig);
  viewConfig.renderData.brokenLineData.forEach((item) => {
    brokenLine(svg, item, viewConfig);
  });
  viewConfig.renderData.datasetPulse.forEach((item) => {
    drawHeart(svg, item, viewConfig);
  });
  viewConfig.renderData.datasetHeartRate.forEach((item) => {
    drawHeartRate(svg, item, viewConfig);
  });
  console.log("renderData", viewConfig.renderData);
  //口温icon
  drawPathBody(svg, viewConfig.renderData.bodyData, viewConfig);
  // 绘制ye
  drawAnus(svg, viewConfig.renderData.datasetAnus, viewConfig);
  drawJuhua(svg, viewConfig.renderData.datasetHeartrate, viewConfig);
  thermometer(svg, viewConfig.renderData.earCool, viewConfig);
  drawBreathing(svg, viewConfig.renderData.datasetPain, viewConfig);
  drawTopMask(svg, viewConfig);
  drawBottomMask(svg, viewConfig);
  drawBottomLineData(svg, viewConfig);
  drawTopData(svg, viewConfig);
  drawSpecialText(svg, viewConfig.renderData.mergeTag, viewConfig);
  console.log("🚀 ~ ConnectedScatterplot ~ viewConfig:", viewConfig.renderData);
  drawSpecialText(
    svg,
    viewConfig.renderData.symbolGoUp.filter((item) => !isNumeric(item.value)),
    viewConfig,
    viewConfig,
    true
  );
  drawCoolBody(
    svg,
    viewConfig.renderData.dataCool,
    viewConfig.renderData.allTemperatureData,
    viewConfig
  );
  drawOtherInfo(svg, viewConfig);
  drawTabelBorder(svg, viewConfig);
  drawPulseDeficit(svg, viewConfig);

  return svg.node();
}

function drawPulseDeficit(svg, viewConfig) {
  let datasetPulse = viewConfig.renderData.datasetPulse.flat(Infinity);
  console.log("🚀 ~ drawPulseDeficit ~ datasetPulse:", datasetPulse);
  let datasetHeartRate = viewConfig.renderData.datasetHeartRate.flat(Infinity);
  console.log("🚀 ~ drawPulseDeficit ~ datasetHeartRate:", datasetHeartRate);
  const indexList = [18, 24];
  const points = [];
  indexList.forEach((index) => {
    let pulseItem = datasetPulse[index];
    let X = viewConfig.xScale(index) + viewConfig.X_OFFSET;
    let pulseY = viewConfig.heartScale(pulseItem.value);
    // let heartY = viewConfig.heartScale(heartRateItem.value);
    points.push([X, pulseY]);
    // points.push([X, heartY]);
  });
  indexList.reverse().forEach((index) => {
    let heartRateItem = datasetHeartRate[index];
    let X = viewConfig.xScale(index) + viewConfig.X_OFFSET;
    let heartY = viewConfig.heartScale(heartRateItem.value);
    points.push([X, heartY]);
  });
  const g = getG(svg, viewConfig);
  const defs = svg.append("defs");

  const pattern = defs
    .append("pattern")
    .attr("id", "hatch-pattern") // 給圖樣一個唯一的ID
    .attr("width", 8) // 圖樣單元的寬度
    .attr("height", 8) // 圖樣單元的高度，寬高決定了斜線的間隔
    .attr("patternUnits", "userSpaceOnUse") // 使用絕對座標，不受圖形大小影響
    .attr("patternTransform", "rotate(45)"); // 將圖樣旋轉45度，讓直線變斜線

  // 在圖樣中繪製一條基本的線段
  pattern
    .append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", 8) // 線的長度等於圖樣單元的高度
    .attr("stroke", "blue")
    .attr("stroke-width", 3);

  // 3. 繪製四邊形並使用圖樣填充
  g.append("polygon")
    .attr("points", points.map((p) => p.join(",")).join(" "))
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    // 關鍵！將填充設定為引用我們的圖樣
    .attr("fill", "url(#hatch-pattern)")
    .attr("stroke", "none");

  console.log("🚀 ~ drawPulseDeficit ~ points:", points);
}

function drawHeart(svg, pathData, viewConfig) {
  console.log("🚀 ~ drawHeart ~ pathData:", pathData);
  const indexList = d3.map(pathData, (_, i) => i);
  const g = getG(svg, viewConfig);
  const pointerObj = {
    pathData: viewConfig.renderData.datasetPulse.flat(Infinity),
    type: "脉搏",
    viewConfig,
    yScaleInstance: viewConfig.heartScale,
  };
  setPointerEvent(g, pointerObj);
  const line = d3
    .line()
    .defined((i) => pathData[i].value)
    .x((i) => {
      return viewConfig.xScale(pathData[i].index) + viewConfig.X_OFFSET;
    })
    .y((i) => {
      return viewConfig.heartScale(pathData[i].value || 0);
    });
  getDrawPath({
    content: g,
    line: line(indexList.filter((i) => isNumeric(pathData[i].value))),
    stroke: "red",
    viewConfig,
  });
  let iconObj = {
    content: g,
    data: d3.range(pathData.length),
    x: getXPostion(pathData, viewConfig),
    y: getYPosition(pathData, viewConfig.heartScale),
    fill: "red",
    stroke: "red",
  };
  drawRoundIcon(iconObj);
}

function drawTabelBorder(svg, viewConfig) {
  const g = svg
    .append("g")
    .attr(
      "transform",
      `translate(${viewConfig.marginLeft},${viewConfig.topPos})`
    );
  g.append("line")
    .attr("x1", 0)
    .attr("y1", viewConfig.topKeysPos)
    .attr("x2", viewConfig.step)
    .attr("y2", viewConfig.topKeysPos)
    .attr("stroke", viewConfig.stroke);

  g.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", viewConfig.contentWidth)
    .attr("height", viewConfig.tableHeight)
    .attr("stroke", viewConfig.stroke)
    .attr("fill", "none")
    .attr("style", "stroke-width: 2");
}
function drawOtherInfo(svg, viewConfig) {
  console.log("🚀 ~ drawOtherInfo ~ viewConfig:", viewConfig);
  const data = viewConfig.renderData.infoData;
  const g = svg
    .append("g")
    .attr(
      "transform",
      `translate(${viewConfig.marginLeft},${viewConfig.marginTop})`
    )
    .attr("style", "font-size:14px;");
  svg
    .append("g")
    .attr(
      "transform",
      `translate(${viewConfig.marginLeft},${
        viewConfig.bottomPos + viewConfig.marginTop + HEAD_HEIGHT
      })`
    )
    .attr("style", "font-size:14px;")
    .attr("class", "iconClass")
    .call((g) => {
      const dataList = [
        {
          name: "口温",
          fn: drawRoundIcon,
          params: {
            content: g,
            data: [0],
          },
        },
        {
          name: "腋温",
          fn: drawXIcon,
          params: {
            content: g,
            data: [0],
          },
        },
        {
          name: "肛温",
          fn: drawRoundDotIcon,
          params: {
            content: g,
            data: [0],
          },
        },
        {
          name: "耳温",
          fn: drawThreeIcon,
          params: {
            content: g,
            data: [0],
          },
        },
        {
          name: "心率",
          fn: drawRoundIcon,
          params: {
            content: g,
            data: [0],
            fill: "white",
            stroke: "red",
          },
        },
        {
          name: "脉搏",
          fn: drawRoundIcon,
          params: {
            content: g,
            data: [0],
            fill: "red",
            stroke: "red",
          },
        },
      ];
      g.append("text").text("标准：");
      dataList.map((item, i) => {
        g.append("text")
          .text(item.name)
          .attr("x", 40 + i * 80);
        item.fn({
          ...item.params,
          x: () => 80 + i * 80,
          y: () => -4,
        });
      });
    });

  g.append("text")
    .attr("class", "mytext")
    .attr("x", 0)
    .attr("y", () => {
      return HEAD_HEIGHT - TEXT_MARGIN_BOTTOM - 6;
    })
    .html(() => {
      return INFO_KEYS.map(({ name, key }, index) => {
        return `<tspan dx="${index === 0 ? 0 : 20}" dy="${0}">${name}: ${
          data[key] ? data[key] : ""
        }</tspan>`;
      }).join("");
    });
  g.append("text")
    .attr("style", "font-size:26px; text-anchor: middle")
    .attr("class", "mytext")
    .attr("x", viewConfig.width / 2)
    .attr("y", () => {
      return HEAD_HEIGHT - 4 * LINE_HEIGHT;
    })
    .text(data.title);
  g.append("text")
    .attr("style", "font-size:22px;text-anchor: middle;")
    .attr("class", "mytext")
    .attr("x", viewConfig.width / 2)
    .attr("y", () => {
      return HEAD_HEIGHT - 2 * LINE_HEIGHT - 6;
    })
    .text("体温单");
}

function drawCoolBody(svg, data, allData, viewConfig) {
  const g = getG(svg, viewConfig);
  // 获取同个位置记录的温度
  const temArrMap = allData.reduce((data, items) => {
    items.map((item) => {
      if (item.value) {
        data[item.index] = item.value;
      }
    });
    return data;
  }, {});
  const vaildData = data.filter((item) => item.value);
  console.log("🚀 ~ drawCoolBody ~ vaildData:", vaildData);
  console.log("🚀 ~ drawCoolBody ~ temArrMap:", temArrMap);
  const lineData = vaildData.filter(
    ({ index, value }) => temArrMap[index] != value
  );
  console.log("🚀 ~ drawCoolBody ~ lineData:", lineData);
  g.append("g")
    .selectAll("line")
    .data(lineData)
    .join("line")
    .attr("class", "xuxianliane")
    .attr("x1", function ({ index }) {
      return viewConfig.xScale(index) + viewConfig.X_OFFSET;
    })
    .attr("y1", function ({ value }) {
      return viewConfig.bodyScale(value);
    })
    .attr("x2", function ({ index }) {
      return viewConfig.xScale(index) + viewConfig.X_OFFSET;
    })
    .attr("y2", function ({ index }) {
      const bodyValue = temArrMap[index];
      // console.log(bodyValue, index, "bodyValue", bodyScale(bodyValue));
      return viewConfig.bodyScale(bodyValue);
    })
    .attr("stroke", "red")
    .attr("stroke-width", 2)
    .style("stroke-dasharray", "3, 3")
    .attr("stroke-linejoin", viewConfig.strokeLinejoin)
    .attr("stroke-linecap", viewConfig.strokeLinecap);
  drawRoundIcon({
    content: g,
    data: d3.range(vaildData.length),
    x: getXPostion(vaildData, viewConfig),
    y: getYPosition(vaildData, viewConfig.bodyScale),
    fill: "transparent",
    stroke: "red",
    r: 6,
  });
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
  const symbolGoUp = getTypeData("003", rowsData, false);
  const symbolContent = getTypeData("013", rowsData, false);
  const mergeTag = setMergeTag(symbolTextArr, symbolContent);
  const bodyData = getTypeAnimalHeat("003", rowsData, "1");
  console.log(bodyData, "口温");
  const datasetAnus = getTypeAnimalHeat("003", rowsData, "2");
  console.log(datasetAnus, "腋温【x】");
  const datasetHeartrate = getTypeAnimalHeat("003", rowsData, "3");
  console.log(datasetHeartrate, "肛温【红空圆】");
  const earCool = getTypeAnimalHeat("003", rowsData, "4");
  console.log(earCool, "耳朵温");
  const allTemperatureData = [bodyData, datasetAnus, datasetHeartrate, earCool]; // 所有的温度记录
  const datasetPulse = getTypeData("002", rowsData);
  const datasetHeartRate = getTypeData("014", rowsData);
  const dataCool = getTypeData("015", rowsData);
  console.log(dataCool, "【物理降温】");
  const datasetPain = getTypeData("001", rowsData, false);
  console.log(datasetPain, "呼吸");
  const title = infoData.title;
  infoData.dateClosed = {
    stopTime: true, // 控制结束日期
    stopNumber: true, // 控制住院天数
  };
  return {
    title,
    datasetHeartRate: [datasetHeartRate],
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
    surgeryDates: datas.surgeryDates || null,
  };
}

function getTypeData(type, datas = [], isNumber = true) {
  return datas.map((col, index) => {
    const rowBOS = col.rowBOS;
    const currentItem = rowBOS.find((item) => item.typeCode === type) || {};
    return {
      index,
      date: currentItem.date,
      times: currentItem.times || null,
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
          value: item.value || "",
          recordTime: res.value || null,
          times: item.times,
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

function getG(svg, viewConfig) {
  return svg
    .append("g")
    .attr(
      "transform",
      `translate(${viewConfig.marginLeft},${
        viewConfig.marginTop + HEAD_HEIGHT
      })`
    );
}
function initArrow(svg) {
  const arrowMarkerRed = svg
    .append("defs")
    .append("marker")
    .attr("id", "redArrow")
    .attr("markerUnits", "strokeWidth")
    .attr("markerWidth", "12")
    .attr("markerHeight", "12")
    .attr("viewBox", "0 0 12 12")
    .attr("refX", "6")
    .attr("refY", "6")
    .attr("orient", "auto");
  const arrowPath = "M2,2 L10,6 L2,10 L6,6 L2,2";
  arrowMarkerRed.append("path").attr("d", arrowPath).attr("fill", "red");
  const arrowMarkerBlue = svg
    .append("defs")
    .append("marker")
    .attr("id", "blueArrow")
    .attr("markerUnits", "strokeWidth")
    .attr("markerWidth", "12")
    .attr("markerHeight", "12")
    .attr("viewBox", "0 0 12 12")
    .attr("refX", "6")
    .attr("refY", "6")
    .attr("orient", "auto");
  arrowMarkerBlue.append("path").attr("d", arrowPath).attr("fill", "blue");
}
// 绘制脉搏体温文字
function drwaPulse(svg, viewConfig) {
  // 左侧的文字
  const g = getG(svg, viewConfig);
  g.append("line")
    .attr("class", "slefline")
    .attr("y1", viewConfig.topKeysPos) // 这个还要修改一下
    .attr("x1", viewConfig.step / 2)
    .attr("y2", viewConfig.bottomKeysPosStart)
    .attr("x2", viewConfig.step / 2)
    .attr("stroke", viewConfig.stroke);

  leftTEXT.map((texts, index) => {
    g.append("g")
      .selectAll("text")
      .data(texts)
      .join("text")
      .attr("style", `font-size:14px;fill:${["red", "blue"][index]}`)
      .attr("class", "mytext")
      .html((d, i) => {
        if (i === 0) {
          const value = d.split(",");
          return `<tspan>${value[0]}</tspan><tspan dx="${
            -35 + index * 10
          }" dy="20">${value[1]}</tspan>`;
        }
        return `${d}`;
      })
      .attr("x", (d, i) => {
        return index === 0 && i === 0
          ? viewConfig.micoStep / 2
          : viewConfig.micoStep * Math.max(index * 4, 1);
      })
      .attr("y", (d, i) => {
        if (i === 0) {
          return viewConfig.topKeysPos + viewConfig.micoStep * 1;
        }
        if (i === texts.length - 1) {
          return viewConfig.topKeysPos + viewConfig.micoStep * 5 * i;
        }
        // 加5的目的是视觉看起来对齐
        return viewConfig.topKeysPos + viewConfig.micoStep * 5 * i + 5;
      });
  });
}
function drawBgLine(svg, viewConfig) {
  const g = getG(svg, viewConfig);
  // 绘制横线
  const horizontalLength = (bodyTemperature[1] - bodyTemperature[0] + 1) * 5;
  const horizontalData = [...new Array(horizontalLength).keys()];
  g.append("g")
    .attr("class", "line-content")
    .selectAll("line")
    .data(horizontalData)
    .join("line")
    .attr("x1", viewConfig.step)
    .attr("y1", (d, i) => {
      return viewConfig.topKeysPos + i * viewConfig.micoStep;
    })
    .attr("x2", viewConfig.contentWidth)
    .attr("y2", (d, i) => {
      return viewConfig.topKeysPos + i * viewConfig.micoStep;
    })
    .attr("fill", "none")
    .attr("stroke", viewConfig.stroke)
    .attr("stroke-width", 1)
    .attr("stroke-linejoin", viewConfig.strokeLinejoin)
    .attr("stroke-linecap", viewConfig.strokeLinecap)
    .attr("style", (d, i) => {
      if (i % 5 == 0 && i != 0) {
        return "stroke-width: 1; stroke: blue;";
      }
      return "stroke-width: 1";
    });

  // 绘制竖线
  const verticalData = [...new Array(colCount).keys()];
  g.append("g")
    .selectAll("line")
    .data(verticalData)
    .join("line")
    .attr("x1", (d, i) => {
      return viewConfig.step + i * viewConfig.micoStep;
    })
    .attr("y1", viewConfig.topKeysPos)
    .attr("x2", (d, i) => {
      return viewConfig.step + i * viewConfig.micoStep;
    })
    .attr("y2", viewConfig.bottomKeysPosStart)
    .attr("fill", "none")
    .attr("class", "dataLine")
    .attr("stroke", viewConfig.stroke)
    .attr("stroke-width", 1)
    .attr("stroke-linejoin", viewConfig.strokeLinejoin)
    .attr("stroke-linecap", viewConfig.strokeLinecap)
    .attr("visibility", (d, i) => (i % 6 !== 0 ? "visible" : "hidden")); // 6可以抽离出来
}
function drawVerticalLine(svg, viewConfig) {
  const g = getG(svg, viewConfig);
  let start = 0;
  g.attr("class", "makeLine2");
  while (start <= viewConfig.contentWidth) {
    g.append("line")
      .attr("x1", start)
      .attr("y1", 0)
      .attr("y2", viewConfig.tableHeight)
      .attr("x2", start)
      .attr(
        "stroke",
        start > viewConfig.step && start !== viewConfig.contentWidth
          ? "red"
          : viewConfig.stroke
      );
    start = start + viewConfig.step;
  }
}

function brokenLine(svg, pathData, viewConfig) {
  const indexList = d3.map(pathData, (_, i) => i);
  console.log("indexList", indexList);
  const g = getG(svg, viewConfig);
  const line = d3
    .line()
    .defined((i) => pathData[i].value)
    .x((i) => {
      return viewConfig.xScale(pathData[i].index) + viewConfig.X_OFFSET;
    })
    .y((i) => viewConfig.bodyScale(pathData[i].value));
  getDrawPath({
    content: g,
    viewConfig,
    line: line(indexList.filter((i) => isNumeric(pathData[i].value))),
  });
}
function drawHeartRate(svg, pathData, viewConfig) {
  const indexList = d3.map(pathData, (_, i) => i);
  const g = getG(svg, viewConfig);
  const pointerObj = {
    pathData: viewConfig.renderData.datasetHeartRate.flat(Infinity),
    type: "心率",
    viewConfig,
    yScaleInstance: viewConfig.heartScale,
  };
  g.on("pointerenter", generatePointer(pointerObj))
    .on("pointerleave", pointerLeft(viewConfig))
    .on("pointermove", generatePointer(pointerObj));
  const line = d3
    .line()
    .defined((i) => pathData[i].value)
    .x((i) => {
      return viewConfig.xScale(pathData[i].index) + viewConfig.X_OFFSET;
    })
    .y((i) => {
      return viewConfig.heartScale(pathData[i].value);
    });
  getDrawPath({
    content: g,
    line: line(indexList.filter((i) => isNumeric(pathData[i].value))),
    stroke: "red",
    viewConfig,
  });
  drawRoundIcon({
    content: g,
    data: d3.range(pathData.length),
    x: getXPostion(pathData, viewConfig),
    y: getYPosition(pathData, viewConfig.heartScale),
    fill: "white",
    stroke: "red",
  });
}
function drawPathBody(svg, pathData, viewConfig) {
  const g = getG(svg, viewConfig);
  const pointerObj = {
    pathData,
    type: "口温",
    viewConfig,
    yScaleInstance: viewConfig.bodyScale,
  };
  setPointerEvent(g, pointerObj);
  let iconObj = {
    content: g,
    data: d3.range(pathData.length),
    x: getXPostion(pathData, viewConfig),
    y: getYPosition(pathData, viewConfig.bodyScale),
    r: 3,
  };
  drawRoundIcon(iconObj);
}
function drawAnus(svg, pathData, viewConfig) {
  const g = getG(svg, viewConfig);
  const pointerObj = {
    pathData,
    type: "腋温",
    viewConfig,
    yScaleInstance: viewConfig.bodyScale,
  };
  setPointerEvent(g, pointerObj);
  let iconObj = {
    content: g,
    data: d3.range(pathData.length),
    x: getXPostion(pathData, viewConfig),
    y: getYPosition(pathData, viewConfig.bodyScale),
    r: 3,
  };
  drawXIcon(iconObj);
}

// 绘制肛温
function drawJuhua(svg, pathData, viewConfig) {
  const g = getG(svg, viewConfig);

  const pointerObj = {
    pathData,
    type: "肛温",
    viewConfig,
    yScaleInstance: viewConfig.bodyScale,
  };
  setPointerEvent(g, pointerObj);
  let iconObj = {
    content: g,
    data: d3.range(pathData.length),
    x: getXPostion(pathData, viewConfig),
    y: getYPosition(pathData, viewConfig.bodyScale),
    fill: "white",
    deepFill: "blue",
    r: 3,
  };

  drawRoundDotIcon(iconObj);
}

function thermometer(svg, pathData, viewConfig) {
  const g = getG(svg, viewConfig);
  const pointerObj = {
    pathData,
    type: "耳温",
    viewConfig,
    yScaleInstance: viewConfig.bodyScale,
  };
  setPointerEvent(g, pointerObj);
  let iconObj = {
    content: g,
    data: d3.range(pathData.length),
    x: getXPostion(pathData, viewConfig),
    y: getYPosition(pathData, viewConfig.bodyScale),
    riangle: 24,
  };
  drawThreeIcon(iconObj);
}

function drawBreathing(svg, breathData, viewConfig) {
  const g = getG(svg, viewConfig);
  g.append("rect")
    .attr("class", "mask-rect")
    .attr("x", 1)
    .attr("y", viewConfig.bottomKeysPosStart)
    .attr("width", viewConfig.contentWidth - 2)
    .attr("height", viewConfig.micoStep * 2 - 1)
    .attr("stroke", viewConfig.stroke)
    .attr("fill", "#fff")
    .attr("style", "stroke-width: 0");
  g.append("line")
    .attr("x1", 0)
    .attr("y1", viewConfig.bottomKeysPosStart)
    .attr("x2", viewConfig.contentWidth)
    .attr("y2", viewConfig.bottomKeysPosStart)
    .attr("fill", "none")
    .attr("class", "dataLine")
    .attr("stroke", viewConfig.stroke)
    .attr("stroke-width", 1)
    .attr("stroke-linejoin", viewConfig.strokeLinejoin)
    .attr("stroke-linecap", viewConfig.strokeLinecap);
  // .attr("visibility", (d, i) => (i % 6 !== 0 ? "visible" : "hidden")); // 6可以抽离出来

  const textYPos =
    viewConfig.bottomKeysPosStart + viewConfig.micoStep + TEXT_MARGIN_BOTTOM;
  g.append("text")
    .attr("style", "font-size: 14px")
    .text("呼吸(次/分)")
    .attr("x", textLeftMargin)
    .attr("y", textYPos);

  const data = d3.range(colCount);
  g.append("g")
    .selectAll("text")
    .data(data)
    .join("text")
    .attr("style", "font-size:14px")
    .attr("class", "mytext")
    .text((d) => {
      return breathData[d]?.value;
    })
    .attr("x", (i) => {
      return viewConfig.step + i * viewConfig.micoStep + 2;
    })
    .attr("y", (i) => {
      if (i % 2) {
        return textYPos + 10;
      }
      return textYPos - 10;
    });

  g.append("g")
    .selectAll("line")
    .data(data)
    .join("line")
    .attr("x1", (d, i) => {
      return viewConfig.step + i * viewConfig.micoStep;
    })
    .attr("y1", (d, i) => viewConfig.bottomKeysPosStart)
    .attr("x2", (d, i) => {
      return viewConfig.step + i * viewConfig.micoStep;
    })
    .attr("y2", (d, i) => {
      return viewConfig.bottomKeysPosStart + 2 * viewConfig.micoStep;
    })
    .attr("fill", "none")
    .attr("class", "dataLine")
    .attr("stroke", viewConfig.stroke)
    .attr("stroke-width", 1)
    .attr("stroke-linejoin", viewConfig.strokeLinejoin)
    .attr("stroke-linecap", viewConfig.strokeLinecap)
    .attr("visibility", (d, i) => (i % 6 !== 0 ? "visible" : "hidden")); // 6可以抽离出来
}

function drawTopMask(svg, viewConfig) {
  svg
    .append("g")
    .attr(
      "transform",
      `translate(${viewConfig.marginLeft},${HEAD_HEIGHT - LINE_HEIGHT})`
    )
    .append("rect")
    .attr("class", "mask-rect")
    .attr("x", 0)
    .attr("y", -100)
    .attr("width", viewConfig.contentWidth)
    .attr("height", LINE_HEIGHT * (TOP_KEYS.length + 7.5) - 1)
    .attr("stroke", viewConfig.stroke)
    .attr("fill", "#fff")
    .attr("style", "stroke-width: 0");
  drawTopVerticalLine(svg, viewConfig);
}

function drawBottomMask(svg, viewConfig) {
  const g = getG(svg, viewConfig);
  g.append("rect")
    .attr("x", 0)
    .attr("y", viewConfig.bottomKeysPosStart + viewConfig.micoStep * 2)
    .attr("width", viewConfig.contentWidth)
    .attr("height", LINE_HEIGHT * (BOTTOM_KEYS.length + 5))
    .attr("stroke", viewConfig.stroke)
    .attr("fill", "#fff")
    .attr("style", "stroke-width: 0");
  drawBottomMaskLine(svg, viewConfig);
}

function drawBottomMaskLine(svg, viewConfig) {
  let start = 0;
  const lineG = getG(svg, viewConfig).append("g").attr("class", "topMaskLine");
  while (start < viewConfig.contentWidth) {
    lineG
      .append("line")
      .attr("fill", "stroke")
      .attr("x1", start)
      .attr("y1", viewConfig.bottomKeysPosStart)
      .attr("y2", viewConfig.tableHeight)
      .attr("x2", start)
      .attr("stroke", start > viewConfig.step ? "red" : viewConfig.stroke);
    start = start + viewConfig.step;
  }
}
function drawTopVerticalLine(svg, viewConfig) {
  let start = viewConfig.step;
  const lineG = getG(svg, viewConfig).append("g").attr("class", "topMaskLine");
  while (start < viewConfig.contentWidth) {
    lineG
      .append("line")
      .attr("fill", "stroke")
      .attr("x1", start)
      .attr("y1", 0)
      .attr("y2", (TOP_KEYS.length + 1) * LINE_HEIGHT)
      .attr("x2", start)
      .attr("stroke", start > viewConfig.step ? "red" : viewConfig.stroke);
    start = start + viewConfig.step;
  }
}

function drawBottomLineData(svg, viewConfig) {
  const g = getG(svg, viewConfig);
  // 绘制行分隔横线（含最后一行的结束边框）
  var bottomLineCount = BOTTOM_KEYS.length + 1;
  g.selectAll("line")
    .data(d3.range(bottomLineCount))
    .join("line")
    .attr("x1", 0)
    .attr("y1", (d, i) => viewConfig.bottomKeysPosStart + (i + 2) * LINE_HEIGHT)
    .attr("x2", viewConfig.contentWidth)
    .attr("y2", (d, i) => viewConfig.bottomKeysPosStart + (i + 2) * LINE_HEIGHT)
    .attr("fill", "none")
    .attr("class", "dataLine")
    .attr("stroke", viewConfig.stroke)
    .attr("stroke-width", 1);

  const textArr = BOTTOM_KEYS;
  const repeatArr = d3.range(8);
  textArr.map(function ({ key, name, splitAmPm, customLabel }, index) {
    // 血压行：每天格子中间加竖线分隔上午/下午
    if (splitAmPm) {
      var yTop = viewConfig.bottomKeysPosStart + (index + 2) * LINE_HEIGHT;
      var yBottom = yTop + LINE_HEIGHT;
      for (var d = 1; d < 8; d++) {
        var xMid = viewConfig.step * d + viewConfig.step / 2;
        g.append("line")
          .attr("x1", xMid)
          .attr("y1", yTop)
          .attr("x2", xMid)
          .attr("y2", yBottom)
          .attr("stroke", viewConfig.stroke)
          .attr("stroke-width", 0.5);
      }
    }
    // 自定义项：从 typesData 读取动态 label
    var displayName = name;
    if (customLabel) {
      var customItems = getTypeValue(key, viewConfig.renderData.typesData);
      for (var ci = 0; ci < customItems.length; ci++) {
        if (customItems[ci] && customItems[ci].customName) {
          displayName = customItems[ci].customName;
          break;
        }
      }
    }
    g.append("g").selectAll("text").data(repeatArr).join("text")
      .attr("style", "font-size:14px")
      .attr("class", "bottomText")
      .text(function (i) {
        if (i === 0) return displayName;
        if (splitAmPm) {
          var val = getTypeValue(key, viewConfig.renderData.typesData)[i - 1]?.typeValue || '';
          var parts = String(val).split(/\s+/);
          return parts[0] || '';
        }
        return getTypeValue(key, viewConfig.renderData.typesData)[i - 1]?.typeValue;
      })
      .attr("x", (i) => viewConfig.step * i + textLeftMargin)
      .attr("y", viewConfig.bottomKeysPosStart + (index + 3) * LINE_HEIGHT - TEXT_MARGIN_BOTTOM);
    // 血压行：下午值渲染在分割线右侧
    if (splitAmPm) {
      var yLine = viewConfig.bottomKeysPosStart + (index + 3) * LINE_HEIGHT - TEXT_MARGIN_BOTTOM;
      var bpData = getTypeValue(key, viewConfig.renderData.typesData);
      for (var d = 0; d < 7; d++) {
        var val = bpData[d]?.typeValue || '';
        var parts = String(val).split(/\s+/);
        if (parts[1]) {
          var pmX = viewConfig.step * (d + 1) + viewConfig.step / 2 + textLeftMargin;
          g.append("text")
            .attr("style", "font-size:14px")
            .attr("class", "bottomText")
            .text(parts[1])
            .attr("x", pmX)
            .attr("y", yLine);
        }
      }
    }
  });
}

function drawTopData(svg, viewConfig) {
  const g = getG(svg, viewConfig);
  g.selectAll("line")
    .data(TOP_KEYS)
    .join("line")
    .attr("x1", 0)
    .attr("y1", (d, i) => {
      return LINE_HEIGHT * (i + 1);
    })
    .attr("y2", (d, i) => {
      return LINE_HEIGHT * (i + 1);
    })
    .attr("x2", viewConfig.contentWidth)
    .attr("fill", "none")
    .attr("class", "newline")
    .attr("stroke", viewConfig.stroke)
    .attr("stroke-width", 1)
    .attr("stroke-linejoin", viewConfig.strokeLinejoin)
    .attr("stroke-linecap", viewConfig.strokeLinecap);
  const repeatArr = d3.range(8);
  TOP_KEYS.map(({ getValue, name }, index) => {
    g.append("g")
      .selectAll("text")
      .data(repeatArr)
      .join("text")
      .attr("style", "font-size:14px;text-anchor:middle;")
      .attr("class", "mytext")
      .text((i) => {
        if (i == 0) {
          return name;
        } else {
          return getValue(i - 1, viewConfig.renderData);
        }
      })
      .attr("x", (i) => i * viewConfig.step + viewConfig.step / 2)
      .attr("y", () => {
        return LINE_HEIGHT * (index + 1) - TEXT_MARGIN_BOTTOM;
      });
  });
  g.append("text")
    .attr("style", "font-size:14px;text-anchor:middle;")
    .text("时 间")
    .attr("x", viewConfig.step / 2)
    .attr("y", viewConfig.topKeysPos - TEXT_MARGIN_BOTTOM);
  // 绘制竖线和时间汉字
  const data = new Array(timeNumber.length * 7)
    .fill("")
    .map((d, i) => timeNumber[i % timeNumber.length]);
  g.append("g")
    .selectAll("text")
    .data(data)
    .join("text")
    .attr("style", "font-size:14px")
    .attr("class", "mytext")
    .attr("fill", (d) => {
      if (nightTime.includes(d)) {
        return "red";
      } else {
        return viewConfig.stroke;
      }
    })
    .text((d) => {
      return d;
    })
    .attr("x", (d, i) => {
      return viewConfig.step + i * viewConfig.micoStep + 3;
    })
    .attr("y", (d, i) => {
      return viewConfig.topKeysPos - TEXT_MARGIN_BOTTOM;
    });

  g.append("g")
    .attr("class", "textYPos")
    .selectAll("line")
    .data(data)
    .join("line")
    .attr("x1", (d, i) => {
      return viewConfig.step + i * viewConfig.micoStep;
    })
    .attr("y1", viewConfig.topKeysPos - LINE_HEIGHT)
    .attr("x2", (d, i) => {
      return viewConfig.step + i * viewConfig.micoStep;
    })
    .attr("y2", viewConfig.topKeysPos)
    .attr("fill", "none")
    .attr("class", "dataLine")
    .attr("stroke", viewConfig.stroke)
    .attr("stroke-width", (d, i) => {
      return i % 6 ? 1 : 0;
    })
    .attr("stroke-linejoin", viewConfig.strokeLinejoin)
    .attr("stroke-linecap", viewConfig.strokeLinecap);
}

function drawSpecialText(svg, textData, viewConfig, isBottom = false) {
  const g = getG(svg, viewConfig);
  g.append("g")
    .selectAll("text")
    .data(textData)
    .join("text")
    .attr("style", function (d) {
      var eventType = d.value;
      var cfg = getEventConfig(eventType);
      var color = (cfg && cfg.disconnectCurve) ? "#409EFF" : (EVENT_COLOR_MAP[eventType] || "red");
      return "font-size: 14px;fill: " + color;
    })
    .attr("class", "mytext")
    .html(function (d) {
      var displayText = formatEventText(d);
      var chars = displayText.split("");
      return chars.map(function (ch, i) {
        return '<tspan dx="' + (i === 0 ? 0 : (Number(ch) ? -8 : -14)) + '" dy="' + (i === 0 ? 0 : 20) + '">' + ch + '</tspan>';
      }).join("");
    })
    .attr(
      "x",
      (d) => viewConfig.step + d.index * viewConfig.micoStep + textLeftMargin
    )
    .attr("y", function (d) {
      var displayText = formatEventText(d);
      var chars = displayText.split("");
      return isBottom
        ? viewConfig.bottomKeysPosStart - chars.length * LINE_HEIGHT - 6
        : viewConfig.topKeysPos + LINE_HEIGHT;
    });
}

// 格式化事件文本："事件名丨中文记录时间"
function formatEventText(d) {
  var eventType = d.value;
  if (!eventType) return "";
  var timeStr = d.recordTime || "";
  var cnTime = toChineseTime(timeStr);
  return cnTime ? eventType + "丨" + cnTime : eventType;
}

function setPointerEvent(g, pointerObj) {
  g.on("pointerenter", generatePointer(pointerObj))
    .on("pointerleave", pointerLeft(pointerObj.viewConfig))
    .on("pointermove", generatePointer(pointerObj));
}

function getDrawPath({ content, line, viewConfig, stroke = "blue" }) {
  content
    .append("path")
    .attr("class", "mylines")
    .attr("fill", "none")
    .attr("stroke", stroke)
    .attr("stroke-width", viewConfig.strokeWidth)
    .attr("stroke-linejoin", viewConfig.strokeLinejoin)
    .attr("stroke-linecap", viewConfig.strokeLinecap)
    .attr("d", line);
}

function isNumeric(value) {
  return !isNaN(parseFloat(value)) && !isNaN(value);
}

function generatePointer({ pathData, type, yScaleInstance, viewConfig }) {
  return (event) => {
    // 返回是相当与左上原点的坐标
    const [x] = d3.pointer(event);
    let micoStep = viewConfig.xScale.step();
    const index = Math.round((x - viewConfig.step - textLeftMargin) / micoStep);
    let val = viewConfig.xScale.domain()[index];
    const i = d3.bisectCenter(d3.range(pathData.length), val);
    const yPos =
      yScaleInstance(+pathData[i].value) + viewConfig.marginTop + HEAD_HEIGHT;
    viewConfig.tooltip
      .style("display", null)
      .attr("class", "myToolTip")
      .attr(
        "transform",
        `translate(${viewConfig.xScale(i) + viewConfig.micoStep},${yPos})`
      );
    const path = viewConfig.tooltip
      .selectAll("path")
      .data(["", ""])
      .join("path")
      .attr("fill", "white")
      .attr("stroke", "black");
    const text = viewConfig.tooltip
      .selectAll("text")
      .data(["", ""])
      .join("text")
      .call((text) =>
        text
          .selectAll("tspan")
          .data([`${type}: ${pathData[i].value}`, `${pathData[i].date}`])
          .join("tspan")
          .attr("x", 0)
          .attr("y", (_, i) => `${i * 1.2}em`)
          .attr("font-weight", (_, i) => (i ? null : "bold"))
          .text((d) => d)
      );

    const { y, width: w, height: h } = text.node().getBBox();
    console.log("width", w);
    console.log("height", h);
    text.attr("transform", `translate(${-w / 2},${15 - y})`);
    path.attr(
      "d",
      `M${-w / 2 - 20},5H-5l5,-5l5,5H${w / 2 + 20}v${h + 20}h-${w + 40}z`
    );
  };
}

function pointerLeft(viewConfig) {
  return (event) => {
    viewConfig.tooltip.style("display", "none");
  };
}

function getXPostion(data, viewConfig) {
  return (i) => viewConfig.xScale(data[i].index) + viewConfig.X_OFFSET;
}

function getYPosition(data, scale) {
  return (i) => (data[i].value ? scale(data[i].value) : 0);
}

function drawRoundIcon({
  content,
  data,
  x,
  y,
  fill = "blue",
  stroke = "blue",
  r = 5,
}) {
  content
    .append("g")
    .attr("fill", fill)
    .attr("stroke", stroke)
    .attr("stroke-width", 1)
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("transform", (i) => {
      const yValue = y(i) || 0;
      return !yValue ? "scale(0)" : "";
    })
    .attr("cx", x)
    .attr("cy", y)
    .attr("r", (i) => {
      if (y(i)) {
        return r;
      }
      return 0;
    });
}

function drawRoundDotIcon({
  content,
  data,
  x,
  y,
  fill = "white",
  stroke = "blue",
  deepFill = "blue",
  r = 6,
}) {
  content
    .append("g")
    .attr("fill", fill)
    .attr("stroke", stroke)
    .attr("stroke-width", 1)
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("transform", (i) => {
      const yValue = y(i) || 0;
      return !yValue ? "scale(0)" : "";
    })
    .attr("cx", x)
    .attr("cy", y)
    .attr("r", r)
    .clone()
    .attr("cx", x)
    .attr("cy", y)
    .attr("r", 1)
    .attr("fill", deepFill);
}

function drawThreeIcon({
  content,
  data,
  x,
  y,
  fill = "blue",
  stroke = "blue",
  riangle = 48,
}) {
  //  const triangle = d3.symbol().type
  content
    .append("g")
    .attr("class", "triangle")
    .selectAll("g")
    .data(data)
    .join("g")
    .attr("transform", (i) => {
      const yValue = y(i) || 0;
      return !yValue ? "scale(0)" : `translate(${x(i)},${yValue})`;
    })
    .append("path")
    .call((path) => {
      path
        .attr("d", d3.symbol(d3.symbolTriangle, riangle))
        .attr("fill", fill)
        .attr("stroke", stroke);
    });
}

function drawXIcon({ content, data, x, y, fill = "blue", stroke = "blue" }) {
  content
    .append("g")
    .attr("fill", fill)
    .attr("stroke", stroke)
    .attr("stroke-width", 1)
    .selectAll("line")
    .data(data)
    .join("line")
    .attr("transform", (i) => {
      let yVal = y;
      if (typeof y === "function") {
        yVal = y(i) || 0;
      }
      if (!yVal) {
        return "scale(0)";
      }
      return "";
    })
    .attr("x1", function (d) {
      return x(d) - 4;
    })
    .attr("y1", function (d) {
      return y(d) - 4;
    })
    .attr("x2", function (d) {
      return x(d) + 4;
    })
    .attr("y2", function (d) {
      return y(d) + 4;
    })
    .clone()
    .attr("x1", function (d) {
      return x(d) + 4;
    })
    .attr("y1", function (d) {
      return y(d) - 4;
    })
    .attr("x2", function (d) {
      return x(d) - 4;
    })
    .attr("y2", function (d) {
      return y(d) + 4;
    });
}
function getTypeValue(type, allData = [], isNumber = true) {
  return allData.filter((item) => item.typeCode == type || null);
}

function downloadPNG(svgElement) {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = function () {
    const canvas = document.createElement("canvas");
    canvas.width = svgElement.clientWidth;
    canvas.height = svgElement.clientHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    // 触发打印
    const dataUrl = canvas.toDataURL("image/png");
    const win = window.open("");
    win.document.write(`<img src="${dataUrl}" onload="window.print();window.close()">`);
  };
  img.src = url;
}

// HH:mm → 中文时分（如 "10:22" → "十时二十二分"）
function toChineseTime(timeStr) {
  if (!timeStr) return "";
  var parts = String(timeStr).split(":");
  if (parts.length < 2) return "";
  var h = parseInt(parts[0], 10);
  var m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return "";
  var cn = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  function numCN(n) {
    if (n === 0) return "";
    if (n <= 10) return cn[n];
    if (n < 20) return "十" + (n % 10 ? cn[n % 10] : "");
    if (n < 100) return cn[Math.floor(n / 10)] + "十" + (n % 10 ? cn[n % 10] : "");
    return String(n);
  }
  var result = numCN(h) + "时";
  if (m > 0) result += numCN(m) + "分";
  return result;
}

// 查找事件配置（是否需要时间、是否断开曲线等）
function getEventConfig(eventType) {
  var events = TEMPLATE_CONFIG.events || [];
  return events.find(function (e) { return e.type === eventType; }) || {};
}
