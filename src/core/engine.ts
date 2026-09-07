import type { Person, ScheduledEvent, WorldState } from "./types";
import { createNewborn, type CreateNewbornInput } from "./person";
import { addTimeline, emitEvent } from "./world";
import { addYears, ageInYears } from "./time";
import { annualDeathProbability, lifeStageForAge } from "./lifecycle";
import { Rng } from "./rng";

export { createWorld } from "./world";

export interface CreatePersonAtBirthInput extends CreateNewbornInput {}

export function createPersonAtBirth(
  world: WorldState,
  input: CreatePersonAtBirthInput
): Person {
  const person = createNewborn(world, input);

  const event = emitEvent(world, {
    type: "PersonBorn",
    worldTime: world.worldTime,
    actorIds: [person.id],
    targetIds: [person.id],
    payload: {
      firstName: person.identity.firstName,
      lastName: person.identity.lastName,
      sex: person.identity.sex,
      country: person.identity.birthCountry,
    },
    causes: [],
  });

  addTimeline(
    person,
    event,
    "Birth",
    `${person.identity.firstName} ${person.identity.lastName} was born.`
  );

  return person;
}

export function killPerson(
  world: WorldState,
  person: Person,
  cause: string
): void {
  if (!person.lifecycle.alive) {
    return;
  }

  person.lifecycle.alive = false;
  person.lifecycle.deathDate = world.worldTime;
  person.lifecycle.deathCause = cause;

  const event = emitEvent(world, {
    type: "PersonDied",
    worldTime: world.worldTime,
    actorIds: [person.id],
    targetIds: [person.id],
    payload: {
      cause,
      age: person.lifecycle.ageYears,
    },
    causes: [],
  });

  addTimeline(
    person,
    event,
    "Death",
    `${person.identity.firstName} died at age ${person.lifecycle.ageYears}.`
  );
}

export function scheduleEvent(
  world: WorldState,
  input: Omit<ScheduledEvent, "id">
): ScheduledEvent {
  const id = `scheduled_${world.counters.event++}`;

  const scheduled: ScheduledEvent = {
    id,
    ...input,
  };

  world.scheduledEvents.push(scheduled);
  return scheduled;
}

function processScheduledEvents(world: WorldState): void {
  world.scheduledEvents.sort(
    (a, b) => a.dueTime - b.dueTime || a.id.localeCompare(b.id)
  );

  const due = world.scheduledEvents.filter(
    (event) => event.dueTime <= world.worldTime
  );

  world.scheduledEvents = world.scheduledEvents.filter(
    (event) => event.dueTime > world.worldTime
  );

  for (const scheduled of due) {
    emitEvent(world, {
      type: scheduled.type,
      worldTime: world.worldTime,
      actorIds: scheduled.actorIds,
      targetIds: scheduled.targetIds,
      payload: scheduled.payload,
      causes: [],
    });
  }
}

export function advanceYears(world: WorldState, years: number): void {
  for (let i = 0; i < years; i++) {
    world.worldTime = addYears(world.worldTime, 1);
    processScheduledEvents(world);

    for (const person of Object.values(world.people)) {
      if (!person.lifecycle.alive) {
        continue;
      }

      const previousStage = person.lifecycle.stage;
      const age = ageInYears(world.worldTime, person.identity.birthDate);

      person.lifecycle.ageYears = age;

      const ageEvent = emitEvent(world, {
        type: "PersonAged",
        worldTime: world.worldTime,
        actorIds: [person.id],
        targetIds: [person.id],
        payload: {
          age,
        },
        causes: [],
      });

      const milestoneAges = [1, 5, 13, 18, 21, 40, 60, 65, 75, 85];

      if (milestoneAges.includes(age)) {
        addTimeline(
          person,
          ageEvent,
          `Age ${age}`,
          `${person.identity.firstName} turned ${age}.`
        );
      }

      if (age === 5) {
        const schoolEvent = emitEvent(world, {
          type: "StartedSchool",
          worldTime: world.worldTime,
          actorIds: [person.id],
          targetIds: [person.id],
          payload: {
            level: "primary",
          },
          causes: [ageEvent.id],
        });

        addTimeline(
          person,
          schoolEvent,
          "Started school",
          `${person.identity.firstName} began primary school.`
        );
      }

      if (age === 18) {
        const adultEvent = emitEvent(world, {
          type: "EnteredAdulthood",
          worldTime: world.worldTime,
          actorIds: [person.id],
          targetIds: [person.id],
          payload: {
            legalAge: true,
          },
          causes: [ageEvent.id],
        });

        addTimeline(
          person,
          adultEvent,
          "Entered adulthood",
          `${person.identity.firstName} reached legal adulthood.`
        );
      }

      const stage = lifeStageForAge(age);

      if (stage !== previousStage) {
        person.lifecycle.stage = stage;

        const stageEvent = emitEvent(world, {
          type: "LifeStageChanged",
          worldTime: world.worldTime,
          actorIds: [person.id],
          targetIds: [person.id],
          payload: {
            from: previousStage,
            to: stage,
          },
          causes: [ageEvent.id],
        });

        addTimeline(
          person,
          stageEvent,
          `Life stage: ${stage.replaceAll("_", " ")}`,
          `${person.identity.firstName} entered the ${stage.replaceAll(
            "_",
            " "
          )} stage of life.`
        );
      }

      const rng = new Rng(
        `${world.seed}:lifecycle:${person.id}:${world.worldTime}`
      );

      const deathProbability = annualDeathProbability(
        age,
        person.attributes.health
      );

      if (rng.chance(deathProbability)) {
        killPerson(world, person, "age and health related causes");
      }
    }
  }
}