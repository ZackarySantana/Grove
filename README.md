# Grove

Streamline your Evergreen experience and become an Evergreen super user.

## Features

-   View your recent patches across projects, your current project's versions (aka mainline commits), or your open patches

    -   Perform different actions
        -   Restart, clone, abort, configure the patch
        -   Open on the UI
        -   Checkout the commit the patch is based on
    -   View different information
        -   Status
        -   Created/Finished dates
    -   View detailed information (and copy them by clicking!)
        -   Patch id
        -   Commit hash
        -   Requester
    -   Access the tasks of a Patch
        -   View the task's status, logs, execution, task id
        -   Open on the UI
        -   Restart or abort the task
    -   View which files and the amount of change to the files
        -   Click the file name to be taken to the file
    -   ![Recent Patches](media/features/recent_patches.png)

-   Create a patch
    -   Define custom patch commands or walkthrough and create a patch
-   Configure patches and finalize them to versions (aka they will now run the tasks)

### TBA

-   Duplicate patches
-   Learn more pages (welcome page when you install?)
-   Evergreen test parsing

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
-   `grove.customPatches`: A list of custom patch commands.
    -   Default: []
    -   Items:
        -   Label: The label of the custom patch command.
        -   Command: The custom patch command itself (e.g. `evergreen patch -u`)
    -   Common use-cases are regex or specific tasks/variants in a patch command, and the flag "-f" to finalize the patch to a version. Do `evergreen patch --help` to find out what other flags you can add to your command.

## Publishing

Install

```
npm install -g @vscode/vsce
```

Run

```
vsce package
vsce publish
```

## Known Issues

When configuring a patch, the corresponding version will not update for a while- so the view may not show more information like the tasks.

## Release Notes

### 1.1.0

Added features X, Y, and Z.

### 1.0.1

Fixed issue #.

### 1.0.0

Initial release of ...
