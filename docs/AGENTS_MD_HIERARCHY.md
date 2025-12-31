# AGENTS.md Hierarchical Reading

## Overview

This document explains how Opencode reads and processes `AGENTS.md` files in a hierarchical manner.

## How It Works

### Search Mechanism

Opencode uses a hierarchical search algorithm to find `AGENTS.md` files:

1. **Starting Point**: The search begins from the current working directory (`Instance.directory`)
2. **Stop Point**: The search stops at the worktree root (`Instance.worktree`)
3. **Direction**: The search moves **upward** through the directory tree (from child to parent directories)
4. **Collection**: **ALL** `AGENTS.md` files found in the hierarchy are collected and read

### Example Scenarios

#### Scenario 1: Nested AGENTS.md Files

Directory structure:
```
project-root/
├── AGENTS.md                    (1)
└── components/
    ├── AGENTS.md                (2)
    └── ui/
        └── (current directory)
```

**Result**: Both files are read and processed:
- `/project-root/components/AGENTS.md` (2) - closest to current directory
- `/project-root/AGENTS.md` (1) - project root

**Order**: Files are found from closest to farthest (bottom-up in directory tree)

#### Scenario 2: Multiple Levels

Directory structure:
```
project-root/
├── AGENTS.md                    (1)
└── packages/
    ├── AGENTS.md                (2)
    └── app/
        ├── AGENTS.md            (3)
        └── src/
            └── (current directory)
```

**Result**: All three files are read:
- `/project-root/packages/app/AGENTS.md` (3)
- `/project-root/packages/AGENTS.md` (2)
- `/project-root/AGENTS.md` (1)

#### Scenario 3: No AGENTS.md in Current Directory

Directory structure:
```
project-root/
├── AGENTS.md                    (1)
└── components/
    └── ui/
        └── (current directory)
```

**Result**: Only the root file is read:
- `/project-root/AGENTS.md` (1)

## Alternative Rule Files

Opencode also searches for these files in order of preference:

1. `AGENTS.md` (primary)
2. `CLAUDE.md` (alternative)
3. `CONTEXT.md` (deprecated)

**Important**: Only files of the **first found type** are collected. For example:
- If `AGENTS.md` files are found at any level, `CLAUDE.md` and `CONTEXT.md` are ignored
- If no `AGENTS.md` is found but `CLAUDE.md` exists, only `CLAUDE.md` files are collected

## Global Configuration Files

After searching for local files, Opencode also checks for global configuration files:

1. `~/.config/opencode/AGENTS.md` (or `$XDG_CONFIG_HOME/opencode/AGENTS.md`)
2. `~/.claude/CLAUDE.md`

Only the **first found** global file is added.

## Implementation Details

### Code Location

The logic is implemented in:
- `/packages/opencode/src/session/system.ts` - `SystemPrompt.custom()` function
- `/packages/opencode/src/util/filesystem.ts` - `Filesystem.findUp()` function

### Key Code Snippet

```typescript
for (const localRuleFile of LOCAL_RULE_FILES) {
  const matches = await Filesystem.findUp(localRuleFile, Instance.directory, Instance.worktree)
  if (matches.length > 0) {
    matches.forEach((path) => paths.add(path))
    break  // Stop after first file type with matches
  }
}
```

### File Reading

All collected files are:
1. Read asynchronously
2. Prefixed with their path: `"Instructions from: " + path`
3. Combined into the system prompt

## Use Cases

### Package-Specific Instructions

In a monorepo, you can have:
- Root-level general guidelines in `/AGENTS.md`
- Package-specific instructions in `/packages/package-name/AGENTS.md`

Both will be read when working within a package directory.

### Component-Level Guidelines

For large codebases with component directories:
- Root `/AGENTS.md` for project-wide conventions
- `/components/AGENTS.md` for component-specific patterns

### Testing Isolation

When working in a test directory, you can have:
- Root `/AGENTS.md` for general project rules
- `/test/AGENTS.md` for testing-specific guidelines

Both will influence the AI when working in the test directory.

## Best Practices

1. **Keep Root General**: Put general project-wide instructions in the root `AGENTS.md`
2. **Be Specific in Subdirectories**: Use subdirectory `AGENTS.md` files for context-specific rules
3. **Avoid Conflicts**: Ensure instructions at different levels don't contradict each other
4. **Use Hierarchy**: More specific instructions in lower directories will be read alongside general ones

## Configuration

Additional instruction files can be specified in the Opencode configuration:

```json
{
  "instructions": [
    "custom-rules.md",
    "~/global-ai-instructions.md"
  ]
}
```

These files are searched using the same hierarchical approach with glob pattern support.

## Turkish Summary / Türkçe Özet

**Soru**: Opencode AGENTS.md dosyalarını nasıl okuyor? Hiyerarşik olarak mı?

**Cevap**: Evet, hiyerarşik olarak okuyor. Eğer proje kök dizininde bir `AGENTS.md` ve alt dizinde (`/components` gibi) başka bir `AGENTS.md` varsa:

- **HER İKİSİ DE** okunur ve kullanılır
- Arama, çalıştığınız dizinden başlar ve proje köküne doğru yukarı çıkar
- Yolda bulunan **TÜM** `AGENTS.md` dosyaları toplanır
- Hepsi AI'ın system prompt'una eklenir

Böylece hem genel proje kurallarını (kök dizindeki) hem de özel bileşen kurallarını (alt dizindeki) aynı anda kullanabilirsiniz.
