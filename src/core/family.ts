import type { Family, Household, Person, WorldState } from "./types";
import { emitEvent, nextEntityId } from "./world";

export function addPersonToFamily(
  world: WorldState,
  person: Person,
  family: Family
): void {
  if (!family.memberIds.includes(person.id)) {
    family.memberIds.push(person.id);
  }

  if (!person.familyId) {
    person.familyId = family.id;
  }
}

export function createFamily(
  world: WorldState,
  name: string,
  memberIds: string[]
): Family {
  const id = nextEntityId(world, "family");

  const family: Family = {
    id,
    name,
    memberIds: [],
    createdAt: world.worldTime,
  };

  world.families[id] = family;

  for (const memberId of memberIds) {
    const person = world.people[memberId];

    if (person) {
      addPersonToFamily(world, person, family);
    }
  }

  emitEvent(world, {
    type: "FamilyCreated",
    worldTime: world.worldTime,
    actorIds: family.memberIds,
    targetIds: [family.id],
    payload: {
      familyId: family.id,
      name: family.name,
      memberIds: family.memberIds,
    },
    causes: [],
  });

  return family;
}

export function addPersonToHousehold(
  world: WorldState,
  person: Person,
  household: Household
): void {
  if (!household.memberIds.includes(person.id)) {
    household.memberIds.push(person.id);
  }

  if (!person.householdId) {
    person.householdId = household.id;
  }
}

export function createHousehold(
  world: WorldState,
  memberIds: string[]
): Household {
  const id = nextEntityId(world, "household");

  const household: Household = {
    id,
    memberIds: [],
    createdAt: world.worldTime,
  };

  world.households[id] = household;

  for (const memberId of memberIds) {
    const person = world.people[memberId];

    if (person) {
      addPersonToHousehold(world, person, household);
    }
  }

  emitEvent(world, {
    type: "HouseholdCreated",
    worldTime: world.worldTime,
    actorIds: household.memberIds,
    targetIds: [household.id],
    payload: {
      householdId: household.id,
      memberIds: household.memberIds,
    },
    causes: [],
  });

  return household;
}