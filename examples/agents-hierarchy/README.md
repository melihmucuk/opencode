# Example: Hierarchical AGENTS.md Files

This directory demonstrates how OpenCode reads multiple AGENTS.md files hierarchically.

## Directory Structure

```
examples/agents-hierarchy/
├── README.md (this file)
├── AGENTS.md (root level - general project rules)
└── components/
    ├── AGENTS.md (component-specific rules)
    └── ui/
        └── button/
            └── (work directory)
```

## Behavior

When working in the `components/ui/button/` directory:

1. OpenCode searches upward from the current directory
2. It finds and reads **both**:
   - `examples/agents-hierarchy/components/AGENTS.md`
   - `examples/agents-hierarchy/AGENTS.md`
3. Both files' instructions are combined in the AI's system prompt

## Example Files

### Root AGENTS.md
Contains general project-wide guidelines:
- Coding standards
- General architecture patterns
- Project-wide conventions

### Components AGENTS.md
Contains component-specific guidelines:
- Component naming conventions
- React/Vue/etc. specific patterns
- Component testing requirements

## Try It Yourself

1. Create AGENTS.md files at different levels in your project
2. Run opencode from a subdirectory
3. All AGENTS.md files from current directory up to project root will be used

## Key Takeaways

- ✅ Multiple AGENTS.md files work together
- ✅ Closer files don't override farther ones - they complement each other
- ✅ Use root AGENTS.md for general rules
- ✅ Use subdirectory AGENTS.md for specific contexts
- ⚠️ Avoid contradicting instructions across levels
