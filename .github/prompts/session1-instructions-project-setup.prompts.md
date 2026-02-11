# Session 1: Instructions & Project Setup

## Prompt 1: Fix Copilot instructions

```
Fix my GitHub Copilot instructions in the #file:instructions directory. Fix the applyTo section. See https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions#creating-path-specific-custom-instructions-1 and update format since Copilot does not support patterns like {css,scss,module.css}
```

## Prompt 2: Suggest project structure

```
Suggest a good project structure. The repository will store both backend API and frontend. The backend is a .NET minimal API; the frontend is a SPA with React and TypeScript.
```

## Prompt 3: Proceed with setup

```
Ok, proceed with:
1. Create a simple generic .github/copilot-instructions.md and store the structure there.
2. Update the paths in applyTo in the custom path-specific instructions according to the project structure.
```

## Prompt 4: Initialize Vite frontend

```
Init new vite@latest frontend app, use react-ts template
```

## Prompt 5: Initialize git repository

```
Init new git repository. Use "main" as default branch. Set remote origin to https://github.com/ysvirko-boden/map-insights.git
```

## Prompt 6: Create .gitignore and initial commit

```
Create a proper .gitignore for the project and add an initial commit; push the changes
```
