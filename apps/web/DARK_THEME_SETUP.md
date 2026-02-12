# Uniform Dark Theme Setup for FlyonUI + Tailwind CSS

This project uses a **uniform dark theme** with a consistent `#1a1a1a` background color throughout the entire application.

## 🎨 Theme Philosophy

Unlike traditional dark themes that use varying shades of gray/blue, this implementation uses a single, uniform dark background (`#06051d`) for all components, creating a cohesive and modern appearance.

## ✅ Features

- **Uniform Background**: All components use the same `#06051d` background in dark mode
- **Automatic Theme Detection**: Detects system preferences on first load
- **Persistent Theme**: Saves user's theme choice in localStorage
- **No FOUC**: Flash prevention with inline script in HTML
- **Smooth Transitions**: 0.2s ease transitions between theme changes
- **Theme Toggle**: Sun/moon icon button in navbar

## 📁 File Structure

```
apps/web/
├── src/
│   ├── hooks/
│   │   └── useTheme.ts          # Theme management hook
│   ├── components/
│   │   ├── ThemeToggle.tsx      # Toggle button component
│   │   └── DarkThemeDemo.tsx    # Demo of themed components
│   └── index.css                # Theme CSS variables & overrides
├── tailwind.config.js           # Tailwind & FlyonUI configuration
└── index.html                   # FOUC prevention script
```

## 🎯 Color Scheme

### Light Theme
```css
Background:  #ffffff
Text:        #1f2937
Secondary:   #6b7280
```

### Dark Theme (Uniform)
```css
Background:  #06051d  /* Same everywhere */
Text:        #e5e5e5
Secondary:   #a0a0a0
```

### Accent Colors (Both Themes)
```css
Primary:     #6366f1  (Indigo)
Secondary:   #7c3aed  (Darker Purple)
Accent:      #f59e0b  (Amber)
Success:     #22c55e  (Green)
Warning:     #fbbd23  (Yellow)
Error:       #ef4444  (Red)
```

## 🚀 Quick Start

### 1. Using the Theme Toggle

The theme toggle is already integrated into the navbar:

```tsx
import { ThemeToggle } from "../components/ThemeToggle";

// Already added to Navbar component
<ThemeToggle />
```

### 2. Using the useTheme Hook

```tsx
import { useTheme } from "../hooks/useTheme";

function MyComponent() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
      {isDark && <p>Uniform dark mode is active!</p>}
    </div>
  );
}
```

### 3. Styling Components for Dark Theme

All FlyonUI components automatically work with the uniform dark theme:

```tsx
// Cards - automatically uniform dark
<div className="card bg-base-100">
  <div className="card-body">
    <h2 className="card-title text-base-content">Title</h2>
    <p className="text-base-content/70">Content</p>
  </div>
</div>

// Buttons - colored accents on dark
<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary">Secondary</button>

// Forms - dark inputs with subtle borders
<input className="input input-bordered" />
<select className="select select-bordered" />
<textarea className="textarea textarea-bordered" />

// Alerts
<div className="alert alert-info">
  <span>Info message</span>
</div>
```

## 🔧 Technical Implementation

### 1. Tailwind Configuration (`tailwind.config.js`)

```javascript
flyonui: {
  themes: [
    {
      dark: {
        "base-100": "#06051d",  // Uniform background
        "base-200": "#06051d",  // Same as base-100
        "base-300": "#06051d",  // Same as base-100
        "base-content": "#e5e5e5",
        // ... accent colors
      },
    },
  ],
}
```

### 2. CSS Overrides (`index.css`)

Comprehensive CSS rules ensure ALL elements use the uniform background:

```css
/* Force uniform dark background */
:root.dark body,
:root.dark #root,
:root.dark main,
:root.dark .navbar,
:root.dark .drawer,
:root.dark .card {
  background-color: #06051d !important;
}

/* All base-* classes use same color */
:root.dark [class*="bg-base-"] {
  background-color: #06051d !important;
}
```

### 3. FOUC Prevention (`index.html`)

Inline script runs before page renders:

```html
<script>
  (function () {
    const theme = localStorage.getItem("theme") || 
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute("data-theme", theme);
  })();
</script>
```

### 4. Theme Hook (`useTheme.ts`)

Manages theme state with localStorage persistence:

```typescript
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, toggleTheme, isDark: theme === "dark" };
}
```

## 🎨 Best Practices

### ✅ DO:

```tsx
// Use semantic classes that adapt to theme
<div className="bg-base-100 text-base-content">
  
// Use opacity for subtle elements
<p className="text-base-content/70">Secondary text</p>

// Use borders for visual separation in uniform dark
<div className="border border-base-content/10">
```

### ❌ DON'T:

```tsx
// Don't use hardcoded colors
<div style={{ backgroundColor: "#ffffff" }}>

// Don't use multiple shades manually
<div className="bg-gray-800">  // Use bg-base-100 instead

// Don't fight the uniform theme
<div className="bg-gray-900 dark:bg-gray-800">  // Not needed
```

## 🎭 Visual Separation in Uniform Dark

Since everything uses the same background, use these techniques for visual hierarchy:

### 1. Borders
```tsx
<div className="border border-base-content/10">
```

### 2. Subtle Shadows
```tsx
<div className="shadow-lg">
```

### 3. Accent Colors
```tsx
<div className="border-l-4 border-primary">
```

### 4. Opacity Variations
```tsx
<div className="bg-base-content/5">  {/* Very subtle highlight */}
```

## 🧪 Testing

The demo component (`DarkThemeDemo.tsx`) showcases all themed elements:

- Buttons (all variants)
- Cards with borders
- Alerts (info, success, warning, error)
- Badges
- Form elements
- Progress bars
- Loading indicators
- Stats components

## 🐛 Troubleshooting

### Component has different background color
- Check if component has inline styles overriding the theme
- Ensure `!important` rules in `index.css` are loading
- Clear browser cache and rebuild

### Theme not persisting
- Check browser console for localStorage errors
- Verify `useTheme` hook is called at app root level

### Flash of wrong theme on load
- Ensure inline script in `index.html` is in `<head>`
- Script must run before body content renders

### Text not readable
- Ensure using `text-base-content` class, not hardcoded colors
- Check contrast ratios (should be 4.5:1 minimum)

## 📝 Summary

Your application now features a **uniform dark theme** where:

- ✅ All backgrounds are `#06051d` in dark mode
- ✅ No varying shades of gray/blue/slate
- ✅ Clean, modern, consistent appearance
- ✅ Visual hierarchy through borders and accent colors
- ✅ Smooth transitions between light and dark
- ✅ Toggle button in navbar for easy switching

Toggle the theme and enjoy the cohesive dark experience! 🌙