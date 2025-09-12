import { FunctionalComponent, h } from '@stencil/core'


interface HelloProps {
    name: String
}

export const Hello: FunctionalComponent<HelloProps> = ({ name }) => {
    return <h1>hello world, {name}</h1>
}