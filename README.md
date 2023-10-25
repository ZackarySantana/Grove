# Grove

Streamline your Evergreen experience and become an Evergreen super user.

## Features

-   View your recent patches ![Recent Patches](media/features/recent_patches.png)
-   View your project's versions (aka Mainline commits) ![Project Versions](media/features/mainline_versions.png)
-   View your open patches ![Open Patches](media/features/open_patches.png)

### TBA

-   Evergreen test parsing
-   View failed tests

## Requirements

The only requirements to run this is VSCode and a proper Evergreen environment.

## Extension Settings

This extension contributes the following settings:

-   `grove.config`: The local of your config.
    -   Default: `prod`
    -   Options:
        -   `prod`: `~/.evergreen.yml`
        -   `staging`: `~/.evergreen-staging.yml`
        -   `local`: `~/.evergreen-local.yml`
    -   Anything other than the options will be parsed as a file path.

## Known Issues

We are bugless :)

## Release Notes

### 1.1.0

Added features X, Y, and Z.

### 1.0.1

Fixed issue #.

### 1.0.0

Initial release of ...
