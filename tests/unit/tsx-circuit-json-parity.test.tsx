import { expect, test } from "bun:test"
import { subtractComponentFromCircuitJson } from "../../lib"
import {
  createSubtractionTestBoard,
  removedFixtureNames,
} from "../fixtures/subtraction-test-board"
import { renderCircuitJson } from "../helpers"

test("TSX and Circuit JSON use the same subtraction pipeline", async () => {
  const board = createSubtractionTestBoard()
  const circuitJson = await renderCircuitJson(board)
  const options = { componentNames: removedFixtureNames }

  const fromTsx = await subtractComponentFromCircuitJson(board, options)
  const fromCircuitJson = await subtractComponentFromCircuitJson(
    circuitJson,
    options,
  )

  expect(fromTsx).toEqual(fromCircuitJson)
})
