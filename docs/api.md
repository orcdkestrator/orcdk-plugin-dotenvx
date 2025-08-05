# Dotenvx Plugin API Reference

## Plugin Configuration

```typescript
interface DotenvxConfig {
  enabled: boolean;
  envFile?: string;
  decrypt?: boolean;
  validation?: {
    required?: string[];
    optional?: string[];
  };
}
```

## Lifecycle Hooks

### `beforeConfigGeneration`
Loads and validates environment variables before CDK configuration is generated.

### `onError`
Handles environment loading errors and provides helpful error messages.

## Methods

### `initialize(config: PluginConfig, orcdkConfig: OrcdkConfig): Promise<void>`
Initializes the plugin with configuration.

### `loadEnvironment(): Promise<void>`
Loads environment variables from the specified file using dotenvx.

### `validateEnvironment(): void`
Validates that all required environment variables are present.

### `decryptEnvironment(): Promise<void>`
Decrypts environment file if encryption is enabled.
