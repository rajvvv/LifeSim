import type { Person, Sex, WorldState } from "./types";
import { nextEntityId } from "./world";
import { MINUTES_PER_YEAR } from "./time";
import { lifeStageForAge } from "./lifecycle";

export interface CreateNewbornInput {
  firstName: string;
  lastName: string;
  sex: Sex;
  birthCountry: string;
}

export interface CreatePersonAtAgeInput extends CreateNewbornInput {
  age: number;
}

export function createNewborn(
  world: WorldState,
  input: CreateNewbornInput
): Person {
  const id = nextEntityId(world, "person");

  const person: Person = {
    id,
    identity: {
      firstName: input.firstName,
      lastName: input.lastName,
      sex: input.sex,
      birthDate: world.worldTime,
      birthCountry: input.birthCountry,
    },
    lifecycle: {
      ageYears: 0,
      stage: "infant",
      alive: true,
    },
    attributes: {
      health: 80,
      energy: 80,
      happiness: 70,
      stress: 10,
      intelligence: 50,
      looks: 50,
      charisma: 50,
      discipline: 50,
      luck: 50,
    },
    personality: {
      ambition: 50,
      riskTolerance: 50,
      patience: 50,
      discipline: 50,
      empathy: 50,
      sociability: 50,
    },
    skills: {
      technical: 5,
      creative: 5,
      social: 5,
      physical: 5,
      leadership: 5,
      financialLiteracy: 5,
    },
    timeline: [],
    relationships: [],
    familyRefs: {
      parentIds: [],
      childIds: [],
      siblingIds: [],
      spouseIds: [],
    },
  };

  world.people[id] = person;
  return person;
}

export function createPersonAtAge(
  world: WorldState,
  input: CreatePersonAtAgeInput
): Person {
  const person = createNewborn(world, input);

  person.identity.birthDate =
    world.worldTime - input.age * MINUTES_PER_YEAR;

  person.lifecycle.ageYears = input.age;
  person.lifecycle.stage = lifeStageForAge(input.age);

  return person;
}