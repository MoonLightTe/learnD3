function isSupportObjectFit() {
    return document.documentElement.style.objectFit !== undefined
}

const objectFitEnum = {
    NONE: 'none',
    CONTAIN: 'contain',
    COVER: 'cover',
    FILL: 'fill',
    SCALE_DOWN: 'scale-down',
}



export function objectFitPolyfill({ fit, imageHeight, imageWidth, element }) {
    console.log("🚀 ~ objectFitPolyfill ~ image:", image)
    const { clientWidth: containerWidth, clientHeight: containerHeight } = element
    let _fit = fit
    if (!imageHeight || !imageWidth || !containerHeight || !containerWidth) return
    const imageAspectRatio = imageWidth / imageHeight
    const containerAspectRatio = containerWidth / containerHeight
    // fill 默认值 即就是容器的大小
    if (fit === objectFitEnum.SCALE_DOWN) {
        // 选none 和 contain 比较小的一个
        //  container 保持原比例 一定完整显示 
        //  none 就是图片大小
        const isSmaller = imageWidth < containerWidth && imageHeight < containerHeight
        _fit = isSmaller ? objectFitEnum.NONE : objectFitEnum.CONTAIN
    }
    let baseObj = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%)`
    }
    switch (_fit) {
        case objectFitEnum.NONE:
            return {
                ...baseObj,
                width: 'auto',
                height: 'auto'
            }
        case objectFitEnum.COVER:
            return imageAspectRatio > containerAspectRatio ? {
                ...baseObj,
                width: 'auto'
            } : {
                ...baseObj,
                height: 'auto'
            }
        case objectFitEnum.CONTAIN:
            return imageAspectRatio > containerAspectRatio ? {
                ...baseObj,
                height: 'auto'
            } : {
                ...baseObj,
                width: 'auto'
            }
        default:
            return {}
    }
}