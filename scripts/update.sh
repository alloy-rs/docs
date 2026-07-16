#!/usr/bin/env bash

# Exit if anything fails
set -eo pipefail

# Utilities
GREEN="\033[00;32m"
YELLOW="\033[00;33m"

function log () {
  echo -e "$1"
  echo "################################################################################"
  echo "#### $2 "
  echo "################################################################################"
  echo -e "\033[0m"
}

# Cloned examples should be moved here from `lib/examples/examples`
SNIPPETS_PATH="./vocs/docs/snippets"
# MDX Snippets path
MDX_SNIPPETS_PATH="./vocs/docs/pages/examples"
# Templates path
MDX_TEMPLATES_PATH="./vocs/docs/templates"
# Sidebar items TS file
SIDEBAR_ITEMS_PATH="./vocs/example-items.ts"
# Examples checkout. Set EXAMPLES_SOURCE to generate from another local checkout.
EXAMPLES_SOURCE="${EXAMPLES_SOURCE:-./lib/examples}"

# This script will do the following:
#
# 1. Update the submodules.
# 2. Generate markdown files for each example in the `lib/examples` repository
# and store them in the `./vocs/docs/pages/examples` directory. The markdown files will contain
# the example code and instructions on how to run the example.
# 3. Print any differences between the current and updated example files list.
function main () {
  log "$GREEN" "Updating..."

  # Change directory to project root
  SCRIPT_PATH="$( cd "$( dirname "$0" )" >/dev/null 2>&1 && pwd )"
  cd "$SCRIPT_PATH/.." || exit

  # Update the bundled examples checkout unless an explicit source was supplied.
  if [[ "$EXAMPLES_SOURCE" == "./lib/examples" ]]; then
    git submodule update --init --recursive --remote
    git -C "$EXAMPLES_SOURCE" switch main
    git -C "$EXAMPLES_SOURCE" pull --ff-only origin main
  fi

  if [[ ! -d "$EXAMPLES_SOURCE/examples" ]]; then
    echo "Examples source not found: $EXAMPLES_SOURCE/examples" >&2
    exit 1
  fi

  # Create the $SNIPPETS_PATH directory if it doesn't exist
  mkdir -p "$SNIPPETS_PATH"

  # Create the $MDX_SNIPPETS_PATH directory if it doesn't exist
  mkdir -p "$MDX_SNIPPETS_PATH"

  # Store the current example files list for comparison.
  CURRENT_EXAMPLE_FILES=$(find "$SNIPPETS_PATH" -type f | sort)

  # Replace only generated example categories so removed or renamed examples cannot remain while
  # hand-maintained snippet groups (for example, installation) stay intact.
  echo "Copying examples to $SNIPPETS_PATH"
  for GENERATED_CATEGORY in "$MDX_SNIPPETS_PATH"/*/; do
    [ -d "$GENERATED_CATEGORY" ] || continue
    rm -rf "${SNIPPETS_PATH:?}/$(basename "$GENERATED_CATEGORY")"
  done
  cp -r "$EXAMPLES_SOURCE"/examples/* "$SNIPPETS_PATH/"
  
  log "$GREEN" "Copied examples to $SNIPPETS_PATH"

  # Get the commit hash of the latest commit in the examples repository
  EXAMPLES_COMMIT_HASH=$(git -C "$EXAMPLES_SOURCE" rev-parse HEAD)

  # Clean up existing examples
  echo "Cleaning up existing examples"
  rm -rf "${MDX_SNIPPETS_PATH:?}/"*

  # Create the $MDX_SNIPPETS_PATH directory if it doesn't exist
  mkdir -p "$MDX_SNIPPETS_PATH"

  # Create example markdown files
  for CODE_DIRPATH in "$EXAMPLES_SOURCE"/examples/*/; do
    # Get the example category directory name
    EXAMPLE_DIRNAME=$(basename "$CODE_DIRPATH")
    PACKAGE_NAME=$(sed -n 's/^name = "\([^"]*\)"/\1/p' "$CODE_DIRPATH/Cargo.toml" | head -n 1)

    if [[ -z "$PACKAGE_NAME" ]]; then
      echo "Package name not found in $CODE_DIRPATH/Cargo.toml" >&2
      exit 1
    fi

    # Populate the $MDX_SNIPPETS_PATH directory with the example category directory
    mkdir -p "$MDX_SNIPPETS_PATH/$EXAMPLE_DIRNAME"

    # Populate the $MDX_TEMPLATES_PATH directory with the example category directory if it doesn't exist
    mkdir -p "$MDX_TEMPLATES_PATH/$EXAMPLE_DIRNAME"
    touch "$MDX_TEMPLATES_PATH/$EXAMPLE_DIRNAME/README.mdx"
    cp "$MDX_TEMPLATES_PATH/$EXAMPLE_DIRNAME/README.mdx" "$MDX_SNIPPETS_PATH/$EXAMPLE_DIRNAME/README.mdx"

    # For every example file in the examples directory
    # - Create a markdown file in the $MDX_SNIPPETS_PATH directory
    # - Insert the example code by reference in the markdown file
    # - Include the template content by pointer if it exists
    for EXAMPLE_FILEPATH in "$CODE_DIRPATH"examples/*.rs; do
      EXAMPLE_FILENAME=$(basename "$EXAMPLE_FILEPATH" .rs)
      # The sed expression is intentionally single-quoted so backticks stay literal.
      # shellcheck disable=SC2016
      EXAMPLE_SUMMARY=$(
        awk '
          /^\/\/!/ {
            sub(/^\/\/![[:space:]]*/, "")
            if ($0 == "" && seen) exit
            if ($0 != "") {
              printf "%s%s", separator, $0
              separator = " "
              seen = 1
            }
            next
          }
          { exit }
          END { print "" }
        ' "$EXAMPLE_FILEPATH" \
          | sed -E 's/\[([^]]+)\]\([^)]*\)/\1/g; s/\[`([^`]+)`\]/\1/g; s/`([^`]*)`/\1/g'
      )
      MDX_TEMPLATE_FILEPATH="$MDX_TEMPLATES_PATH/$EXAMPLE_DIRNAME/README.mdx"
      EXAMPLE_README_MDX=$MDX_SNIPPETS_PATH/$EXAMPLE_DIRNAME/README.mdx
      MDX_SNIPPET=$MDX_SNIPPETS_PATH/$EXAMPLE_DIRNAME/$EXAMPLE_FILENAME.mdx

      if [[ -z "$EXAMPLE_SUMMARY" ]]; then
        echo "Example is missing a leading //! summary: $EXAMPLE_FILEPATH" >&2
        exit 1
      fi

      if ! grep -Fq "](/examples/$EXAMPLE_DIRNAME/$EXAMPLE_FILENAME)" "$MDX_TEMPLATE_FILEPATH"; then
        echo "Example is missing from $MDX_TEMPLATE_FILEPATH: $EXAMPLE_FILENAME" >&2
        exit 1
      fi

      
      # Include the template content pointer if the template exists
      TEMPLATE_CONTENT=$(
        [ -f "$MDX_TEMPLATE_FILEPATH" ] && \
        printf "%s\n\n%s\n" \
          "import Template from '../../../templates/$EXAMPLE_DIRNAME/README.mdx'" \
          "<Template />" || \
        echo ""
      )

      # Write the template content to the example readme file
      echo "Creating $EXAMPLE_README_MDX"
      echo "$TEMPLATE_CONTENT" > "$EXAMPLE_README_MDX"

      echo "Creating $MDX_SNIPPET"

# Create the markdown file for the example
cat << EOF > "$MDX_SNIPPET"
---
description: >-
  $EXAMPLE_SUMMARY
---

{/*DO NOT EDIT THIS FILE. IT IS GENERATED BY RUNNING \`./scripts/update.sh\`
ANY CHANGES MADE TO THIS FILE WILL BE OVERWRITTEN
EDIT OR CREATE THIS TEMPLATE INSTEAD: $MDX_TEMPLATE_FILEPATH
LATEST UPDATE: https://github.com/alloy-rs/examples/tree/$EXAMPLES_COMMIT_HASH
*/}

## Example: \`$EXAMPLE_FILENAME\`

To run this example:

- Clone the [examples](https://github.com/alloy-rs/examples) repository: \`git clone git@github.com:alloy-rs/examples.git\`
- Run: \`cargo run --locked -p $PACKAGE_NAME --example $EXAMPLE_FILENAME\`

\`\`\`rust
// [!include ~/snippets/$EXAMPLE_DIRNAME/examples/$(basename "$EXAMPLE_FILEPATH")]
\`\`\`

Find the source code on Github [here](https://github.com/alloy-rs/examples/tree/$EXAMPLES_COMMIT_HASH/examples/$EXAMPLE_DIRNAME/examples/$EXAMPLE_FILENAME.rs).
EOF
    done
  done

  # Duplicate specific examples that symlink to other examples
  cp $MDX_SNIPPETS_PATH/contracts/deploy_from_contract.mdx $MDX_SNIPPETS_PATH/sol-macro/contract.mdx

  # Generate sidebar items TS file
  echo "Generating sidebar items at $SIDEBAR_ITEMS_PATH"

  # Header of the TS file
  cat << 'EOF' > "$SIDEBAR_ITEMS_PATH"
// DO NOT EDIT THIS FILE. ANY CHANGES MADE TO THIS FILE WILL BE OVERWRITTEN.

import type { SidebarItem } from "./types";

export const exampleItems: SidebarItem[] = [
EOF

  # For each template directory (category)
  for TEMPLATE_DIR in "$MDX_TEMPLATES_PATH"/*/; do
    [ -d "$TEMPLATE_DIR" ] || continue
    EXAMPLE_DIRNAME=$(basename "$TEMPLATE_DIR")
    README_FILE="$TEMPLATE_DIR/README.mdx"

    # Skip if there's no README template yet
    [ -f "$README_FILE" ] || continue

    # Generate section label
    SECTION_LABEL=$(grep -m1 '^## ' "$README_FILE" | sed 's/^##[[:space:]]*//')

    # Start section block
    printf "    { text: '%s', collapsed: true, link: '/examples/%s/README', items: [\n" \
      "$SECTION_LABEL" "$EXAMPLE_DIRNAME" >> "$SIDEBAR_ITEMS_PATH"

    # Parse bullet list lines: - [Title](/examples/.../file)
    while IFS= read -r line; do
      # Require lines that start with "- [" to avoid false positives
      if [[ "$line" == "- ["* ]]; then
        trimmed="${line#- }"
        title_part="${trimmed#\[}"
        TEXT="${title_part%%]*}"
        link_part="${trimmed#*](/}"
        LINK="/${link_part%%)*}"
        ESCAPED_TEXT=${TEXT//\'/\\\'}
        printf "        { text: '%s', link: '%s' },\n" \
          "$ESCAPED_TEXT" "$LINK" >> "$SIDEBAR_ITEMS_PATH"
      fi
    done < <(cat "$README_FILE"; echo)

    # Close section block
    echo "    ]}," >> "$SIDEBAR_ITEMS_PATH"
  done

  # Footer of the TS file
  echo "]" >> "$SIDEBAR_ITEMS_PATH"

  # Match the current example files list with the updated example files list
  # If there are differences, print them
  UPDATED_EXAMPLE_FILES=$(find "$SNIPPETS_PATH" -type f | sort)
  diff <(echo "$CURRENT_EXAMPLE_FILES") <(echo "$UPDATED_EXAMPLE_FILES") || true

  log "$YELLOW" "Update \`./vocs/docs/templates/*/README.mdx\` if necessary!"

  log "$GREEN" "Done"
}

# Run the main function
# This prevents partial execution in case of incomplete downloads
main
