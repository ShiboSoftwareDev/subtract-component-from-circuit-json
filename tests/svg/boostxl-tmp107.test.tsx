import { test } from "bun:test"
import { expectEvmBeforeAfterSnapshots } from "../expect-evm-before-after-snapshots"
import { loadCircuitJsonFixture } from "../load-circuit-json-fixture"

test("subtracts the breakaway sensors from BOOSTXL-TMP107", async () => {
  const circuitJson = await loadCircuitJsonFixture("boostxl-tmp107")
  await expectEvmBeforeAfterSnapshots({
    boardName: "BOOSTXL-TMP107",
    circuitJson,
    componentNames: ["U3", "C3", "U4", "C4"],
    testPath: import.meta.path,
  })
})
