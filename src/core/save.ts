import type { WorldState } from "./types";

export function saveWorld(world: WorldState): string {
  return JSON.stringify(world, null, 2);
}

export function loadWorld(json: string): WorldState {
  const parsed = JSON.parse(json) as WorldState;

  if (!parsed.schemaVersion) {
    throw new Error("Invalid save file: missing schemaVersion.");
  }

  if (!parsed.people) {
    throw new Error("Invalid save file: missing people.");
  }

  if (!parsed.counters) {
    throw new Error("Invalid save file: missing counters.");
  }

  return parsed;
}