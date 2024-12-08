/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{vue,js}"
	],
	theme: {
		extend: {
			colors: {
				"bg": "var(--color-bg)",
				"bg-alt": "var(--color-bg-alt)",
				"accent": "var(--color-accent)",
				"text": "var(--color-text)",
			}
		},
	},
	plugins: [],
}

