# Dotenvx Plugin Examples

## Basic Configuration

```json
{
  "plugins": {
    "@orcdkestrator/dotenvx": {
      "enabled": true
    }
  }
}
```

## With Validation

```json
{
  "plugins": {
    "@orcdkestrator/dotenvx": {
      "enabled": true,
      "config": {
        "envFile": ".env.production",
        "validation": {
          "required": ["API_KEY", "DATABASE_URL", "JWT_SECRET"],
          "optional": ["DEBUG", "LOG_LEVEL"]
        }
      }
    }
  }
}
```

## With Encryption

```json
{
  "plugins": {
    "@orcdkestrator/dotenvx": {
      "enabled": true,
      "config": {
        "envFile": ".env.encrypted",
        "decrypt": true
      }
    }
  }
}
```

## Environment File Example

```bash
# .env.production
API_KEY=sk-1234567890
DATABASE_URL=postgresql://user:pass@localhost/db
JWT_SECRET=super-secret-key
DEBUG=false
```
