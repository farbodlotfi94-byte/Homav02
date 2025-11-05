# HOMA Project Skills

This directory contains specialized skills for Claude Code when working with the HOMA furniture visualization application.

## Available Skills

### 1. **step-flow** - Step Flow Management
**When to use:** When adding new steps, modifying transitions, or debugging the step-based state machine.

**Use cases:**
- Adding a new step to the application flow
- Modifying step transitions and handlers
- Debugging navigation between steps
- Understanding the current step logic

**Invoke with:**
```
/skill step-flow
```

---

### 2. **api-integration** - API Integration
**When to use:** When adding new API endpoints, fixing backend communication, or working with product data.

**Use cases:**
- Adding new API calls to backend
- Debugging API timeout issues
- Working with product ID conversions
- Handling API errors and retry logic
- Understanding the API client architecture

**Invoke with:**
```
/skill api-integration
```

---

### 3. **ui-component** - UI Component Development
**When to use:** When creating new UI components or modifying existing ones with Persian/RTL support.

**Use cases:**
- Creating new React components
- Working with Persian/Farsi text and RTL layout
- Using Radix UI and shadcn/ui components
- Adding animations with Framer Motion
- Building responsive layouts with Tailwind

**Invoke with:**
```
/skill ui-component
```

---

### 4. **admin-feature** - Admin Dashboard Development
**When to use:** When working on admin panel features, analytics, or product management.

**Use cases:**
- Adding new admin features
- Working with product CRUD operations
- Building analytics dashboards
- Managing AI prompts (Gemini, Groq)
- Adding new admin tabs or functionality

**Invoke with:**
```
/skill admin-feature
```

---

### 5. **image-processing** - Image Processing & AI Integration
**When to use:** When working on image upload, AI processing, or visualization features.

**Use cases:**
- Debugging image upload issues
- Working with AI backend integration
- Handling timeout scenarios
- Implementing quality checks
- Understanding the background processing flow

**Invoke with:**
```
/skill image-processing
```

---

### 6. **debug-test** - Debugging & Testing
**When to use:** When troubleshooting issues, testing features, or debugging production problems.

**Use cases:**
- Debugging product loading issues
- Testing the complete user flow
- Using built-in debug tools
- Analyzing console logs
- Performance testing and optimization

**Invoke with:**
```
/skill debug-test
```

---

### 7. **deploy** - Deployment & Docker
**When to use:** When deploying the application, configuring Docker, or troubleshooting production issues.

**Use cases:**
- Building and deploying Docker containers
- Configuring environment variables
- Deploying to Dokploy or other platforms
- Troubleshooting deployment issues
- Setting up Nginx and SSL

**Invoke with:**
```
/skill deploy
```

---

## How to Use Skills

Skills are invoked using the `/skill` command in Claude Code:

```
/skill <skill-name>
```

For example:
```
/skill api-integration
```

Claude will then load the skill's context and instructions, becoming specialized for that type of task.

## When to Use Which Skill

| Task Type | Recommended Skill |
|-----------|------------------|
| Add a new page/screen | `step-flow` |
| Fix API call | `api-integration` |
| Create a button/form | `ui-component` |
| Add admin feature | `admin-feature` |
| Fix image upload | `image-processing` |
| Debug production issue | `debug-test` |
| Deploy to server | `deploy` |

## Combining Skills

You can use multiple skills in sequence for complex tasks:

1. Start with `debug-test` to understand the issue
2. Switch to `api-integration` to fix the backend call
3. Use `ui-component` to update the error message
4. Finally use `deploy` to push changes to production

## Creating New Skills

To create a new skill:

1. Create a new `.md` file in `.claude/skills/`
2. Define clear context and instructions
3. Include key files, conventions, and examples
4. Update this README with the new skill

## Project Context

All skills have access to the project context defined in `CLAUDE.md`. Each skill provides specialized guidance for specific development tasks within the HOMA application.

---

**Note:** Skills are context-loading tools that help Claude understand your specific task. They don't execute automatically - you invoke them when needed.