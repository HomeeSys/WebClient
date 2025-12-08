# Environment Variables Setup

This project uses environment variables to configure backend service URLs for different environments.

## Environment Files

- `.env.development` - Used when running `npm run dev` (local development)
- `.env.production` - Used when running `npm run build` (production build for Azure)
- `.env.example` - Template file (not used by the app, just for reference)

## Available Variables

```
VITE_DEVICES_URL         - Devices service URL (port 6061)
VITE_MEASUREMENTS_URL    - Measurements service URL (port 6062)
VITE_RAPORTS_URL         - Raports service URL (port 6063)
VITE_EMULATORS_URL       - Emulators service URL (port 6064)
```

## Usage

### Development (Local)
The `.env.development` file is already configured for localhost:
```
VITE_DEVICES_URL=https://localhost:6061
VITE_MEASUREMENTS_URL=https://localhost:6062
VITE_RAPORTS_URL=https://localhost:6063
VITE_EMULATORS_URL=https://localhost:6064
```

Run with: `npm run dev`

### Production (Azure)
Update `.env.production` with your Azure URLs:
```
VITE_DEVICES_URL=https://your-azure-app.azurewebsites.net:6061
VITE_MEASUREMENTS_URL=https://your-azure-app.azurewebsites.net:6062
VITE_RAPORTS_URL=https://your-azure-app.azurewebsites.net:6063
VITE_EMULATORS_URL=https://your-azure-app.azurewebsites.net:6064
```

Build with: `npm run build`

## Important Notes

1. **VITE_ Prefix**: All environment variables must be prefixed with `VITE_` to be accessible in the application
2. **Rebuild Required**: Changes to environment files require a rebuild/restart of the dev server
3. **Security**: Never commit `.env.production` with real credentials to version control
4. **Access in Code**: Use `import.meta.env.VITE_VARIABLE_NAME` to access variables

## Git Configuration

Add to `.gitignore` (if not already present):
```
.env.local
.env.*.local
```

Keep `.env.development`, `.env.production`, and `.env.example` in version control for team consistency.
