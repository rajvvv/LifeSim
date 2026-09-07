export type EntityId = string;
export type PersonId = string;
export type EventId = string;
export type RelationshipId = string;
export type FamilyId = string;
export type HouseholdId = string;

export type Sex = "female" | "male" | "intersex";

export type LifeStage =
  | "infant"
  | "child"
  | "teen"
  | "young_adult"
  | "adult"
  | "middle_age"
  | "senior";

export type RelationshipType =
  | "parent_child"
  | "sibling"
  | "spouse"
  | "friend"
  | "acquaintance"
  | "coworker"
  | "rival";

export type RelationshipStatus =
  | "active"
  | "strained"
  | "dormant"
  | "ended";

export interface RelationshipAxes {
  trust: number;
  affection: number;
  respect: number;
  conflict: number;
  resentment: number;
  dependence: number;
  attraction: number;
  loyalty: number;
  compatibility: number;
}

export interface RelationshipEdge {
  id: RelationshipId;
  personA: PersonId;
  personB: PersonId;
  type: RelationshipType;
  status: RelationshipStatus;
  startedAt: number;
  axes: RelationshipAxes;
}

export interface FamilyRefs {
  parentIds: PersonId[];
  childIds: PersonId[];
  siblingIds: PersonId[];
  spouseIds: PersonId[];
}

export interface Family {
  id: FamilyId;
  name: string;
  memberIds: PersonId[];
  createdAt: number;
}

export interface Household {
  id: HouseholdId;
  memberIds: PersonId[];
  createdAt: number;
}

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

  relationships: RelationshipId[];
  familyRefs: FamilyRefs;
  familyId?: FamilyId;
  householdId?: HouseholdId;
}

export type SimEventType =
  | "WorldCreated"
  | "PersonBorn"
  | "PersonCreated"
  | "PersonAged"
  | "LifeStageChanged"
  | "StartedSchool"
  | "EnteredAdulthood"
  | "PersonDied"
  | "RelationshipCreated"
  | "FamilyCreated"
  | "HouseholdCreated"
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
  relationships: Record<RelationshipId, RelationshipEdge>;
  families: Record<FamilyId, Family>;
  households: Record<HouseholdId, Household>;
  scheduledEvents: ScheduledEvent[];
  eventLog: SimEvent[];
  counters: WorldCounters;
}