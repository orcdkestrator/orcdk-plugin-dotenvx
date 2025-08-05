import { DotenvxPlugin } from '../index';

describe('DotenvxPlugin', () => {
  it('should be defined', () => {
    expect(DotenvxPlugin).toBeDefined();
  });

  it('should have correct name', () => {
    const plugin = new DotenvxPlugin();
    expect(plugin.name).toBe('@orcdkestrator/orcdk-plugin-dotenvx');
  });
});
