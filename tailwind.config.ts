import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: '#1E40AF', // Example primary color
        secondary: '#FBBF24', // Example secondary color
        background: '#F3F4F6', // Example background color
        surface: '#FFFFFF', // Example surface color
      },
      borderRadius: {
        'lg': '16px',
      },
      boxShadow: {
        'default': '0 1px 2px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
export default config;
