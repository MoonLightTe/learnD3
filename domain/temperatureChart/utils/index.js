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
} from "../const/index";
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
  //第一步处理数据
  const groupData = groupTemperatureData(data);
  Reflect.set(options, "renderData", groupData);
  const chart = ConnectedScatterplot(options);
  document.getElementById("temperatureChart").appendChild(chart);
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
  viewConfig.renderData.datasetHeartRate.forEach((item) => {
    drawHeartRate(svg, item, viewConfig);
  });
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
        // 加5的目的是视觉看起来对齐
        return viewConfig.topKeysPos + viewConfig.micoStep * 5 * i + 5;
      });
  });
}
function drawBgLine(svg, viewConfig) {
  const g = getG(svg, viewConfig);
  // 绘制横线
  const horizontalLength = (bodyTemperature[1] - bodyTemperature[0]) * 5 + 1;
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
  console.log("🚀 ~ drawHeartRate ~ pathData:", pathData);
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
  return (i) => scale(data[i].value ? data[i].value : 0);
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
  console.log("🚀 ~ drawRoundIcon ~ content:", content);
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
      console.log("🚀 ~ drawRoundIcon ~ yValue:", yValue);
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
