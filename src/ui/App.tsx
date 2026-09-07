import { useState } from "react";

import {
  advanceYears,
  createAdult,
  createPersonAtBirth,
  createWorld,
} from "../core/engine";

import {
  createSpouse,
  getOtherPersonId,
  getRelationshipsForPerson,
} from "../core/relationships";

import { loadWorld, saveWorld } from "../core/save";
import { MINUTES_PER_YEAR } from "../core/time";

import type { RelationshipEdge, WorldState } from "../core/types";

interface GameState {
  world: WorldState;
  playerId: string;
}

function makeSeed(): string {
  return `life-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createNewGame(): GameState {
  const world = createWorld(makeSeed());

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

  const player = createPersonAtBirth(world, {
    firstName: "Asha",
    lastName: "Verma",
    sex: "female",
    birthCountry: "IND",
    parentIds: [mother.id, father.id],
  });

  return {
    world,
    playerId: player.id,
  };
}

function loadGame(): GameState | null {
  const json = localStorage.getItem("lifesim:world");

  if (!json) {
    return null;
  }

  try {
    const world = loadWorld(json);
    const firstPerson = Object.values(world.people)[0];

    if (!firstPerson) {
      return null;
    }

    return {
      world,
      playerId: firstPerson.id,
    };
  } catch {
    return null;
  }
}

function getPersonName(world: WorldState, personId: string): string {
  const person = world.people[personId];

  if (!person) {
    return personId;
  }

  return `${person.identity.firstName} ${person.identity.lastName}`;
}

function relationshipRole(
  relationship: RelationshipEdge,
  personId: string
): string {
  if (relationship.type === "parent_child") {
    return relationship.personB === personId ? "Parent" : "Child";
  }

  if (relationship.type === "sibling") {
    return "Sibling";
  }

  if (relationship.type === "spouse") {
    return "Spouse";
  }

  return relationship.type.replaceAll("_", " ");
}

export default function App() {
  const [game, setGame] = useState<GameState>(() => loadGame() ?? createNewGame());
  const [status, setStatus] = useState("Life simulation ready.");

  const person = game.world.people[game.playerId];

  if (!person) {
    return (
      <div className="app">
        <div className="panel">No active person found.</div>
      </div>
    );
  }

  function advance(years: number) {
    advanceYears(game.world, years);

    setGame({
      ...game,
      world: {
        ...game.world,
      },
    });

    setStatus(`Advanced ${years} year${years === 1 ? "" : "s"}.`);
  }

  function saveGame() {
    try {
      localStorage.setItem("lifesim:world", saveWorld(game.world));
      setStatus("Game saved to browser local storage.");
    } catch {
      setStatus("Save failed.");
    }
  }

  function loadSavedGame() {
    const loaded = loadGame();

    if (loaded) {
      setGame(loaded);
      setStatus("Save loaded.");
    } else {
      setStatus("No save found.");
    }
  }

  function newLife() {
    localStorage.removeItem("lifesim:world");
    setGame(createNewGame());
    setStatus("New life created.");
  }

  const worldYear = Math.floor(game.world.worldTime / MINUTES_PER_YEAR);
  const timeline = [...person.timeline].reverse();
  const relationships = getRelationshipsForPerson(game.world, person.id);

  const parents = person.familyRefs.parentIds;
  const siblings = person.familyRefs.siblingIds;
  const children = person.familyRefs.childIds;
  const spouses = person.familyRefs.spouseIds;

  return (
    <div className="app">
      <div className="header">
        <div>
          <div className="title">LifeSim</div>
          <div className="subtitle">
            Deterministic life simulation core — Milestone 0.3
          </div>
        </div>

        <div className="button-row">
          <button onClick={saveGame}>Save</button>
          <button onClick={loadSavedGame}>Load</button>
          <button onClick={newLife}>New Life</button>
        </div>
      </div>

      <div className="panel">
        <h2>Character</h2>

        <div className="grid">
          <div className="stat">
            <div className="stat-label">Name</div>
            <div className="stat-value">
              {person.identity.firstName} {person.identity.lastName}
            </div>
          </div>

          <div className="stat">
            <div className="stat-label">Age</div>
            <div className="stat-value">{person.lifecycle.ageYears}</div>
          </div>

          <div className="stat">
            <div className="stat-label">World Year</div>
            <div className="stat-value">{worldYear}</div>
          </div>

          <div className="stat">
            <div className="stat-label">Life Stage</div>
            <div className="stat-value">
              {person.lifecycle.stage.replaceAll("_", " ")}
            </div>
          </div>

          <div className="stat">
            <div className="stat-label">Status</div>
            <div className="stat-value">
              {person.lifecycle.alive ? (
                <span className="badge alive">Alive</span>
              ) : (
                <span className="badge dead">Dead</span>
              )}
            </div>
          </div>

          <div className="stat">
            <div className="stat-label">Health</div>
            <div className="stat-value">{person.attributes.health}</div>
          </div>

          <div className="stat">
            <div className="stat-label">Happiness</div>
            <div className="stat-value">{person.attributes.happiness}</div>
          </div>

          <div className="stat">
            <div className="stat-label">Stress</div>
            <div className="stat-value">{person.attributes.stress}</div>
          </div>
        </div>

        {!person.lifecycle.alive && (
          <p className="muted">
            Died at age {person.lifecycle.ageYears}
            {person.lifecycle.deathCause
              ? ` from ${person.lifecycle.deathCause}`
              : ""}
            .
          </p>
        )}
      </div>

      <div className="panel">
        <h2>Time Controls</h2>

        <div className="button-row">
          <button
            onClick={() => advance(1)}
            disabled={!person.lifecycle.alive}
          >
            Advance 1 Year
          </button>

          <button
            onClick={() => advance(5)}
            disabled={!person.lifecycle.alive}
          >
            Advance 5 Years
          </button>

          <button
            onClick={() => advance(10)}
            disabled={!person.lifecycle.alive}
          >
            Advance 10 Years
          </button>
        </div>

        <div className="status">{status}</div>
      </div>

      <div className="panel">
        <h2>Family</h2>

        <div className="grid">
          <div className="stat">
            <div className="stat-label">Parents</div>
            <div className="stat-value">
              {parents.length === 0 ? "None" : parents.length}
            </div>
          </div>

          <div className="stat">
            <div className="stat-label">Siblings</div>
            <div className="stat-value">
              {siblings.length === 0 ? "None" : siblings.length}
            </div>
          </div>

          <div className="stat">
            <div className="stat-label">Spouses</div>
            <div className="stat-value">
              {spouses.length === 0 ? "None" : spouses.length}
            </div>
          </div>

          <div className="stat">
            <div className="stat-label">Children</div>
            <div className="stat-value">
              {children.length === 0 ? "None" : children.length}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "14px" }}>
          {parents.length > 0 && (
            <div className="muted">
              Parents: {parents.map((id) => getPersonName(game.world, id)).join(", ")}
            </div>
          )}

          {siblings.length > 0 && (
            <div className="muted">
              Siblings: {siblings.map((id) => getPersonName(game.world, id)).join(", ")}
            </div>
          )}

          {spouses.length > 0 && (
            <div className="muted">
              Spouses: {spouses.map((id) => getPersonName(game.world, id)).join(", ")}
            </div>
          )}

          {children.length > 0 && (
            <div className="muted">
              Children: {children.map((id) => getPersonName(game.world, id)).join(", ")}
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <h2>Relationships</h2>

        {relationships.length === 0 && (
          <div className="muted">No relationships yet.</div>
        )}

        {relationships.map((relationship) => {
          const otherPersonId = getOtherPersonId(relationship, person.id);
          const otherPersonName = getPersonName(game.world, otherPersonId);

          return (
            <div key={relationship.id} className="timeline-item">
              <div className="timeline-title">
                {relationshipRole(relationship, person.id)}: {otherPersonName}
              </div>

              <div className="timeline-description">
                Type: {relationship.type.replaceAll("_", " ")}
              </div>

              <div className="timeline-description">
                Trust {relationship.axes.trust} · Affection {relationship.axes.affection} ·
                Conflict {relationship.axes.conflict}
              </div>
            </div>
          );
        })}
      </div>

      <div className="panel">
        <h2>Life Timeline</h2>

        <div className="timeline">
          {timeline.length === 0 && <div className="muted">No events yet.</div>}

          {timeline.map((entry) => (
            <div
              key={entry.eventId ?? `${entry.worldTime}-${entry.title}`}
              className="timeline-item"
            >
              <div className="timeline-title">{entry.title}</div>

              {entry.description && (
                <div className="timeline-description">{entry.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>Simulation Info</h2>

        <div className="grid">
          <div className="stat">
            <div className="stat-label">Seed</div>
            <div className="stat-value" style={{ fontSize: "14px" }}>
              {game.world.seed}
            </div>
          </div>

          <div className="stat">
            <div className="stat-label">Events Logged</div>
            <div className="stat-value">{game.world.eventLog.length}</div>
          </div>

          <div className="stat">
            <div className="stat-label">People</div>
            <div className="stat-value">
              {Object.keys(game.world.people).length}
            </div>
          </div>

          <div className="stat">
            <div className="stat-label">Relationships</div>
            <div className="stat-value">
              {Object.keys(game.world.relationships).length}
            </div>
          </div>

          <div className="stat">
            <div className="stat-label">Families</div>
            <div className="stat-value">
              {Object.keys(game.world.families).length}
            </div>
          </div>

          <div className="stat">
            <div className="stat-label">Households</div>
            <div className="stat-value">
              {Object.keys(game.world.households).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}