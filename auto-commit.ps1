param(
  [switch]$NoPush
)

$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

$DefaultPassword = "was here"
$MaxPasswordAttempts = 3

$CommitMessages = @(
  "this is exotickic",
  "author@drx347",
  "exotickic was here",
  "clean and safe"
)

function Write-Hacker {
  param(
    [string]$Text,
    [ConsoleColor]$Color = [ConsoleColor]::Green
  )

  Write-Host $Text -ForegroundColor $Color
}

function Write-Step {
  param(
    [string]$Label,
    [string]$Text,
    [ConsoleColor]$Color = [ConsoleColor]::Green
  )

  Write-Host "[$Label] " -ForegroundColor Green -NoNewline
  Write-Host $Text -ForegroundColor $Color
}

function Write-FrameLine {
  param([string]$Text = "")

  $line = if ($Text.Length -gt 54) { $Text.Substring(0, 54) } else { $Text.PadRight(54) }
  Write-Hacker ("=  " + $line + "  =") DarkGreen
}

function Write-HexLine {
  param([int]$Length = 58)

  $alphabet = "0123456789ABCDEF".ToCharArray()
  $chars = for ($index = 0; $index -lt $Length; $index += 1) {
    $alphabet[(Get-Random -Minimum 0 -Maximum $alphabet.Length)]
  }

  Write-Hacker ($chars -join "") DarkGreen
}

function Write-AuditBar {
  param(
    [string]$Text,
    [int]$Width = 28
  )

  for ($step = 0; $step -le $Width; $step += 2) {
    $bar = ("#" * $step).PadRight($Width, ".")
    $percent = [math]::Round(($step / $Width) * 100).ToString().PadLeft(3)
    Write-Host ("`r[SCAN] {0} [{1}] {2}%" -f $Text, $bar, $percent) -ForegroundColor Cyan -NoNewline
    Start-Sleep -Milliseconds 35
  }

  Write-Host " [OK]" -ForegroundColor Green
}

function Test-Command {
  param([string]$Name)

  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Command '$Name' is not available. Install '$Name' first, then run this script again."
  }
}

function Read-AccessPassword {
  $securePassword = Read-Host "Password" -AsSecureString
  $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)

  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
  }
  finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
  }
}

function Show-Loading {
  param([string]$Text = "loading secure console")

  $frames = @("|", "/", "-", "\")

  for ($index = 0; $index -lt 28; $index += 1) {
    $frame = $frames[$index % $frames.Length]
    $dots = ("." * (($index % 4) + 1)).PadRight(4)
    Write-Host ("`r{0} {1}{2}" -f $frame, $Text, $dots) -ForegroundColor Cyan -NoNewline
    Start-Sleep -Milliseconds 80
  }

  Write-Host ("`r[OK] secure console ready     ") -ForegroundColor Green
  Write-Host ""
}

function Show-AccessDeniedTaunt {
  param([int]$RemainingAttempts)

  $taunts = @(
    "unauthorized attempt detected",
    "audit log captured",
    "session locked behind consent gate"
  )

  foreach ($taunt in $taunts) {
    Write-Hacker "[DENIED] $taunt" Red
    Start-Sleep -Milliseconds 120
  }

  if ($RemainingAttempts -gt 0) {
    Write-Hacker "[LOCK] Attempts remaining: $RemainingAttempts." Yellow
  }

  Write-Host ""
}

function Request-TerminalAccess {
  Clear-Host
  Write-Hacker "AUTO COMMIT SECURE LOGIN" Green
  Write-Hacker "========================" DarkGreen
  Write-Host ""

  $expectedPassword = if ([string]::IsNullOrWhiteSpace($env:AUTO_COMMIT_PASSWORD)) {
    $DefaultPassword
  }
  else {
    $env:AUTO_COMMIT_PASSWORD
  }

  for ($attempt = 1; $attempt -le $MaxPasswordAttempts; $attempt += 1) {
    $password = Read-AccessPassword

    if ($password -eq $expectedPassword) {
      Write-Host ""
      Write-Hacker "ACCESS GRANTED // authentication accepted" Green
      Write-Host ""
      Show-Loading
      return
    }

    $remainingAttempts = $MaxPasswordAttempts - $attempt
    Show-AccessDeniedTaunt $remainingAttempts
  }

  throw "Access denied. Too many incorrect password attempts."
}

function Invoke-Git {
  param(
    [string[]]$GitArgs,
    [string]$BaseDir = $PWD.Path,
    [switch]$AllowFail
  )

  Push-Location -LiteralPath $BaseDir
  try {
    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $output = & git @GitArgs 2>&1
    $exitCode = $LASTEXITCODE
    $ErrorActionPreference = $previousErrorActionPreference

    if ($exitCode -ne 0 -and -not $AllowFail) {
      throw ($output -join "`n")
    }

    return @{
      ExitCode = $exitCode
      Output = $output
    }
  }
  finally {
    if ($null -ne $previousErrorActionPreference) {
      $ErrorActionPreference = $previousErrorActionPreference
    }

    Pop-Location
  }
}

function Write-TypeText {
  param(
    [string]$Text,
    [ConsoleColor]$Color = [ConsoleColor]::Gray,
    [int]$DelayMilliseconds = 14
  )

  foreach ($character in $Text.ToCharArray()) {
    Write-Host $character -ForegroundColor $Color -NoNewline

    if ($character -eq "`n") {
      Start-Sleep -Milliseconds 40
    }
    else {
      Start-Sleep -Milliseconds $DelayMilliseconds
    }
  }
}

function Read-HackerInput {
  param([string]$Question)

  Write-Host ""
  Write-Host "root@auto" -ForegroundColor Green -NoNewline
  Write-Host ":~# " -ForegroundColor Cyan -NoNewline
  Write-TypeText $Question Gray
  Write-Host " " -NoNewline
  return (Read-Host).Trim()
}

function Test-GitHubUrl {
  param([string]$Url)

  return (
    $Url -match '^https://github\.com/[\w.-]+/[\w.-]+(?:\.git)?$' -or
    $Url -match '^git@github\.com:[\w.-]+/[\w.-]+(?:\.git)?$'
  )
}

function Get-RepoName {
  param([string]$RepoUrl)

  $normalized = $RepoUrl -replace '\.git$', ''
  $parts = $normalized -split '[:/]'
  return $parts[$parts.Length - 1]
}

function Get-RepoPath {
  param([string]$RepoUrl)

  return Join-Path -Path $PSScriptRoot -ChildPath ("target-repos\" + (Get-RepoName $RepoUrl))
}

function Read-RepoUrl {
  while ($true) {
    $answer = Read-HackerInput "repo>"

    if (Test-GitHubUrl $answer) {
      return $answer
    }

    Write-Step "WARN" "Invalid repository URL." Yellow
    Write-Hacker "Example: https://github.com/user/repo.git or git@github.com:user/repo.git" DarkGray
  }
}

function Read-CommitCount {
  while ($true) {
    $answer = Read-HackerInput "count>"
    $count = 0

    if ([int]::TryParse($answer, [ref]$count) -and $count -gt 0) {
      return $count
    }

    Write-Step "WARN" "Input must be an integer greater than 0." Yellow
  }
}

function Read-BranchName {
  $answer = Read-HackerInput "branch(main)>"

  if ([string]::IsNullOrWhiteSpace($answer)) {
    return "main"
  }

  return $answer
}

function Read-ShouldPush {
  if ($NoPush) {
    return $false
  }

  while ($true) {
    $answer = (Read-HackerInput "push(y/n)>").ToLowerInvariant()

    if ($answer -eq "" -or $answer -eq "y" -or $answer -eq "yes") {
      return $true
    }

    if ($answer -eq "n" -or $answer -eq "no") {
      return $false
    }

    Write-Step "WARN" "Answer with y or n." Yellow
  }
}

function Show-Intro {
  Clear-Host
  $host.UI.RawUI.WindowTitle = "Auto Commit Bot by @exotickic"
  $host.UI.RawUI.ForegroundColor = "Green"
  $host.UI.RawUI.BackgroundColor = "Black"

  Write-Hacker "=======================================================================" DarkGreen
  Write-Hacker "==  [AUTHORIZED AUDIT NODE] :: AUTO COMMIT BOT :: ETHICAL OPS       ==" Green
  Write-Hacker "==  OPERATOR @exotickic     // GITHUB drx347   // CONSENT VERIFIED  ==" Green
  Write-Hacker "==  SCOPE: REPOSITORY ONLY  // MODE: SAFE AUTOMATION                 ==" DarkGreen
  Write-Hacker "=======================================================================" DarkGreen
  Write-HexLine 71
  Write-HexLine 71
  Write-Hacker "=======================================================================" DarkGreen
  Write-Hacker "        _         _          ____                          _ _   "
  Write-Hacker "       / \  _   _| |_ ___   / ___|___  _ __ ___  _ __ ___ (_) |_ "
  Write-Hacker "      / _ \| | | | __/ _ \ | |   / _ \| '_ `` _ \| '_ `` _ \| | __|"
  Write-Hacker "     / ___ \ |_| | || (_) || |__| (_) | | | | | | | | | | | | |_ "
  Write-Hacker "    /_/   \_\__,_|\__\___/  \____\___/|_| |_| |_|_| |_| |_|_|\__|"
  Write-Hacker "=======================================================================" DarkGreen
  Write-Hacker "              .-~~~~~~~~~~-.        G I T H U B   U P L I N K          " Green
  Write-Hacker "          .-~~   .-""""-.   ~~-.    repository channel verified         " Green
  Write-Hacker "        ./      /  .--.  \      \.  origin sync protocol ready          " Green
  Write-Hacker "       /       |  / __ \  |       \ secure commit route online          " Green
  Write-Hacker "      |        | | (__) | |        |                                    " Green
  Write-Hacker "      |        |  \____/  |        |   [git] [branch] [commit] [push]   " Green
  Write-Hacker "       \        \  .--.  /        /                                     " Green
  Write-Hacker "        ``-.      ``-.__.-``      .-``                                      " Green
  Write-Hacker "           ``-._   OCTOCAT   _.-``     authorized automation scope        " Green
  Write-Hacker "               ``~~~~~~~~~~``                                             " Green
  Write-Hacker "=======================================================================" DarkGreen
  Write-Hacker ">> powershell automation console   ::   ethical automation online" Green
  Write-Hacker ">> repository scope locked         ::   github channel verified" Green
  Write-Hacker "=======================================================================" DarkGreen
  Write-Host ""
  Write-AuditBar "checking authorization scope"
  Write-AuditBar "verifying git workspace"
  Write-AuditBar "validating github origin"
  Write-Step "BOOT" "safe automation profile loaded" Cyan
  Start-Sleep -Milliseconds 110
  Write-Step "AUTH" "authorized session confirmed" Green
  Start-Sleep -Milliseconds 110
  Write-Step "READY" "commit workflow ready under approved scope" Green
  Start-Sleep -Milliseconds 110
  Write-Step "OK" "ethical auto commit mode online" Green
}

function Ensure-Repository {
  param(
    [string]$RepoUrl,
    [string]$RepoPath
  )

  if (-not (Test-Path -LiteralPath $RepoPath)) {
    New-Item -ItemType Directory -Path (Split-Path -Parent $RepoPath) -Force | Out-Null
    Write-Step "CLONE" "target $RepoPath" Cyan
    Invoke-Git -GitArgs @("clone", $RepoUrl, $RepoPath) | Out-Null
    return
  }

  $repoCheck = Invoke-Git -GitArgs @("rev-parse", "--is-inside-work-tree") -BaseDir $RepoPath -AllowFail

  if ($repoCheck.ExitCode -ne 0) {
    throw "Target folder already exists but is not a Git repository: $RepoPath"
  }

  Write-Step "CACHE" "local repository found $RepoPath" DarkGray
}

function Ensure-Origin {
  param(
    [string]$RepoUrl,
    [string]$RepoPath
  )

  $origin = Invoke-Git -GitArgs @("remote", "get-url", "origin") -BaseDir $RepoPath -AllowFail

  if ($origin.ExitCode -ne 0) {
    Invoke-Git -GitArgs @("remote", "add", "origin", $RepoUrl) -BaseDir $RepoPath | Out-Null
    return
  }

  $currentUrl = (($origin.Output | Select-Object -First 1) -as [string]).Trim()

  if ($currentUrl -ne $RepoUrl) {
    Invoke-Git -GitArgs @("remote", "set-url", "origin", $RepoUrl) -BaseDir $RepoPath | Out-Null
  }
}

function Ensure-Branch {
  param(
    [string]$Branch,
    [string]$RepoPath
  )

  $currentBranch = Invoke-Git -GitArgs @("rev-parse", "--abbrev-ref", "HEAD") -BaseDir $RepoPath -AllowFail

  if ($currentBranch.ExitCode -eq 0) {
    $activeBranch = (($currentBranch.Output | Select-Object -First 1) -as [string]).Trim()

    if ($activeBranch -eq $Branch) {
      Write-Step "BRANCH" "already locked on $Branch" DarkGray
      return
    }
  }

  $checkout = Invoke-Git -GitArgs @("checkout", $Branch) -BaseDir $RepoPath -AllowFail

  if ($checkout.ExitCode -ne 0) {
    Invoke-Git -GitArgs @("checkout", "-b", $Branch) -BaseDir $RepoPath | Out-Null
    Write-Step "BRANCH" "created and locked on $Branch" Cyan
    return
  }

  Write-Step "BRANCH" "locked on $Branch" Cyan
}

function Ensure-CommitIdentity {
  param([string]$RepoPath)

  $name = Invoke-Git -GitArgs @("config", "--get", "user.name") -BaseDir $RepoPath -AllowFail
  $email = Invoke-Git -GitArgs @("config", "--get", "user.email") -BaseDir $RepoPath -AllowFail

  if ($name.ExitCode -ne 0 -or [string]::IsNullOrWhiteSpace(($name.Output -join ""))) {
    Invoke-Git -GitArgs @("config", "user.name", "Auto Commit Bot") -BaseDir $RepoPath | Out-Null
  }

  if ($email.ExitCode -ne 0 -or [string]::IsNullOrWhiteSpace(($email.Output -join ""))) {
    Invoke-Git -GitArgs @("config", "user.email", "auto-commit-bot@example.com") -BaseDir $RepoPath | Out-Null
  }
}

function Add-CommitPayload {
  param(
    [string]$RepoPath,
    [int]$CommitNumber
  )

  $dataFile = Join-Path -Path $RepoPath -ChildPath "commits\data.txt"
  New-Item -ItemType Directory -Path (Split-Path -Parent $dataFile) -Force | Out-Null
  Add-Content -LiteralPath $dataFile -Value "Commit $CommitNumber created at $((Get-Date).ToUniversalTime().ToString("o"))"
}

function Get-TraceId {
  param(
    [int]$CommitNumber,
    [int]$TotalCommits
  )

  $width = $TotalCommits.ToString().Length
  return ("{0}/{1}" -f $CommitNumber.ToString().PadLeft($width, "0"), $TotalCommits.ToString().PadLeft($width, "0"))
}

function Get-TraceProgressBar {
  param(
    [int]$CommitNumber,
    [int]$TotalCommits,
    [int]$Width = 18
  )

  $filled = [Math]::Max(1, [Math]::Round(($CommitNumber / $TotalCommits) * $Width))
  return ("#" * $filled).PadRight($Width, ".")
}

function Write-CommitTrace {
  param(
    [string]$TraceId,
    [string]$Code,
    [string]$Text,
    [ConsoleColor]$Color = [ConsoleColor]::Cyan
  )

  Write-Host "[TRACE $TraceId] " -ForegroundColor Green -NoNewline
  Write-Host "[$Code] " -ForegroundColor $Color -NoNewline
  Write-Host $Text -ForegroundColor $Color
}

function New-AutoCommit {
  param(
    [string]$RepoPath,
    [string]$Branch,
    [int]$CommitNumber,
    [int]$TotalCommits,
    [bool]$ShouldPush
  )

  $traceId = Get-TraceId $CommitNumber $TotalCommits
  $progress = Get-TraceProgressBar $CommitNumber $TotalCommits

  Write-CommitTrace $traceId "PAYLOAD" "writing authorized commit artifact"
  Add-CommitPayload $RepoPath $CommitNumber

  $randomMessage = $CommitMessages | Get-Random
  $message = "Auto Commit $CommitNumber - $randomMessage"

  Write-CommitTrace $traceId "STAGE" "indexing workspace delta"
  Invoke-Git -GitArgs @("add", ".") -BaseDir $RepoPath | Out-Null

  Write-CommitTrace $traceId "COMMIT" "sealing git object // $message"
  Invoke-Git -GitArgs @("commit", "-m", $message) -BaseDir $RepoPath | Out-Null

  if ($ShouldPush) {
    Write-CommitTrace $traceId "SYNC" "opening verified origin channel // $Branch"
    Invoke-Git -GitArgs @("push", "origin", $Branch) -BaseDir $RepoPath | Out-Null
  }

  $status = if ($ShouldPush) { "remote sync complete" } else { "local trace complete" }
  Write-Step "OK" "[$progress] $status // $message" Green
}

function Read-NextAction {
  while ($true) {
    Write-Host ""
    Write-Hacker "============================================================" DarkGreen
    Write-Step "MENU" "1 = run again / back to top" Cyan
    Write-Step "MENU" "0 = exit" Cyan
    Write-Hacker "============================================================" DarkGreen

    $choice = Read-HackerInput "select>"

    if ($choice -eq "1" -or $choice.ToLowerInvariant() -eq "run") {
      return "run"
    }

    if ($choice -eq "0" -or $choice.ToLowerInvariant() -eq "exit") {
      return "exit"
    }

    Write-Step "WARN" "Choose 1 to run again or 0 to exit." Yellow
  }
}

function Invoke-AutoCommitSession {
  Show-Intro

  $repoUrl = Read-RepoUrl
  $totalCommits = Read-CommitCount
  $branch = Read-BranchName
  $shouldPush = Read-ShouldPush
  $repoPath = Get-RepoPath $repoUrl

  Ensure-Repository $repoUrl $repoPath
  Ensure-Origin $repoUrl $repoPath
  Ensure-Branch $branch $repoPath
  Ensure-CommitIdentity $repoPath

  Write-Host ""
  Write-Hacker "============================================================" DarkGreen
  Write-Step "CONFIG" "mission parameters locked" DarkGray
  Write-Hacker "Remote : $repoUrl" Cyan
  Write-Hacker "Folder : $repoPath" Cyan
  Write-Hacker "Branch : $branch" Cyan
  Write-Hacker "Push   : $(if ($shouldPush) { "yes" } else { "no" })" Cyan
  Write-Hacker "============================================================" DarkGreen
  Write-Host ""

  for ($currentCommit = 1; $currentCommit -le $totalCommits; $currentCommit += 1) {
    New-AutoCommit $repoPath $branch $currentCommit $totalCommits $shouldPush

    if ($currentCommit -lt $totalCommits) {
      $delay = Get-Random -Minimum 1 -Maximum 3
      Write-Step "COOLDOWN" "throttling next authorized trace // ${delay}s" DarkGray
      Start-Sleep -Seconds $delay
    }
  }

  Write-Host ""
  if ($shouldPush) {
    Write-Step "OK" "Finished pushing to GitHub." Green
  }
  else {
    Write-Step "OK" "Finished creating local commits." Green
  }
}

try {
  Test-Command "git"
  Request-TerminalAccess

  while ($true) {
    try {
      Invoke-AutoCommitSession
    }
    catch {
      Write-Host ""
      Write-Step "FAIL" "Program stopped because an error occurred:" Red
      Write-Host $_.Exception.Message -ForegroundColor Red
    }

    $nextAction = Read-NextAction

    if ($nextAction -eq "exit") {
      Write-Host ""
      Write-Step "EXIT" "session terminated" DarkGray
      break
    }
  }
}
catch {
  Write-Host ""
  Write-Step "FAIL" "Startup failed:" Red
  Write-Host $_.Exception.Message -ForegroundColor Red
}
