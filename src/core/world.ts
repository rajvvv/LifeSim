import type {
  WorldState,
  SimEvent,
  EventId,
  Person,
  TimelineEntry,
} from "./types";

export function createWorld(seed: string): WorldState {
  return {
    schemaVersion: "0.2.0",
    seed,
    worldTime: 0,
    people: {},
    relationships: {},
    families: {},
    households: {},
    scheduledEvents: [],
    eventLog: [],
    counters: {
      entity: 0,
      event: 0,
    },
  };
}

export function nextEntityId(world: WorldState, prefix: string): string {
  world.counters.entity += 1;
  return `${prefix}_${world.counters.entity.toString().padStart(6, "0")}`;
}

export function nextEventId(world: WorldState): EventId {
  world.counters.event += 1;
  return `evt_${world.counters.event.toString().padStart(8, "0")}`;
}

export function emitEvent(
  world: WorldState,
  input: Omit<SimEvent, "id">
): SimEvent {
  const event: SimEvent = {
    id: nextEventId(world),
    ...input,
  };

  world.eventLog.push(event);
  return event;
}

export function addTimeline(
  person: Person,
  event: SimEvent,
  title: string,
  description?: string
): void {
  const entry: TimelineEntry = {
    worldTime: event.worldTime,
    title,
    eventId: event.id,
  };

  if (description !== undefined) {
    entry.description = description;
  }

  person.timeline.push(entry);
}