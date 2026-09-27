import type { SourceTrace } from "circuit-json"

export type ConnectivityIdentity = string

export function getTraceConnectivityIdentities(
  sourceTrace: SourceTrace,
): readonly ConnectivityIdentity[] {
  const identities: ConnectivityIdentity[] = []
  if (sourceTrace.subcircuit_connectivity_map_key) {
    identities.push(
      `connectivity:${sourceTrace.subcircuit_connectivity_map_key}`,
    )
  }
  for (const sourceNetId of sourceTrace.connected_source_net_ids) {
    identities.push(`net:${sourceNetId}`)
  }
  return identities
}

export function sourceTracesShareConnectivity(
  leftSourceTrace: SourceTrace,
  rightSourceTrace: SourceTrace,
): boolean {
  const leftIdentities = new Set(
    getTraceConnectivityIdentities(leftSourceTrace),
  )
  return getTraceConnectivityIdentities(rightSourceTrace).some((identity) =>
    leftIdentities.has(identity),
  )
}
