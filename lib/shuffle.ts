import { randomInt } from "node:crypto";

export function secureShuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Teams are fours; any remainder becomes one final smaller team (1–3).
export function makeTeams<T>(items: T[]): T[][] {
  const shuffled = secureShuffle(items);
  const teams: T[][] = [];
  for (let i = 0; i < shuffled.length; i += 4) teams.push(shuffled.slice(i, i + 4));
  return teams;
}
