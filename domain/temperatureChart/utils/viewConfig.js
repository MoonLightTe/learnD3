import { bodyTemperature, TOP_KEYS, BOTTOM_KEYS, HEAD_HEIGHT, LINE_HEIGHT} from "../const/index"


export default class viewConfig {
  constructor ({
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    marginTop = 20, // top margin, in pixels
    marginRight = 20, // right margin, in pixels
    marginBottom = 50, // bottom margin, in pixels
    marginLeft = 30, // left margin, in pixels
    stroke = 'currentColor', // stroke color of line and dots
    strokeWidth = 2, // stroke width of line and dots
    strokeLinecap = 'round', // stroke line cap of line
    strokeLinejoin = 'round', // stroke line join of line
    renderData
  } = {}) {
    // 基础配置赋值
    this.width = width
    this.stroke = stroke
    this.strokeWidth = strokeWidth
    this.strokeLinecap = strokeLinecap
    this.renderData = renderData
    this.strokeLinejoin = strokeLinejoin
    this.marginRight = marginRight
    this.marginLeft = marginLeft
    this.marginBottom = marginBottom
    this.marginTop = marginTop
    // 计算属性赋值
    this.contentWidth = width - marginLeft - marginRight
    this.step = this.contentWidth / 8

    // 先计算不受 height 影响的布局量
    const { micoStep, verticalHeight } = this.utilsGetMicoPos(this.step, 0)
    this.micoStep = micoStep
    this.verticalHeight = verticalHeight
    this.X_OFFSET = micoStep / 2
    this.xRange = [this.step, width - marginLeft - marginRight]
    this.topPos = marginTop + HEAD_HEIGHT
    this.topKeysPos = LINE_HEIGHT * (TOP_KEYS.length + 1)
    this.bottomKeysPosStart = this.topKeysPos + verticalHeight
    this.yRange = [this.bottomKeysPosStart, this.topKeysPos]

    // 动态计算 height：确保 tableHeight 覆盖所有底部数据行
    const bottomEnd = this.bottomKeysPosStart + (BOTTOM_KEYS.length + 5) * LINE_HEIGHT
    this.height = Math.max(height, bottomEnd + marginBottom + HEAD_HEIGHT)

    this.bottomPos = this.height - HEAD_HEIGHT - marginTop - (marginBottom - 30)
    this.tableHeight = this.height - marginBottom - HEAD_HEIGHT
  }

  // 获取折线区域的高度
  utilsGetMicoPos (step, botpos) {
    const micoStep = (step * 7) / 42 // 折线小格子的宽度
    const verticalLength = bodyTemperature[1] - bodyTemperature[0] // 根据体温来计算格子
    const verticalHeight = micoStep * 5 * verticalLength
    return {
      micoStep,
      verticalHeight
    }
  }
}