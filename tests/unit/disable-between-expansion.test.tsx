import { expect, test } from "bun:test"
import { subtractComponentFromCircuitJsonWithDetails } from "../../lib"
import { createSubtractionTestBoard } from "../fixtures/subtraction-test-board"
import { renderCircuitJson } from "../helpers"

test("can disable between-component expansion", async () => {
  const circuitJson = await renderCircuitJson(createSubtractionTestBoard())
  const result = await subtractComponentFromCircuitJsonWithDetails(
    circuitJson,
    {
      componentNames: ["R_EVAL_LEFT", "R_EVAL_RIGHT"],
      includeComponentsBetween: false,
    },
  )

  expect(result.removedComponentNames).not.toContain("R_EVAL_MIDDLE")
})
