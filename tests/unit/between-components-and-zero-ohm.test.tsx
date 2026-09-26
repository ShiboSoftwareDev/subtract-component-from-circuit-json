import { expect, test } from "bun:test"
import { subtractComponentFromCircuitJsonWithDetails } from "../../lib"
import {
  createSubtractionTestBoard,
  removedFixtureNames,
} from "../fixtures/subtraction-test-board"
import { getSourceComponentNames, renderCircuitJson } from "../helpers"

test("removes components between selected endpoints and bypasses zero ohms", async () => {
  const circuitJson = await renderCircuitJson(createSubtractionTestBoard())
  const result = await subtractComponentFromCircuitJsonWithDetails(
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
