import { expect, test } from "bun:test"
import { subtractComponentFromCircuitJson } from "../../lib"
import { getSourceComponentNames } from "../helpers"

test("removing one component does not delete peers on a shared net", async () => {
  const result = await subtractComponentFromCircuitJson(
    <board width="32mm" height="16mm">
      <resistor
        name="R_REMOVE"
        resistance="1k"
        footprint="0402"
        pcbX={-10}
        connections={{ pin1: "net.COMMON" }}
      />
      <resistor
        name="R_KEEP"
        resistance="2k"
        footprint="0402"
        connections={{ pin1: "net.COMMON" }}
      />
      <resistor
        name="R_KEEP_2"
        resistance="3k"
        footprint="0402"
        pcbX={10}
        connections={{ pin1: "net.COMMON" }}
      />
    </board>,
    { componentNames: ["R_REMOVE"] },
  )

  expect(getSourceComponentNames(result)).toEqual(
    expect.arrayContaining(["R_KEEP", "R_KEEP_2"]),
  )
  expect(
    result.filter(
      (element) =>
        element.type === "source_trace" &&
        element.connected_source_net_ids.length > 0,
    ),
  ).toHaveLength(2)
})
