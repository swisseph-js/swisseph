# GitHub Workflows

## Publishing Workflow

The `publish.yml` workflow automates publishing npm packages to the registry.

### Setup

1. **Create an npm access token:**
   - Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Create a new "Automation" token
   - Copy the token

2. **Add the token as a GitHub secret:**
   - Go to your repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste your npm token
   - Click "Add secret"

### Usage

#### Manual Trigger

1. Go to Actions → "Publish Packages" → "Run workflow"
2. Select which package(s) to publish:
   - `core` - Publishes only @swisseph/core
   - `node` - Publishes @swisseph/core and @swisseph/node (in order)
   - `browser` - Publishes @swisseph/core and @swisseph/browser (in order)
   - `all` - Publishes all packages in the correct order
3. (Optional) Specify a version bump:
   - Leave empty to use current version in package.json
   - Use `patch`, `minor`, or `major` for semantic versioning
   - Use a specific version like `1.2.3` to set an exact version
4. Click "Run workflow"

#### Automatic Trigger on Release

The workflow automatically runs when you:
- Create a GitHub Release
- Push a git tag

In both cases, it publishes all packages.

### Publishing Order

The workflow ensures packages are published in the correct dependency order:
1. `@swisseph/core` (no dependencies)
2. `@swisseph/node` (depends on core)
3. `@swisseph/browser` (depends on core)

### Notes

- The workflow automatically handles dependency order (core is always published first if needed)
- Emscripten is automatically set up for browser builds
- All packages are published with `--access public`
- Version bumps are applied without creating git tags (use `--no-git-tag-version`)

