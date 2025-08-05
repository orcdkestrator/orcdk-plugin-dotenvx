/* eslint-disable no-console */
import { Plugin, PluginConfig, OrcdkConfig, EnvironmentConfig, EventBus, EventTypes, OrcdkEvent } from '@orcdkestrator/core';

/**
 * Dotenvx plugin for environment variable management
 * Uses configuration-based environment detection instead of hardcoded "local"
 */
export class DotenvxPlugin implements Plugin {
  public readonly name = '@orcdkestrator/orcdk-plugin-dotenvx';
  public readonly version = '1.0.0';
  
  private config: PluginConfig | null = null;
  private orcdkConfig: OrcdkConfig | null = null;
  private requiredVariables: string[] = [];
  private eventBus: EventBus | null = null;

  /**
   * Initialize plugin with configuration
   */
  async initialize(config: PluginConfig, orcdkConfig: OrcdkConfig): Promise<void> {
    this.config = config;
    this.orcdkConfig = orcdkConfig;
    
    // Extract required variables from plugin config
    this.requiredVariables = (config.config?.requiredVariables as string[]) || [
      'CDK_ACCOUNT',
      'CDK_ENVIRONMENT', 
      'CDK_DOMAIN'
    ];
    
    // Subscribe to events
    this.eventBus = EventBus.getInstance();
    this.subscribeToEvents();
  }
  
  /**
   * Subscribe to relevant events
   */
  private subscribeToEvents(): void {
    if (!this.eventBus) return;
    
    // Listen for pattern detection event to setup environment
    this.eventBus.on(EventTypes['orchestrator:before:pattern-detection'], async () => {
      await this.setupEnvironment();
    });
    
    // Listen for error events
    this.eventBus.on(EventTypes['plugin:error'], (event: unknown) => {
      const typedEvent = event as OrcdkEvent<{ error: Error; context: string }>;
      const { error, context } = typedEvent.data;
      console.error(`[dotenvx] Error in ${context}:`, error.message);
    });
  }

  /**
   * Setup environment variables based on current environment
   */
  private async setupEnvironment(): Promise<void> {
    if (!this.orcdkConfig) {
      throw new Error('Plugin not initialized');
    }

    const currentEnv = process.env.CDK_ENVIRONMENT;
    if (!currentEnv) {
      throw new Error('CDK_ENVIRONMENT not set');
    }

    const envConfig = this.orcdkConfig.environments[currentEnv];
    if (!envConfig) {
      const available = Object.keys(this.orcdkConfig.environments).join(', ');
      throw new Error(`Environment '${currentEnv}' not found in configuration. Available: ${available}`);
    }

    // Configuration-based local environment detection
    const isLocalEnvironment = envConfig.isLocal;

    if (isLocalEnvironment) {
      await this.setupLocalEnvironment(currentEnv);
    } else {
      await this.setupCloudEnvironment(currentEnv);
    }

    // Validate required variables are present
    await this.validateRequiredVariables(isLocalEnvironment);
  }

  /**
   * Setup local environment using dotenvx
   */
  private async setupLocalEnvironment(environment: string): Promise<void> {
    try {
      // Dynamically import dotenvx to avoid requiring it for cloud environments
      const dotenvx = await import('@dotenvx/dotenvx');
      
      // Load environment-specific .env file
      const envFile = `.env.${environment}`;
      
      dotenvx.config({
        path: envFile,
        override: false, // Don't override existing environment variables
      });
      
      console.log(`[dotenvx] Loaded environment variables from ${envFile}`);
    } catch (error) {
      console.warn(`[dotenvx] Failed to load .env file for local environment:`, error);
      // Don't throw - allow validation to catch missing variables
    }
  }

  /**
   * Setup cloud environment (no .env file loading)
   */
  private async setupCloudEnvironment(environment: string): Promise<void> {
    console.log(`[dotenvx] Cloud environment '${environment}' detected - using system environment variables`);
    // In cloud environments, variables are provided by the deployment system
    // No .env file loading needed
  }

  /**
   * Validate required environment variables
   */
  private async validateRequiredVariables(isLocal: boolean): Promise<void> {
    const missingVariables: string[] = [];

    for (const variable of this.requiredVariables) {
      if (!process.env[variable]) {
        missingVariables.push(variable);
      }
    }

    if (missingVariables.length > 0) {
      const suggestion = isLocal 
        ? `Please ensure your .env.${process.env.CDK_ENVIRONMENT} file contains:`
        : 'Please ensure the following environment variables are set:';
      
      const errorMessage = [
        `Missing required environment variables:`,
        ...missingVariables.map(v => `  - ${v}`),
        '',
        suggestion,
        ...missingVariables.map(v => `  ${v}=<value>`),
      ].join('\n');

      throw new Error(errorMessage);
    }

    console.log(`[dotenvx] All required variables validated ✓`);
  }

  /**
   * Get current environment configuration
   */
  private getCurrentEnvironmentConfig(): EnvironmentConfig | null {
    if (!this.orcdkConfig) {
      return null;
    }

    const currentEnv = process.env.CDK_ENVIRONMENT;
    return currentEnv ? (this.orcdkConfig.environments[currentEnv] || null) : null;
  }

  /**
   * Cleanup plugin resources
   */
  async cleanup(): Promise<void> {
    // Unsubscribe from events
    if (this.eventBus) {
      this.eventBus.removeAllListeners(EventTypes['orchestrator:before:pattern-detection']);
      this.eventBus.removeAllListeners(EventTypes['plugin:error']);
    }
  }
}

// Export as default for easy importing
export default DotenvxPlugin;