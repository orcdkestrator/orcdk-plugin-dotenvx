import { DotEnvXPlugin } from '../index';

describe('DotEnvXPlugin', () => {
  it('should be defined', () => {
    expect(DotEnvXPlugin).toBeDefined();
  });

  it('should have correct name', () => {
    const plugin = new DotEnvXPlugin();
    expect(plugin.name).toBe('dotenvx');
  });
});
