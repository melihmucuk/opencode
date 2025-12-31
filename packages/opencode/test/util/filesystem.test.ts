import { describe, expect, test, beforeEach, afterEach } from "bun:test"
import { Filesystem } from "../../src/util/filesystem"
import { mkdtemp, rm, writeFile } from "fs/promises"
import { tmpdir } from "os"
import { join } from "path"

describe("Filesystem.findUp", () => {
  let testDir: string

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), "opencode-test-"))
  })

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true })
  })

  test("should find single file in current directory", async () => {
    const targetFile = join(testDir, "AGENTS.md")
    await writeFile(targetFile, "# Test")

    const results = await Filesystem.findUp("AGENTS.md", testDir)
    expect(results).toEqual([targetFile])
  })

  test("should find files hierarchically from nested directory", async () => {
    // Create directory structure:
    // testDir/
    //   AGENTS.md
    //   components/
    //     AGENTS.md
    //     ui/
    //       (start search here)

    const rootAgents = join(testDir, "AGENTS.md")
    const componentsDir = join(testDir, "components")
    const componentsAgents = join(componentsDir, "AGENTS.md")
    const uiDir = join(componentsDir, "ui")

    await writeFile(rootAgents, "# Root level")
    await Bun.write(componentsAgents, "# Components level")
    await Bun.write(join(uiDir, ".gitkeep"), "")

    const results = await Filesystem.findUp("AGENTS.md", uiDir, testDir)

    // Should find both files, starting from the closest (components) to farthest (root)
    expect(results).toHaveLength(2)
    expect(results).toContain(rootAgents)
    expect(results).toContain(componentsAgents)
  })

  test("should respect stop directory boundary", async () => {
    // Create directory structure:
    // testDir/
    //   AGENTS.md
    //   project/
    //     AGENTS.md
    //     src/
    //       (start search here, stop at project)

    const rootAgents = join(testDir, "AGENTS.md")
    const projectDir = join(testDir, "project")
    const projectAgents = join(projectDir, "AGENTS.md")
    const srcDir = join(projectDir, "src")

    await writeFile(rootAgents, "# Root level - should not be found")
    await Bun.write(projectAgents, "# Project level")
    await Bun.write(join(srcDir, ".gitkeep"), "")

    const results = await Filesystem.findUp("AGENTS.md", srcDir, projectDir)

    // Should only find project-level file, not root level
    expect(results).toHaveLength(1)
    expect(results).toContain(projectAgents)
    expect(results).not.toContain(rootAgents)
  })

  test("should return empty array when no files found", async () => {
    const results = await Filesystem.findUp("AGENTS.md", testDir)
    expect(results).toEqual([])
  })

  test("should find all instances in deep hierarchy", async () => {
    // Create directory structure:
    // testDir/
    //   AGENTS.md
    //   packages/
    //     AGENTS.md
    //     opencode/
    //       AGENTS.md
    //       src/
    //         (start search here)

    const rootAgents = join(testDir, "AGENTS.md")
    const packagesDir = join(testDir, "packages")
    const packagesAgents = join(packagesDir, "AGENTS.md")
    const opencodeDir = join(packagesDir, "opencode")
    const opencodeAgents = join(opencodeDir, "AGENTS.md")
    const srcDir = join(opencodeDir, "src")

    await writeFile(rootAgents, "# Root")
    await Bun.write(packagesAgents, "# Packages")
    await Bun.write(opencodeAgents, "# Opencode")
    await Bun.write(join(srcDir, ".gitkeep"), "")

    const results = await Filesystem.findUp("AGENTS.md", srcDir, testDir)

    // Should find all three files
    expect(results).toHaveLength(3)
    expect(results).toContain(rootAgents)
    expect(results).toContain(packagesAgents)
    expect(results).toContain(opencodeAgents)
  })
})
