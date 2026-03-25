# Release

## Android APK
- https://expo.dev/artifacts/eas/miDXJoSaDsFpxW9CNtPFi6.apk

## OTA
- Branch: `preview`
- Update Group: `67746444-221c-402f-b634-2ed83f06c171`
- Dashboard: https://expo.dev/accounts/ckken/projects/cliproxyplus-mobile/updates/67746444-221c-402f-b634-2ed83f06c171

## Commands

### Build
```bash
npx eas-cli@latest build --profile preview
```

### OTA update
```bash
npx eas-cli@latest update --branch preview --message "preview update"
```
