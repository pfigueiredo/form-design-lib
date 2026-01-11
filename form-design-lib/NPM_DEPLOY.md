# NPM Deployment Guide

This guide outlines the steps to publish `form-design-lib` to npm.

## Pre-Deployment Checklist

- [x] ✅ Build succeeds without errors
- [x] ✅ TypeScript compilation passes
- [x] ✅ All tests pass
- [x] ✅ package.json is properly configured
- [x] ✅ README.md is up-to-date
- [x] ✅ LICENSE file exists
- [x] ✅ .npmignore is configured
- [x] ✅ Bundle sizes are documented

## Current Package Configuration

- **Name**: `form-design-lib`
- **Version**: `1.0.0`
- **License**: `GPL-2.0`
- **Author**: Pedro Figueiredo (pedro@t3k.pt)
- **Repository**: https://github.com/pfigueiredo/form-design-lib

## Bundle Sizes (Production Build)

- **ES Module**: ~82.65 KB (uncompressed) / ~18.74 KB (gzipped)
- **UMD**: ~52.66 KB (uncompressed) / ~15.42 KB (gzipped)
- **CSS**: ~14.45 KB (uncompressed) / ~2.70 KB (gzipped)

## Deployment Steps

### 1. Verify Build

```bash
cd form-design-lib
npm run build
```

### 2. Test Package Contents

```bash
npm pack --dry-run
```

This will show what files will be included in the published package.

### 3. Login to npm

```bash
npm login
```

You'll need:
- npm username
- npm password (or access token)
- Email address

### 4. Verify Package Name Availability

The package name `form-design-lib` should be available. If it's taken, you'll need to:
- Choose a different name
- Update `package.json` with the new name
- Update all documentation

### 5. Publish to npm

**For first release:**
```bash
npm publish --access public
```

**For subsequent releases:**
```bash
# Update version in package.json first
npm version patch  # for bug fixes (1.0.0 -> 1.0.1)
npm version minor  # for new features (1.0.0 -> 1.1.0)
npm version major  # for breaking changes (1.0.0 -> 2.0.0)

# Then publish
npm publish
```

### 6. Verify Publication

After publishing, verify the package is available:

```bash
npm view form-design-lib
```

Or visit: https://www.npmjs.com/package/form-design-lib

## Post-Deployment

1. **Update GitHub Releases**: Create a release tag matching the npm version
2. **Update Documentation**: Update any documentation that references the version
3. **Announce**: Share the release on social media, forums, etc.

## Troubleshooting

### Package name already taken
- Choose a scoped package: `@pfigueiredo/form-design-lib`
- Update `package.json` name field
- Publish with: `npm publish --access public`

### Authentication errors
- Use `npm login` to authenticate
- Or use an access token: `npm config set //registry.npmjs.org/:_authToken YOUR_TOKEN`

### Build errors
- Ensure all TypeScript errors are fixed
- Run `npm run build` locally first
- Check that all dependencies are in `devDependencies` (not `dependencies`)

## Notes

- The package uses **GPL-2.0** license, which requires derivative works to also be GPL-2.0
- For commercial licensing, contact: pedro@t3k.pt
- The package is configured for **public** access (anyone can install it)
