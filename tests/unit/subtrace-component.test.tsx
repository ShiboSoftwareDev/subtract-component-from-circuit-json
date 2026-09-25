import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import {
  subtraceComponentFromCircuitJson,
  subtraceComponentFromCircuitJsonWithDetails,
} from "../../lib"
import {
  createTiEvmBoard,
  removedFixtureNames,
  tiEvmFixtures,
} from "../fixtures/ti-evm-fixtures"
import { getSourceComponentNames, renderCircuitJson } from "../helpers"

test("TSX and Circuit JSON use the same subtraction pipeline", async () => {
  const fixture = tiEvmFixtures[0]
  const board = createTiEvmBoard(fixture)
  const circuitJson = await renderCircuitJson(board)
  const options = { componentNames: removedFixtureNames }

  const fromTsx = await subtraceComponentFromCircuitJson(board, options)
  const fromCircuitJson = await subtraceComponentFromCircuitJson(
    circuitJson,
    options,
  )

  expect(fromTsx).toEqual(fromCircuitJson)
})

test("removes components between selected endpoints and bypasses zero ohms", async () => {
  const circuitJson = await renderCircuitJson(
    createTiEvmBoard(tiEvmFixtures[1]),
  )
  const result = await subtraceComponentFromCircuitJsonWithDetails(
    circuitJson,
    {
      componentNames: removedFixtureNames,
    },
  )
  const remainingNames = getSourceComponentNames(result.circuitJson)

  expect(result.removedComponentNames).toContain("R_EVAL_MIDDLE")
  expect(remainingNames).not.toContain("R_EVAL_MIDDLE")
  expect(remainingNames).toContain("U1")
  expect(result.addedSourceTraceIds).toHaveLength(1)
  expect(
    result.circuitJson.some(
      (element) =>
        element.type === "pcb_trace" &&
        element.source_trace_id === result.addedSourceTraceIds[0],
    ),
  ).toBe(true)
  const retainedLabelTexts = result.circuitJson
    .filter((element) => element.type === "schematic_net_label")
    .map((label) => label.text)
  expect(retainedLabelTexts).not.toContain("VIN_IN")
  expect(retainedLabelTexts).not.toContain("VIN_LINK")
  expect(retainedLabelTexts).not.toContain("EVAL_LEFT")
  expect(retainedLabelTexts).not.toContain("EVAL_RIGHT")
})

test("does not mutate Circuit JSON and rejects missing selectors", async () => {
  const circuitJson = await renderCircuitJson(
    createTiEvmBoard(tiEvmFixtures[2]),
  )
  const originalText = JSON.stringify(circuitJson)

  await subtraceComponentFromCircuitJson(circuitJson, {
    componentNames: ["R0_BYPASS"],
  })
  expect(JSON.stringify(circuitJson)).toBe(originalText)
  await expect(
    subtraceComponentFromCircuitJson(circuitJson, {
      componentNames: ["DOES_NOT_EXIST"],
    }),
  ).rejects.toThrow("Component selectors did not match")
})

test("ordinary resistors are not silently shorted", async () => {
  const circuitJson = await renderCircuitJson(
    createTiEvmBoard(tiEvmFixtures[3]),
  )
  const result = await subtraceComponentFromCircuitJsonWithDetails(
    circuitJson,
    {
      componentNames: ["R_INPUT"],
    },
  )

  expect(result.addedSourceTraceIds).toEqual([])
})

test("can disable between-component expansion", async () => {
  const circuitJson = await renderCircuitJson(
    createTiEvmBoard(tiEvmFixtures[0]),
  )
  const result = await subtraceComponentFromCircuitJsonWithDetails(
    circuitJson,
    {
      componentNames: ["R_EVAL_LEFT", "R_EVAL_RIGHT"],
      includeComponentsBetween: false,
    },
  )

  expect(result.removedComponentNames).not.toContain("R_EVAL_MIDDLE")
})

function countType(circuitJson: CircuitJson, type: string): number {
  return circuitJson.filter((element) => element.type === type).length
}

test("subtraction removes owned schematic and PCB primitives", async () => {
  const circuitJson = await renderCircuitJson(
    createTiEvmBoard(tiEvmFixtures[0]),
  )
  const result = await subtraceComponentFromCircuitJson(circuitJson, {
    componentNames: ["R_EVAL_LEFT"],
  })

  expect(countType(result, "pcb_component")).toBeLessThan(
    countType(circuitJson, "pcb_component"),
  )
  expect(countType(result, "schematic_component")).toBeLessThan(
    countType(circuitJson, "schematic_component"),
  )
})
