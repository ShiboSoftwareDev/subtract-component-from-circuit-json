# subtract-component-from-circuit-json

Remove evaluation-only components from a tscircuit board while preserving the
useful circuit. The input can be a TSX element or already-rendered Circuit JSON;
both routes use the same Circuit JSON subtraction pipeline.

```tsx
import { subtractComponentFromCircuitJson } from "subtract-component-from-circuit-json"

const smallerBoard = await subtractComponentFromCircuitJson(
  <board width="30mm" height="20mm">{/* ... */}</board>,
  { componentNames: ["J_DEBUG", "TP_DEBUG"] },
)
```

```ts
const smallerBoard = await subtractComponentFromCircuitJson(circuitJson, {
  sourceComponentIds: ["source_component_debug_header"],
})
```

## Behavior

- TSX is rendered once, then TSX and Circuit JSON use the same implementation.
- Selected `source_component` records and all owned schematic, PCB, CAD, port,
  trace, via, and annotation records are omitted from the inflated result.
- Components on a shortest direct-trace path between two selected components
  are also removed by default.
- A touched trace with two or more surviving endpoints is replaced with direct
  traces between those endpoints.
- A removed two-pin component is bypassed only when it is a zero-ohm resistor,
  or both sides carry the same source-net/connectivity identity. Ordinary
  resistors, capacitors, ICs, connectors, and switches are never guessed to be
  electrically transparent.
- The input array is not mutated and generated IDs are deterministic.

Set `includeComponentsBetween: false` or `preserveNetConnectivity: false` to
disable the corresponding behavior.

## Important boundaries

- Component selection needs source-layer records. A PCB-only converter output
  without `source_component` and `source_port` records cannot be selected by
  component name.
- High-fanout source nets are not interpreted as “between” paths; doing so would
  make selecting two GND-adjacent components remove unrelated circuitry.
- A direct replacement trace is geometric, not an autorouter invocation. Review
  clearance and layer constraints before manufacturing.
- Multiple components may share a name; a name selector intentionally removes
  every exact match.
- Missing selectors throw instead of silently producing an unchanged board.

## Verification

The SVG suite contains paired before/after PCB and schematic snapshots for four
TI evaluation-board-inspired fixtures: LM5158EVM-BST, LM5177EVM-HP,
TPS6287xEVM, and TMDS62LEVM. Unit tests cover TSX/Circuit JSON parity, path
closure, safe zero-ohm reconnection, non-mutation, missing selectors, and the
no-short rule for ordinary passives.

```sh
bun install
bun test
bun run typecheck
bun run lint
bun run build
```

## License

MIT
