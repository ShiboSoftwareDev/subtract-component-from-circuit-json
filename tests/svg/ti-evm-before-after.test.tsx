import { expect, test } from "bun:test"
import {
  convertCircuitJsonToPcbSvg,
  convertCircuitJsonToSchematicSvg,
} from "circuit-to-svg"
import { stackSvgsHorizontally } from "stack-svgs"
import { subtraceComponentFromCircuitJson } from "../../lib"
import {
  createTiEvmBoard,
  removedFixtureNames,
  tiEvmFixtures,
} from "../fixtures/ti-evm-fixtures"
import { renderCircuitJson } from "../helpers"
import { normalizeSvgViewport } from "../normalize-svg-viewport"

test("four TI EVM fixtures show PCB and schematic before/after pairs", async () => {
  const pcbRows: string[] = []
  const schematicRows: string[] = []
  for (const fixture of tiEvmFixtures) {
    const board = createTiEvmBoard(fixture)
    const before = await renderCircuitJson(board)
    const input = fixture.inputKind === "tsx" ? board : before
    const after = await subtraceComponentFromCircuitJson(input, {
      componentNames: removedFixtureNames,
    })
    pcbRows.push(
      stackSvgsHorizontally(
        [
          convertCircuitJsonToPcbSvg(before),
          convertCircuitJsonToPcbSvg(after),
        ].map(normalizeSvgViewport),
        {
          gap: 24,
          normalizeSize: true,
          targetSize: 500,
          rootAttributes: {
            "aria-label": `${fixture.boardName} PCB: before on left, after on right`,
            role: "img",
          },
        },
      ),
    )
    schematicRows.push(
      stackSvgsHorizontally(
        [
          convertCircuitJsonToSchematicSvg(before),
          convertCircuitJsonToSchematicSvg(after),
        ].map(normalizeSvgViewport),
        {
          gap: 24,
          normalizeSize: true,
          targetSize: 500,
          rootAttributes: {
            "aria-label": `${fixture.boardName} schematic: before on left, after on right`,
            role: "img",
          },
        },
      ),
    )
  }

  await expect(pcbRows).toMatchMultipleSvgSnapshots(
    import.meta.path,
    tiEvmFixtures.map((fixture) => `${fixture.boardName}-pcb`),
  )
  await expect(schematicRows).toMatchMultipleSvgSnapshots(
    import.meta.path,
    tiEvmFixtures.map((fixture) => `${fixture.boardName}-schematic`),
  )
})
