import assert from "node:assert/strict";
import test from "node:test";
import { createShuffleBag } from "../app/activityRandomizer.ts";

function seededRandom(seed: number) {
  let state = seed >>> 0;

  return (maxExclusive: number) => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state % maxExclusive;
  };
}

test("each cycle contains every activity exactly once", () => {
  const randomInt = seededRandom(20260727);

  for (let cycle = 0; cycle < 1_000; cycle += 1) {
    const bag = createShuffleBag(6, null, randomInt);
    assert.deepEqual([...bag].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5]);
  }
});

test("a new cycle never starts with the previous result", () => {
  const randomInt = seededRandom(42);
  let previous: number | null = null;

  for (let cycle = 0; cycle < 1_000; cycle += 1) {
    const bag = createShuffleBag(6, previous, randomInt);
    assert.notEqual(bag[0], previous);
    previous = bag.at(-1)!;
  }
});
