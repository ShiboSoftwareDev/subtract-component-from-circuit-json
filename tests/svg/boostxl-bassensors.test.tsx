import { test } from "bun:test"
import { expectEvmBeforeAfterSnapshots } from "../expect-evm-before-after-snapshots"
import { loadCircuitJsonFixture } from "../load-circuit-json-fixture"

test("subtracts the TMP116 coupon from BOOSTXL-BASSENSORS", async () => {
  const circuitJson = await loadCircuitJsonFixture("boostxl-bassensors")
  await expectEvmBeforeAfterSnapshots({
    boardName: "BOOSTXL-BASSENSORS",
    circuitJson,
    componentNames: ["J6", "U1", "C1"],
    testPath: import.meta.path,
  })
})
