# Create package.json with 2025 dependencies
package_json = {
    "name": "research-wrapper",
    "private": True,
    "version": "0.1.0",
    "type": "module",
    "scripts": {
        "dev": "vite",
        "build": "tsc && vite build", 
        "preview": "vite preview",
        "test": "vitest",
        "test:ui": "vitest --ui",
        "test:browser": "vitest --browser",
        "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
        "lint:fix": "eslint . --ext ts,tsx --fix"
    },
    "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "@tanstack/react-query": "^5.51.23",
        "zustand": "^4.5.4", 
        "react-hook-form": "^7.52.1",
        "@hookform/resolvers": "^3.9.0",
        "zod": "^3.23.8",
        "openai": "^4.52.7",
        "browser-fs-access": "^0.35.0",
        "docx": "^8.5.0",
        "pdf-lib": "^1.17.1",
        "markdown-it": "^14.1.0",
        "lucide-react": "^0.411.0",
        "class-variance-authority": "^0.7.0",
        "clsx": "^2.1.1",
        "tailwind-merge": "^2.4.0"
    },
    "devDependencies": {
        "@types/react": "^18.3.3",
        "@types/react-dom": "^18.3.0",
        "@typescript-eslint/eslint-plugin": "^7.15.0",
        "@typescript-eslint/parser": "^7.15.0",
        "@vitejs/plugin-react": "^4.3.1",
        "vitest": "^2.0.4",
        "@vitest/browser": "^2.0.4",
        "@vitest/ui": "^2.0.4",
        "@testing-library/react": "^16.0.0",
        "@testing-library/jest-dom": "^6.4.8",
        "@testing-library/user-event": "^14.5.2",
        "jsdom": "^24.1.1",
        "playwright": "^1.45.3",
        "typescript": "^5.2.2",
        "vite": "^5.3.4",
        "eslint": "^8.57.0",
        "eslint-plugin-react-hooks": "^4.6.2",
        "eslint-plugin-react-refresh": "^0.4.7",
        "autoprefixer": "^10.4.19",
        "postcss": "^8.4.40",
        "tailwindcss": "^3.4.7"
    }
}

# Save package.json
import json
with open("package.json", "w") as f:
    json.dump(package_json, f, indent=2)

print("PACKAGE.JSON CREATED")
print("=" * 50)
print("Key dependencies for 2025:")
print("• React 18 (stable, React 19 optional)")
print("• TanStack Query v5 (server state)")
print("• Zustand v4 (client state)")
print("• React Hook Form v7 + Zod (forms)")
print("• Vite v5 + Vitest v2 (build & test)")
print("• TypeScript 5.2+ (type safety)")
print("• Tailwind CSS (styling)")
print("• OpenAI SDK v4 (API integration)")
print("• pdf-lib (PDF generation)")
print("• docx (Word generation)")
print("• browser-fs-access (file system compatibility)")

print(f"\nPackage.json saved to: package.json")