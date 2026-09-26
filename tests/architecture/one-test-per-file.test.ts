import { expect, test } from "bun:test"
import { readdirSync, readFileSync } from "node:fs"
import { join, relative } from "node:path"
import ts from "typescript"

test("keeps exactly one test declaration per file", () => {
  const testsDirectory = join(import.meta.dir, "..")
  const testPaths = findTestPaths(testsDirectory)
  const declarationCounts = testPaths.map((testPath) => ({
    path: relative(testsDirectory, testPath),
    testDeclarations: countTestDeclarations(testPath),
  }))

  expect(declarationCounts).toEqual(
    testPaths.map((testPath) => ({
      path: relative(testsDirectory, testPath),
      testDeclarations: 1,
    })),
  )
})

function findTestPaths(testsDirectory: string): string[] {
  const testPaths: string[] = []
  const pendingDirectories = [testsDirectory]
  while (pendingDirectories.length > 0) {
    const directory = pendingDirectories.pop()
    if (!directory) continue
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const entryPath = join(directory, entry.name)
      if (entry.isDirectory()) pendingDirectories.push(entryPath)
      else if (/\.test\.tsx?$/u.test(entry.name)) testPaths.push(entryPath)
    }
  }
  return testPaths.sort()
}

function countTestDeclarations(testPath: string): number {
  const sourceFile = ts.createSourceFile(
    testPath,
    readFileSync(testPath, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    testPath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )
  let testDeclarations = 0
  const pendingNodes: ts.Node[] = [sourceFile]
  while (pendingNodes.length > 0) {
    const node = pendingNodes.pop()
    if (!node) continue
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "test"
    ) {
      testDeclarations += 1
    }
    node.forEachChild((child) => {
      pendingNodes.push(child)
    })
  }
  return testDeclarations
}
