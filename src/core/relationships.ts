import type {
  Person,
  RelationshipAxes,
  RelationshipEdge,
  RelationshipType,
  WorldState,
} from "./types";
import { emitEvent, nextEntityId } from "./world";

const SYMMETRIC_RELATIONSHIP_TYPES: RelationshipType[] = [
  "sibling",
  "spouse",
  "friend",
  "acquaintance",
  "coworker",
  "rival",
];

function defaultAxes(type: RelationshipType): RelationshipAxes {
  switch (type) {
    case "parent_child":
      return {
        trust: 75,
        affection: 80,
        respect: 65,
        conflict: 15,
        resentment: 10,
        dependence: 80,
        attraction: 0,
        loyalty: 80,
        compatibility: 65,
      };

    case "sibling":
      return {
        trust: 60,
        affection: 65,
        respect: 55,
        conflict: 30,
        resentment: 15,
        dependence: 40,
        attraction: 0,
        loyalty: 60,
        compatibility: 55,
      };

    case "spouse":
      return {
        trust: 70,
        affection: 80,
        respect: 65,
        conflict: 20,
        resentment: 10,
        dependence: 60,
        attraction: 75,
        loyalty: 75,
        compatibility: 65,
      };

    case "friend":
      return {
        trust: 60,
        affection: 60,
        respect: 55,
        conflict: 15,
        resentment: 10,
        dependence: 30,
        attraction: 20,
        loyalty: 55,
        compatibility: 60,
      };

    case "coworker":
      return {
        trust: 50,
        affection: 40,
        respect: 50,
        conflict: 20,
        resentment: 10,
        dependence: 25,
        attraction: 5,
        loyalty: 40,
        compatibility: 50,
      };

    case "rival":
      return {
        trust: 20,
        affection: 15,
        respect: 45,
        conflict: 65,
        resentment: 50,
        dependence: 10,
        attraction: 5,
        loyalty: 15,
        compatibility: 30,
      };

    case "acquaintance":
    default:
      return {
        trust: 40,
        affection: 35,
        respect: 40,
        conflict: 10,
        resentment: 5,
        dependence: 10,
        attraction: 10,
        loyalty: 30,
        compatibility: 40,
      };
  }
}

export function findRelationship(
  world: WorldState,
  personA: string,
  personB: string,
  type?: RelationshipType
): RelationshipEdge | undefined {
  return Object.values(world.relationships).find((relationship) => {
    const sameDirection =
      relationship.personA === personA && relationship.personB === personB;

    const oppositeDirection =
      relationship.personA === personB && relationship.personB === personA;

    const typeMatches = !type || relationship.type === type;

    if (!typeMatches) {
      return false;
    }

    if (SYMMETRIC_RELATIONSHIP_TYPES.includes(relationship.type)) {
      return sameDirection || oppositeDirection;
    }

    return sameDirection;
  });
}

export function createRelationship(
  world: WorldState,
  input: {
    personA: string;
    personB: string;
    type: RelationshipType;
    startedAt?: number;
  }
): RelationshipEdge {
  if (input.personA === input.personB) {
    throw new Error("Cannot create a relationship between a person and themselves.");
  }

  const existing = findRelationship(
    world,
    input.personA,
    input.personB,
    input.type
  );

  if (existing) {
    return existing;
  }

  const id = nextEntityId(world, "relationship");

  const relationship: RelationshipEdge = {
    id,
    personA: input.personA,
    personB: input.personB,
    type: input.type,
    status: "active",
    startedAt: input.startedAt ?? world.worldTime,
    axes: defaultAxes(input.type),
  };

  world.relationships[id] = relationship;

  const personA = world.people[input.personA];
  const personB = world.people[input.personB];

  if (personA && !personA.relationships.includes(id)) {
    personA.relationships.push(id);
  }

  if (personB && !personB.relationships.includes(id)) {
    personB.relationships.push(id);
  }

  emitEvent(world, {
    type: "RelationshipCreated",
    worldTime: relationship.startedAt,
    actorIds: [input.personA, input.personB],
    targetIds: [input.personA, input.personB],
    payload: {
      relationshipId: id,
      relationshipType: input.type,
    },
    causes: [],
  });

  return relationship;
}

export function createParentChild(
  world: WorldState,
  parent: Person,
  child: Person
): void {
  createRelationship(world, {
    personA: parent.id,
    personB: child.id,
    type: "parent_child",
  });

  if (!parent.familyRefs.childIds.includes(child.id)) {
    parent.familyRefs.childIds.push(child.id);
  }

  if (!child.familyRefs.parentIds.includes(parent.id)) {
    child.familyRefs.parentIds.push(parent.id);
  }
}

export function createSibling(
  world: WorldState,
  personA: Person,
  personB: Person
): void {
  createRelationship(world, {
    personA: personA.id,
    personB: personB.id,
    type: "sibling",
  });

  if (!personA.familyRefs.siblingIds.includes(personB.id)) {
    personA.familyRefs.siblingIds.push(personB.id);
  }

  if (!personB.familyRefs.siblingIds.includes(personA.id)) {
    personB.familyRefs.siblingIds.push(personA.id);
  }
}

export function createSpouse(
  world: WorldState,
  personA: Person,
  personB: Person
): void {
  createRelationship(world, {
    personA: personA.id,
    personB: personB.id,
    type: "spouse",
  });

  if (!personA.familyRefs.spouseIds.includes(personB.id)) {
    personA.familyRefs.spouseIds.push(personB.id);
  }

  if (!personB.familyRefs.spouseIds.includes(personA.id)) {
    personB.familyRefs.spouseIds.push(personA.id);
  }
}

export function getRelationshipsForPerson(
  world: WorldState,
  personId: string
): RelationshipEdge[] {
  return Object.values(world.relationships).filter(
    (relationship) =>
      relationship.personA === personId || relationship.personB === personId
  );
}

export function getOtherPersonId(
  relationship: RelationshipEdge,
  personId: string
): string {
  return relationship.personA === personId
    ? relationship.personB
    : relationship.personA;
}