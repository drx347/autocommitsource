# Auto Commit Bot

A Node.js script for creating automated commits to GitHub based on the repository URL entered by the user.

A side project by @exotickic.

```text
============================================================
=                    AUTO COMMIT BOT                       =
=                                                          =
=   Author : @exotickic                                    =
=   GitHub : drx347                                        =
=   Mode   : GitHub Commit Injector                        =
============================================================
```

## Node.js Setup

```bash
npm install
```

## Run

```bash
npm start
```

## Run with PowerShell on Windows

The easiest way on Windows:

```text
Double-click auto-commit.bat
```

Local mode without push:

```text
Double-click auto-commit-local.bat
```

Or run it manually from PowerShell:

```powershell
.\auto-commit.ps1
```

The PowerShell script runs directly with PowerShell and Git on the device, without needing to open the Node.js terminal flow.
The device only needs Git and GitHub access for the target repository.

Or through npm:

```powershell
npm run powershell
```

Local mode without push through PowerShell:

```powershell
.\auto-commit.ps1 -NoPush
```

Or:

```powershell
npm run powershell:local
```

If PowerShell blocks the script because of the execution policy, run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\auto-commit.ps1
```

The program will ask for input:

```text
Enter the GitHub repository URL to auto commit

> https://github.com/username/repository-name.git

How many commits do you want?

> 50

Which branch should be used?
(default: main)

> main

Push directly to this repository? (y/n)
(default: y)

> y
```

The bot will clone the repository into the `target-repos/` folder. Each commit updates `commits/data.txt` inside the target repository, runs `git add .`, creates a commit with a random message, then pushes to the selected branch.

Make sure the Git account on the computer has push access to that repository. For private repositories, use HTTPS with saved credentials/token or an SSH URL such as `git@github.com:user/repo.git`.

## Local Test Without Push

```bash
npm run local
```

This mode still asks for a repository URL and creates local commits in the cloned repository, but it does not run `git push`.

Author: @drx347
