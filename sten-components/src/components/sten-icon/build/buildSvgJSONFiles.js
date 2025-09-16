const { resolve, extname, basename } = require('path');
const fs = require('fs')
const { optimize } = require('svgo');
const svgson = require("svgson")
console.log("🚀 ~ svgson:", svgson)


console.log('__dirname', __dirname)

const entryDir = resolve(__dirname, '../svgs')
const outDir = resolve(__dirname, '../icons')
const outDirEsm = resolve(__dirname, '../icons_esm')
const svgoPlugins = [
    {
        name: 'convertColors',
        params: { currentColor: /^(?!url|none)./ },
    },
    {
        name: 'cleanupListOfValues',
        active: true,
    },
    {
        name: 'removeStyleElement',
        active: true,
    },
    {
        name: 'removeViewBox',
        active: false,
    },
    {
        name: 'removeDimensions',
        active: true,
    },
];

const translateSvg = (svgString, svgName) => {
    return new Promise((resolve, reject) => {
        try {
            const result = optimize(svgString, {
                plugins: svgoPlugins
            })
            const formatJson = svgson.parse(svgName.slice(-2) === '-c' ? svgString : result.data, {})
            resolve(formatJson)
        } catch (error) {
            reject(error)
        }
    })
}

const formatName = (svgName) => {
    return svgName.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}



async function build(entryDir, outDir, outDirEsm, prefix, suffix) {
    if (fs.existsSync(outDir)) fs.rmdirSync(outDir, { recursive: true });
    if (fs.existsSync(outDirEsm)) fs.rmdirSync(outDirEsm, { recursive: true });
    fs.mkdirSync(outDirEsm);
    fs.mkdirSync(outDir);
    const files = fs.readdirSync(entryDir, 'utf-8')
    const indexFileName = 'index.js'
    // 首先我需要
    const batches = files.filter((f) => extname(f) === '.svg').map(async (file) => {
        try {
            const filePath = resolve(entryDir, file)
            const svgString = fs.readFileSync(filePath, 'utf-8')
            const tagName = basename(file, '.svg')
            const svgName =formatName(tagName)
            console.log("🚀 ~ build ~ svgName:", svgName)
            const jsonFileName = `${svgName}.js`
            let JSONCode = await translateSvg(svgString, svgName);
            JSONCode._name = tagName
            let _JSONCode = `exports.default=${JSON.stringify(JSONCode)}`
            fs.writeFileSync(resolve(outDir, jsonFileName), _JSONCode, 'utf-8')
            let _JSONCode_esm = `export default ${JSON.stringify(JSONCode)}`;
            fs.writeFileSync(resolve(outDirEsm, jsonFileName), _JSONCode_esm, 'utf-8')
            return { fileName: jsonFileName, svgName }
        } catch (error) {
            console.log("🚀 ~ build ~ error:", error)
            throw error

        }
    })
    const arr = await Promise.all(batches);
    console.log("🚀 ~ build ~ arr:", arr)
    const indexFileContent = arr.map((a) => `exports.${a.svgName} = require('./${a.svgName}').default`).join("\n")
    const indexFileContent_esm = arr.map((a) => `export { default as ${a.svgName} } from './${a.svgName}';`).join("\n")
    fs.writeFileSync(resolve(outDir, indexFileName), indexFileContent, 'utf-8')
    fs.writeFileSync(resolve(outDirEsm, indexFileName), indexFileContent_esm, 'utf-8')
}

build(entryDir, outDir, outDirEsm, 'icon', '')