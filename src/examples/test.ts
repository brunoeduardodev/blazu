import { fibonacci, sum } from "../..";

const nativeFibonacci = (steps: number) => {
  let a = 0;
  let b = 1;
  for (let i = 0; i < steps; i++) {
    const c = a + b;
    a = b;
    b = c;
  }

  return b;
};

const ITERATIONS = 1_000_000;
const STEPS = 10000;

const run = async () => {
  console.time("rust fibonacci");
  for (let i = 0; i < ITERATIONS; i++) {
    fibonacci(STEPS);
  }
  console.timeEnd("rust fibonacci");

  console.time("native fibonacci");
  for (let i = 0; i < ITERATIONS; i++) {
    nativeFibonacci(STEPS);
  }
  console.timeEnd("native fibonacci");
};

run();
