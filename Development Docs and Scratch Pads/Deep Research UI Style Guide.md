# Deep Research UI Style Guide

This style guide documents the visual and component standards for the Deep Research App, based on the deep_research_job_config.jsx reference. Use this as the single source of truth for UI consistency.

---

## 1. Color Palette

| Purpose            | Tailwind Class         | Example/Notes                |
|--------------------|-----------------------|------------------------------|
| Primary BG (main)  | `bg-slate-50`         | App background               |
| Card BG            | `bg-white`            | All cards/containers         |
| Sidebar BG         | `bg-slate-900`        | Sidebar, text: `text-white`  |
| Section BG         | `bg-slate-100`        | Prompt display, muted areas  |
| Accent (valid)     | `bg-emerald-400`      | Validation dots, spinner     |
| Accent (error)     | `bg-red-500`/`600`    | Validation dots, errors      |
| Accent (success)   | `text-emerald-600`    | Success messages             |
| Muted Text         | `text-slate-500`      | Subtext, hints               |

---

## 2. Typography

| Element         | Tailwind Classes                | Notes                        |
|-----------------|--------------------------------|------------------------------|
| Main Header     | `text-xl font-semibold`         | App/page titles              |
| Section Header  | `text-2xl font-semibold`        | Card/section titles          |
| Card Title      | `text-xl font-semibold mb-2`    |                              |
| Label           | `text-sm font-medium mb-2`      | Form labels                  |
| Body Text       | `text-base`                     |                              |
| Muted Text      | `text-slate-500`                | Subtext, hints               |
| Error Text      | `text-red-600 text-sm`          | Inline errors                |
| Success Text    | `text-emerald-600 text-sm`      | Inline success               |

---

## 3. Spacing & Layout

| Element         | Tailwind Classes                        | Notes                        |
|-----------------|----------------------------------------|------------------------------|
| App BG          | `min-h-screen bg-slate-50`             | Root container               |
| Card            | `bg-white shadow rounded-lg p-6`       | All main cards/sections      |
| Card Container  | `max-w-2xl mx-auto space-y-4`          | Centered, vertical spacing   |
| Sidebar         | `w-56 bg-slate-900 text-white p-4 space-y-4` | Fixed width, vertical nav   |
| Main Content    | `p-6 space-y-6`                        | Padding, vertical spacing    |
| Form Section    | `space-y-6`                            | Between form fields          |
| Input           | `w-full p-3 border rounded-lg bg-slate-50` | All inputs, selects, textareas |
| Button          | `w-full` (for full width), `font-bold` | Primary actions              |

---

## 4. Reusable Patterns & Components

### Header
- `sticky top-0 z-10 bg-slate-50 border-b flex h-16 items-center justify-between px-6`
- Includes app title, Run button, dark mode, and settings.

### Sidebar
- Vertical stepper: `flex items-center gap-2 cursor-pointer`
- Validation dot: `h-3 w-3 rounded-full bg-emerald-400` (valid) or `bg-red-500` (invalid)
- Active step: `font-bold`, inactive: `opacity-75`

### Card
- `bg-white shadow rounded-lg p-6 max-w-2xl mx-auto space-y-4`
- Section header: `text-xl font-semibold mb-2`

### Form Controls
- Label: `block text-sm font-medium mb-2`
- Input/Textarea/Select: `w-full p-3 border rounded-lg bg-slate-50`
- Error: `text-red-600 text-sm mt-1`
- Success: `text-emerald-600 text-sm mt-2`

### Buttons
- Primary: `font-bold`, use accent color if needed
- Disabled: `opacity-50 cursor-not-allowed`
- Spinner: `animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-400`

### Status & Feedback
- Success: `text-emerald-600`
- Error: `text-red-600`
- Muted: `text-slate-500`

---

## 5. Example Card Structure

```jsx
<div className="bg-white shadow rounded-lg p-6 max-w-2xl mx-auto space-y-4">
  <h2 className="text-xl font-semibold mb-2">Section Title</h2>
  <form className="space-y-6">
    <div>
      <label className="block text-sm font-medium mb-2">Label</label>
      <input className="w-full p-3 border rounded-lg bg-slate-50" />
      <p className="text-red-600 text-sm mt-1">Error message</p>
    </div>
    <Button className="w-full font-bold">Submit</Button>
  </form>
</div>
```

---

## 6. Responsiveness
- On mobile, sidebar collapses to a top bar or drawer.
- Run button remains sticky at the bottom on mobile.
- Use `max-w-*` and `mx-auto` for centered cards.

---

This guide ensures all components and pages maintain a cohesive, modern, and user-friendly appearance, closely mirroring the deep_research_job_config.jsx reference. Use these patterns and classes for any new features or further refinements. 