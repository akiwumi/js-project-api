Design System — frontend/design-system
=====================================

This small design system includes tokens, global CSS variables, and a few React components inspired by the attached UI mockup (clean chat layout, soft shadows, rounded cards, teal accent).

Files
- `tokens/` — color and typography token JSON
- `styles/` — CSS variables and base styles
- `components/` — lightweight React components: `Button`, `Avatar`, `Sidebar`, `ChatWindow`
- `index.js` — exports components and imports styles

Quick usage

1. Import the CSS once in your app (or include `design-system/styles/design-system.css`).

2. Use components:

```jsx
import { Button, Avatar, Sidebar, ChatWindow } from './design-system';
import './design-system/styles/design-system.css';

<Button variant="primary">Send</Button>
```

Notes
- Keep this folder in your frontend; adapt tokens to your global build (CSS-in-JS or SASS) as needed.
