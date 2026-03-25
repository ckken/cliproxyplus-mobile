# Testing

## Manual test checklist

### Login
- Base URL: `https://x.empjs.dev`
- Password: `ck666666`
- Expect dashboard to load

### Overview
- Pull to refresh works
- Cards render total requests / failed requests / tokens / latest version

### Settings
- Toggle request-log
- Toggle debug
- Toggle ws-auth
- Toggle force-model-prefix
- Update request-retry
- Update max-retry-interval
- Update routing strategy
- Update proxy-url

### Logs
- Main logs should render if logging-to-file enabled
- Request error logs list should render

### Release artifacts
- APK installable from EAS artifact URL
- OTA visible in Expo dashboard preview branch
