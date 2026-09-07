import { createWorld, createPersonAtBirth, advanceYears } from "./core/engine";
import { saveWorld } from "./core/save";
import { ageInYears, MINUTES_PER_YEAR } from "./core/time";

function main(): void {
  const world = createWorld("dev-seed-001");

  const person = createPersonAtBirth(world, {
    firstName: "Asha",
    lastName: "Verma",
    sex: "female",
    birthCountry: "IND",
  });

  console.log("Starting life simulation...");
  console.log("");

  advanceYears(world, 90);

  const worldYear = Math.floor(world.worldTime / MINUTES_PER_YEAR);

  console.log(`World year: ${worldYear}`);
  console.log(
    `${person.identity.firstName} ${person.identity.lastName}`
  );
  console.log(`Age: ${person.lifecycle.ageYears}`);
  console.log(`Alive: ${person.lifecycle.alive}`);
  console.log(`Life stage: ${person.lifecycle.stage}`);
  console.log("");

  console.log("Timeline:");

  for (const entry of person.timeline) {
    const age = ageInYears(entry.worldTime, person.identity.birthDate);
    const description = entry.description ? ` — ${entry.description}` : "";
    console.log(`Age ${age}: ${entry.title}${description}`);
  }

  console.log("");
  console.log(`Total events logged: ${world.eventLog.length}`);

  const save = saveWorld(world);
  console.log(`Save file size: ${save.length} characters`);
}

main();