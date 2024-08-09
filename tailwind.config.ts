import type { Config } from 'tailwindcss'
import daisyui from "daisyui"

export default <Partial<Config>>{
    theme: {
        fontFamily: {
            Zeyada: ['Zeyada', 'sans-serif'],
        },
        extend: {}
    },
    plugins: [
        daisyui,
    ],
    daisyui: {
        themes: ["dracula"],
    },
}
