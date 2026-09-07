import { describe, expect, it } from "vitest";
import { createWorld, createPersonAtBirth, advanceYears } from "../src/core/engine";
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
    expect(person.timeline.some((entry) => entry.title === "Started school")).toBe(true);
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
});