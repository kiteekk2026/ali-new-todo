import { expect, it } from 'vitest';

it('demonstrates a failing required CI check for S5', () => {
  expect(false, 'Intentional failure for the merge gate demonstration').toBe(true);
});
