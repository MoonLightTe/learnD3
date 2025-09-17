export class BEM {
    #namespace
    #elementSeparator
    #modifierSeparator
    #statePrefix
    #block

    constructor(
        block,
        {
            namespace = 'yue',
            elementSeparator = '__',
            modifierSeparator = '--',
            statePrefix = 'is-'
        } = {}
    ) {
        if (!block) throw new Error('BEM: block name is required')

        this.#namespace = namespace
        this.#elementSeparator = elementSeparator
        this.#modifierSeparator = modifierSeparator
        this.#statePrefix = statePrefix
        this.#block = `${this.#namespace}-${block}`
    }

    /** Block */
    B() {
        return this.#block
    }

    /** Element */
    E(element) {
        if (!element) throw new Error('BEM: element name is required')
        return `${this.#block}${this.#elementSeparator}${element}`
    }

    /** Modifier for Block */
    M(modifier) {
        if (!modifier) throw new Error('BEM: modifier name is required')
        return `${this.#block}${this.#modifierSeparator}${modifier}`
    }

    /** Modifier for Element */
    EM(element, modifier) {
        if (!element || !modifier) throw new Error('BEM: element & modifier are required')
        return `${this.E(element)}${this.#modifierSeparator}${modifier}`
    }

    /** State class */
    S(state) {
        if (!state) throw new Error('BEM: state name is required')
        return `${this.#statePrefix}${state}`
    }
}
