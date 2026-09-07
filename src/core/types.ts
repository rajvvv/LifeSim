export type EntityId = string;
export type PersonId = string;
export type EventId = string;

export type Sex = "female" | "male" | "intersex";

export type LifeStage =
  | "infant"
  | "child"
  | "teen"
  | "young_adult"
  | "adult"
  | "middle_age"
  | "senior";

export interface PersonIdentity {
  firstName: string;
  lastName: string;
  sex: Sex;
  birthDate: number;
  birthCountry: string;
}

export interface LifecycleState {
  ageYears: number;
  stage: LifeStage;
  alive: boolean;
  deathDate?: number;
  deathCause?: string;
}

export interface PersonAttributes {
  health: number;
  energy: number;
  happiness: number;
  stress: number;
  intelligence: number;
  looks: number;
  charisma: number;
  discipline: number;
  luck: number;
}

export interface PersonalityProfile {
  ambition: number;
  riskTolerance: number;
  patience: number;
  discipline: number;
  empathy: number;
  sociability: number;
}

export interface SkillSet {
  technical: number;
  creative: number;
  social: number;
  physical: number;
  leadership: number;
  financialLiteracy: number;
}

export interface TimelineEntry {
  worldTime: number;
  title: string;
  description?: string;
  eventId?: EventId;
}

export interface Person {
  id: PersonId;
  identity: PersonIdentity;
  lifecycle: LifecycleState;
  attributes: PersonAttributes;
  personality: PersonalityProfile;
  skills: SkillSet;
  timeline: TimelineEntry[];
}

export type SimEventType =
  | "WorldCreated"
  | "PersonBorn"
  | "PersonAged"
  | "LifeStageChanged"
  | "StartedSchool"
  | "EnteredAdulthood"
  | "PersonDied"
  | "ScheduledEvent";

export interface SimEvent {
  id: EventId;
  type: SimEventType;
  worldTime: number;
  actorIds: EntityId[];
  targetIds: EntityId[];
  payload: Record<string, unknown>;
  causes: EventId[];
}

export interface ScheduledEvent {
  id: EventId;
  dueTime: number;
  type: SimEventType;
  actorIds: EntityId[];
  targetIds: EntityId[];
  payload: Record<string, unknown>;
}

export interface WorldCounters {
  entity: number;
  event: number;
}

export interface WorldState {
  schemaVersion: string;
  seed: string;
  worldTime: number;
  people: Record<PersonId, Person>;
  scheduledEvents: ScheduledEvent[];
  eventLog: SimEvent[];
  counters: WorldCounters;
}