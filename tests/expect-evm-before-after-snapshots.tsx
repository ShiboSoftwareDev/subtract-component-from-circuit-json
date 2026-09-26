import { expect } from "bun:test"
import type { CircuitJson } from "circuit-json"
import {
  convertCircuitJsonToPcbSvg,
  convertCircuitJsonToSchematicSvg,
} from "circuit-to-svg"
import { stackSvgsHorizontally } from "stack-svgs"
import { subtractComponentFromCircuitJson } from "../lib"
import { getSourceComponentNames } from "./helpers"
import { addSvgHeading, normalizeSvgViewport } from "./normalize-svg-viewport"

interface EvmSnapshotOptions {
  boardName: string
  circuitJson: CircuitJson
  componentNames: readonly string[]
  testPath: string
}

export async function expectEvmBeforeAfterSnapshots(
  options: EvmSnapshotOptions,
): Promise<void> {
  const before = structuredClone(options.circuitJson)
  const after = await subtractComponentFromCircuitJson(before, {
    componentNames: options.componentNames,
    includeComponentsBetween: false,
  })
  const remainingNames = getSourceComponentNames(after)
  for (const componentName of options.componentNames) {
    expect(remainingNames).not.toContain(componentName)
  }

  const pcbComparison = createComparisonSvg({
    afterSvg: convertCircuitJsonToPcbSvg(after),
    beforeSvg: convertCircuitJsonToPcbSvg(before),
    boardName: options.boardName,
    viewName: "PCB",
  })
  const schematicComparison = createComparisonSvg({
    afterSvg: convertCircuitJsonToSchematicSvg(after),
    beforeSvg: convertCircuitJsonToSchematicSvg(before),
    boardName: options.boardName,
    viewName: "schematic",
  })

  await expect(pcbComparison).toMatchSvgSnapshot(options.testPath, "pcb")
  await expect(schematicComparison).toMatchSvgSnapshot(
    options.testPath,
    "schematic",
  )
}

function createComparisonSvg(options: {
  afterSvg: string
  beforeSvg: string
  boardName: string
  viewName: string
}): string {
  const before = addSvgHeading(
    normalizeSvgViewport(options.beforeSvg),
    `FROM · ${options.boardName}`,
  )
  const after = addSvgHeading(
    normalizeSvgViewport(options.afterSvg),
    "TO · COMPONENTS SUBTRACTED",
  )
  const comparison = stackSvgsHorizontally([before, after], {
    gap: 24,
    normalizeSize: true,
    targetSize: 600,
    rootAttributes: {
      "aria-label": `${options.boardName} ${options.viewName}: original on left, subtraction result on right`,
      role: "img",
    },
  })
  return comparison.replace(/[ \t]+$/gmu, "")
}
