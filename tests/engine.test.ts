import { describe, expect, it } from "vitest";

import {
  createWorld,
  createPersonAtBirth,
  createAdult,
  advanceYears,
} from "../src/core/engine";

import { createSpouse } from "../src/core/relationships";
import { saveWorld, loadWorld } from "../src/core/save";

describe("life simulation core", () => {
  it("ages a person over time", () => {
    const world = createWorld("test-seed");

    const person = createPersonAtBirth(world, {
      firstName: "Test",
      lastName: "Person",
      sex: "female",
      birthCountry: "IND",
    });

    advanceYears(world, 10);

    expect(person.lifecycle.ageYears).toBe(10);
    expect(
      person.timeline.some((entry) => entry.title === "Started school")
    ).toBe(true);
  });

  it("saves and loads world state", () => {
    const world = createWorld("save-test");

    const person = createPersonAtBirth(world, {
      firstName: "Save",
      lastName: "Test",
      sex: "male",
      birthCountry: "USA",
    });

    advanceYears(world, 5);

    const json = saveWorld(world);
    const loaded = loadWorld(json);

    expect(loaded.people[person.id].lifecycle.ageYears).toBe(5);
  });

  it("is deterministic for the same seed", () => {
    function run(seed: string): string {
      const world = createWorld(seed);

      createPersonAtBirth(world, {
        firstName: "Determinism",
        lastName: "Check",
        sex: "female",
        birthCountry: "IND",
      });

      advanceYears(world, 30);

      return JSON.stringify(world);
    }

    expect(run("same-seed")).toBe(run("same-seed"));
  });

  it("creates family relationships for a newborn", () => {
    const world = createWorld("family-test");

    const father = createAdult(world, {
      firstName: "Arjun",
      lastName: "Verma",
      sex: "male",
      age: 32,
      birthCountry: "IND",
    });

    const mother = createAdult(world, {
      firstName: "Priya",
      lastName: "Verma",
      sex: "female",
      age: 29,
      birthCountry: "IND",
    });

    createSpouse(world, father, mother);

    const child = createPersonAtBirth(world, {
      firstName: "Asha",
      lastName: "Verma",
      sex: "female",
      birthCountry: "IND",
      parentIds: [mother.id, father.id],
    });

    expect(child.familyRefs.parentIds).toContain(mother.id);
    expect(child.familyRefs.parentIds).toContain(father.id);

    expect(father.familyRefs.childIds).toContain(child.id);
    expect(mother.familyRefs.childIds).toContain(child.id);

    expect(mother.familyRefs.spouseIds).toContain(father.id);
    expect(father.familyRefs.spouseIds).toContain(mother.id);

    expect(child.familyId).toBeDefined();

    const family = world.families[child.familyId!];

    expect(family.memberIds).toContain(child.id);
    expect(family.memberIds).toContain(mother.id);
    expect(family.memberIds).toContain(father.id);

    expect(Object.keys(world.relationships).length).toBeGreaterThan(0);
  });
});