export type RandomInt = (maxExclusive: number) => number;

export function secureRandomInt(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive < 1) {
    throw new RangeError("maxExclusive must be a positive integer");
  }

  const range = 0x1_0000_0000;
  const limit = Math.floor(range / maxExclusive) * maxExclusive;
  const values = new Uint32Array(1);

  do {
    crypto.getRandomValues(values);
  } while (values[0] >= limit);

  return values[0] % maxExclusive;
}

export function createShuffleBag(
  size: number,
  previous: number | null = null,
  randomInt: RandomInt = secureRandomInt,
): number[] {
  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError("size must be a positive integer");
  }

  const bag = Array.from({ length: size }, (_, index) => index);

  for (let index = bag.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [bag[index], bag[swapIndex]] = [bag[swapIndex], bag[index]];
  }

  if (size > 1 && previous !== null && bag[0] === previous) {
    const swapIndex = 1 + randomInt(size - 1);
    [bag[0], bag[swapIndex]] = [bag[swapIndex], bag[0]];
  }

  return bag;
}
