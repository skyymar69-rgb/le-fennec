import type { Config } from "tailwindcss";
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dz: { green:'#006233', green2:'#00874A', red:'#D21034' },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT:'hsl(var(--primary))', foreground:'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT:'hsl(var(--secondary))', foreground:'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT:'hsl(var(--muted))', foreground:'hsl(var(--muted-foreground))' },
        accent: { DEFAULT:'hsl(var(--accent))', foreground:'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT:'hsl(var(--destructive))', foreground:'hsl(var(--destructive-foreground))' },
        card: { DEFAULT:'hsl(var(--card))', foreground:'hsl(var(--card-foreground))' },
        border:'hsl(var(--border))', input:'hsl(var(--input))', ring:'hsl(var(--ring))',
      },
      fontFamily: { sans:['Inter','sans-serif'], arabic:['Cairo','sans-serif'] },
      borderRadius: { lg:'var(--radius)', md:'calc(var(--radius) - 2px)', sm:'calc(var(--radius) - 4px)' },
      keyframes: {
        'fade-up':{ '0%':{opacity:'0',transform:'translateY(10px)'},'100%':{opacity:'1',transform:'translateY(0)'} },
        'accordion-down':{ from:{height:'0'}, to:{height:'var(--radix-accordion-content-height)'} },
        'accordion-up':{ from:{height:'var(--radix-accordion-content-height)'}, to:{height:'0'} },
      },
      animation: {
        'fade-up':'fade-up 0.35s ease-out',
        'accordion-down':'accordion-down 0.2s ease-out',
        'accordion-up':'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
