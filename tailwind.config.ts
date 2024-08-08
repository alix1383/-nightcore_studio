import type { Config } from 'tailwindcss'
import daisyui from "daisyui"

export default <Partial<Config>>{
    theme: {
        extend: {}
    },
    plugins: [
        daisyui,
    ],
}
