import type { WorldState } from "./types";

export function saveWorld(world: WorldState): string {
  return JSON.stringify(world, null, 2);
}

export function loadWorld(json: string): WorldState {
  const parsed = JSON.parse(json) as any;

  if (!parsed.schemaVersion) {
    throw new Error("Invalid save file: missing schemaVersion.");
  }

  if (!parsed.people) {
    throw new Error("Invalid save file: missing people.");
  }

  if (!parsed.counters) {
    throw new Error("Invalid save file: missing counters.");
  }

  if (!parsed.relationships) {
    parsed.relationships = {};
  }

  if (!parsed.families) {
    parsed.families = {};
  }

  if (!parsed.households) {
    parsed.households = {};
  }

  for (const person of Object.values(parsed.people)) {
    const p = person as any;

    if (!p.relationships) {
      p.relationships = [];
    }

    if (!p.familyRefs) {
      p.familyRefs = {
        parentIds: [],
        childIds: [],
        siblingIds: [],
        spouseIds: [],
      };
    }
  }

  parsed.schemaVersion = "0.2.0";

  return parsed as WorldState;
}