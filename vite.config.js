import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
	base: "/BrainComb/",
	build: {
		minify: false
	},
	plugins: [
		vue()
	],
})
