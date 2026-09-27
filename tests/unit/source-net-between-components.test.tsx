import { expect, test } from "bun:test"
import { subtractComponentFromCircuitJsonWithDetails } from "../../lib"
import { getSourceComponentNames } from "../helpers"

test("removes a component between selected endpoints across source nets", async () => {
  const result = await subtractComponentFromCircuitJsonWithDetails(
    <board width="32mm" height="16mm">
      <resistor
        name="R_LEFT"
        resistance="1k"
        footprint="0402"
        pcbX={-10}
        connections={{ pin2: "net.LEFT" }}
      />
      <resistor
        name="R_MIDDLE"
        resistance="2k"
        footprint="0402"
        connections={{ pin1: "net.LEFT", pin2: "net.RIGHT" }}
      />
      <resistor
        name="R_RIGHT"
        resistance="3k"
        footprint="0402"
        pcbX={10}
        connections={{ pin1: "net.RIGHT" }}
      />
      <resistor name="R_RETAINED" resistance="4k" footprint="0402" pcbY={5} />
    </board>,
    { componentNames: ["R_LEFT", "R_RIGHT"] },
  )

  expect(result.removedComponentNames).toEqual(
    expect.arrayContaining(["R_LEFT", "R_MIDDLE", "R_RIGHT"]),
  )
  expect(getSourceComponentNames(result.circuitJson)).toEqual(["R_RETAINED"])
})
