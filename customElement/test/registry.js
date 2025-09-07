class HelloWorld extends HTMLElement {
    constructor() {
        super()
        // 不开启 shadow hostr
        const shadowRoot = this.attachShadow({ mode: 'open' })

        // const div = document.createElement('div')
        // const style = document.createElement('style')
        // style.innerHTML = `h1 {
        //                     display: block;
        //                     padding: 10px;
        //                     background-color: #eee;
        //                 }`
        // div.innerHTML = `
        //             <h1>Hello World! 自定义组件内部</h1>
        //         `;
        // this.appendChild(style);
        // this.appendChild(div);
        // this.shadowRoot.innerHTML = `
        // <style>
        // :host{
        // display: block;
        // padding: 10px;
        // background-color: #eee;
        // }
        // h1{
        // color: red;
        // }
        // </style>
        // <h1>
        // hello world！
        // </h1>
        // `
        shadowRoot.appendChild(document.getElementById('hw').content.cloneNode(true));
    }
    // 1. 当自定义元素首次被渲染到文档时间调用
    connectedCallback() {
        console.log('1111')
    }
    //  2. 当自定义元素首次被渲染到文档时间调用
    disconnectedCallback() {
        console.log('baybay')
    }
    // 3. 当自定义元素被移动到新的文档时调用
    adoptedCallback() {

    }
    // 4. 当自定义元素的属性更改时调用
    attributeChangedCallback() {
        console.log('changed',)
    }

    say(something) {
        console.log('This is hello-world tag.')
    }
}

window.customElements.define('hello-world', HelloWorld)