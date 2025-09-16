# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the documentation repository for Alloy, a Rust Ethereum development library. The repository contains:

- **Vocs documentation site** (`vocs/`) - Main documentation built with Vocs framework
- **Example code** (`lib/examples/`) - Rust examples demonstrating Alloy usage as a git submodule
- **Generated content** - Auto-generated documentation from examples

## Development Commands

### Documentation Development
```bash
# Install dependencies and run development server
cd vocs && bun install && bun dev

# Build documentation
cd vocs && bun build

# Preview built documentation  
cd vocs && bun preview
```

### Example Development
```bash
# Run a specific example
cd lib/examples && cargo run --example <example_name>

# Run all examples (filtered for working ones)
cd lib/examples && ./scripts/run.sh

# Check Rust code
cd lib/examples && cargo check

# Run clippy linter
cd lib/examples && cargo clippy

# Run tests
cd lib/examples && cargo test
```

### Content Updates
```bash
# Update examples submodule and regenerate documentation
./scripts/update.sh
```

## Architecture

### Documentation Structure
- `vocs/docs/pages/` - All documentation content in MDX/Markdown format
- `vocs/docs/snippets/` - Code snippets copied from examples repository
- `vocs/docs/pages/templates/` - Template files for generated example documentation
- `vocs/docs/pages/examples/` - Auto-generated example documentation (DO NOT EDIT directly)
- `vocs/sidebar.tsx` - Navigation structure configuration

### Content Generation Flow
1. Examples are maintained in `lib/examples/examples/` (git submodule)
2. Running `./scripts/update.sh`:
   - Updates the examples submodule
   - Copies examples to `vocs/docs/snippets/`
   - Generates MDX files in `vocs/docs/pages/examples/`
   - Uses templates from `vocs/docs/pages/templates/` for structure
3. Generated files include automatic GitHub source links

### Submodules
- `lib/examples/` is a git submodule pointing to https://github.com/alloy-rs/examples
- Update with: `git submodule update --recursive --remote`
- Clone repository with: `git clone --recurse-submodules`

## Important Notes

### Editing Guidelines
- **Documentation changes**: Edit files in `vocs/docs/pages/` directly
- **Example changes**: Modify code in `lib/examples/`, then run `./scripts/update.sh`
- **Template changes**: Edit files in `vocs/docs/pages/templates/`, then run `./scripts/update.sh`
- **Generated files**: Never edit files in `vocs/docs/pages/examples/` - they will be overwritten

### Technical Details
- Use `bun` as the package manager for the Vocs documentation site
- Examples in `lib/examples/scripts/run.sh` are filtered to exclude those requiring external dependencies
- **API Changes**: As of v1.0+, `on_*` provider methods are deprecated - use `connect_*` alternatives (e.g., `on_http` → `connect_http`)

### Development Workflow
1. For documentation updates: Edit MDX files and preview with `cd vocs && bun dev`
2. For example updates: Modify examples, run `./scripts/update.sh`, then rebuild docs
3. For new sections: Add entries to navigation in `vocs/sidebar.tsx`