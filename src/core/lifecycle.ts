import type { LifeStage } from "./types";

export function lifeStageForAge(age: number): LifeStage {
  if (age < 2) return "infant";
  if (age < 13) return "child";
  if (age < 20) return "teen";
  if (age < 40) return "young_adult";
  if (age < 60) return "adult";
  if (age < 75) return "middle_age";
  return "senior";
}

export function annualDeathProbability(age: number, health: number): number {
  let base: number;

  // In this first prototype, childhood death is disabled so that
  // the basic life pipeline can be tested cleanly.
  // Later, this becomes a much richer health/lifecycle model.
  if (age < 18) {
    base = 0;
  } else if (age < 40) {
    base = 0.001;
  } else if (age < 60) {
    base = 0.004;
  } else if (age < 75) {
    base = 0.02;
  } else if (age < 85) {
    base = 0.06;
  } else {
    base = 0.16;
  }

  let healthFactor = 1;

  if (health < 20) {
    healthFactor = 2.5;
  } else if (health < 50) {
    healthFactor = 1.4;
  } else if (health > 80) {
    healthFactor = 0.7;
  }

  return Math.min(0.95, base * healthFactor);
}