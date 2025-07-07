# Create a comprehensive project structure and implementation guide
import json

project_structure = {
    "root": {
        "package.json": "Main dependencies and scripts",
        "vite.config.ts": "Vite configuration with testing setup",
        "tsconfig.json": "TypeScript configuration",
        ".env.example": "Environment variable template",
        ".env.local": "Local environment variables (gitignored)",
        ".gitignore": "Git ignore patterns",
        "README.md": "Project documentation"
    },
    "src": {
        "main.tsx": "Application entry point",
        "App.tsx": "Root component with providers",
        "vite-env.d.ts": "Vite type definitions",
        "components": {
            "ui": "Reusable UI components (shadcn/ui style)",
            "layout": "Layout components (Header, Sidebar, etc.)",
            "forms": "Form components with validation"
        },
        "modules": {
            "prompt-builder": {
                "components": "Prompt builder specific components",
                "hooks": "Custom hooks for prompt management",
                "types": "TypeScript types",
                "utils": "Utility functions"
            },
            "agent-runner": {
                "components": "Research execution components",
                "hooks": "Streaming and execution hooks",
                "types": "API response types",
                "services": "OpenAI API integration"
            },
            "results-viewer": {
                "components": "Results display components",
                "hooks": "Results management hooks",
                "types": "Results data types"
            },
            "export-sync": {
                "components": "Export UI components",
                "services": "Export logic (PDF, DOCX, etc.)",
                "integrations": "Notion, Obsidian integrations"
            },
            "task-log": {
                "components": "Task history components",
                "hooks": "Local storage management",
                "types": "Task data types"
            }
        },
        "lib": {
            "api": "API client configurations",
            "storage": "File system access utilities",
            "utils": "Shared utility functions",
            "constants": "Application constants",
            "types": "Global TypeScript types"
        },
        "hooks": "Global custom hooks",
        "store": "Zustand store definitions",
        "styles": "Global CSS and theme files"
    },
    "tests": {
        "setup.ts": "Test setup and configuration",
        "__mocks__": "Mock implementations",
        "integration": "Integration tests",
        "unit": "Unit tests",
        "e2e": "End-to-end tests (if needed)"
    },
    "public": {
        "index.html": "HTML template",
        "manifest.json": "PWA manifest (if needed)"
    }
}

# Generate the project structure tree
def generate_tree(structure, prefix="", is_last=True):
    """Generate a tree representation of the project structure"""
    tree_lines = []
    
    if isinstance(structure, dict):
        items = list(structure.items())
        for i, (key, value) in enumerate(items):
            is_last_item = i == len(items) - 1
            current_prefix = "└── " if is_last_item else "├── "
            tree_lines.append(f"{prefix}{current_prefix}{key}")
            
            if isinstance(value, dict):
                next_prefix = prefix + ("    " if is_last_item else "│   ")
                tree_lines.extend(generate_tree(value, next_prefix, is_last_item))
            elif isinstance(value, str):
                tree_lines.append(f"{prefix}{'    ' if is_last_item else '│   '}└── {value}")
    
    return tree_lines

print("PROJECT STRUCTURE")
print("=" * 50)
print("research-wrapper/")
tree = generate_tree(project_structure)
for line in tree:
    print(line)

# Save the structure
with open("project_structure.json", "w") as f:
    json.dump(project_structure, f, indent=2)

print(f"\nProject structure saved to: project_structure.json")