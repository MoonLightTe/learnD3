const icons = require('../src/components/sten-icon/icons/index')
console.log("🚀 ~ icons:", icons)
const transformTemp = require('./iconTemplate').transformTemp
const transformIconsTemp = require('./iconsComponentTemplate').translateFromTempComponents
const { resolve } = require('path')
const fs = require('fs')

const outDir = resolve(__dirname, '../src/components/icons')
const outDirIcons = resolve(__dirname, '../src/components/sten-icon')

async function build() {
    if (fs.existsSync(outDir)) {
        fs.rmdirSync(outDir, { recursive: true })
    }

    fs.mkdirSync(outDir)
    if (icons && Object.keys(icons).length) {
        Object.keys(icons).forEach(key => {
            console.log(key);
            const jsonFileName = `sten-icon-${icons[key]._name}.tsx`;
            let temp = transformTemp(icons[key], key);
            console.log("🚀 ~ build ~ temp:", temp)
            // const formattedCode = prettier.format(temp, prettierConfig);
            fs.writeFileSync(resolve(outDir, jsonFileName), temp, 'utf-8');
        });

        let iconsTemp = transformIconsTemp(Object.keys(icons), icons);
        // const formattedCodeCom = prettier.format(iconsTemp, prettierConfig);
        fs.writeFileSync(resolve(outDirIcons, 'sten-icons.tsx'), iconsTemp, 'utf-8');
    }
}

build()
