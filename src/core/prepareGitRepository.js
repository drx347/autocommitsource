import fs from 'fs';
import path from 'path';
import simpleGit from 'simple-git';

function getRepoName(repoUrl) {
  const normalized = repoUrl.replace(/\.git$/i, '');
  return normalized.split(/[/:]/).pop();
}

function getRepoPath(repoUrl) {
  return path.resolve('target-repos', getRepoName(repoUrl));
}

async function hasConfigValue(git, key) {
  try {
    const value = await git.raw(['config', '--get', key]);
    return value.trim().length > 0;
  } catch {
    return false;
  }
}

async function ensureCommitIdentity(git) {
  const hasUserName = await hasConfigValue(git, 'user.name');
  const hasUserEmail = await hasConfigValue(git, 'user.email');

  if (!hasUserName) {
    await git.addConfig('user.name', 'Auto Commit Bot');
  }

  if (!hasUserEmail) {
    await git.addConfig('user.email', 'auto-commit-bot@example.com');
  }
}

async function ensureOrigin(git, repoUrl) {
  const remotes = await git.getRemotes(true);
  const origin = remotes.find((remote) => remote.name === 'origin');

  if (!origin) {
    await git.addRemote('origin', repoUrl);
    return;
  }

  if (origin.refs.fetch !== repoUrl) {
    await git.remote(['set-url', 'origin', repoUrl]);
  }
}

async function ensureBranch(git, branch) {
  try {
    await git.checkout(branch);
  } catch {
    await git.checkoutLocalBranch(branch);
  }
}

async function cloneRepository(repoUrl, repoPath) {
  const rootGit = simpleGit();

  fs.mkdirSync(path.dirname(repoPath), { recursive: true });
  console.log(`Clone repo ke: ${repoPath}`);
  await rootGit.clone(repoUrl, repoPath);
}

async function ensureLocalRepository(repoUrl, repoPath) {
  if (!fs.existsSync(repoPath)) {
    await cloneRepository(repoUrl, repoPath);
    return;
  }

  const git = simpleGit({ baseDir: repoPath });
  const isRepo = await git.checkIsRepo();

  if (!isRepo) {
    throw new Error(`Folder target sudah ada tapi bukan Git repository: ${repoPath}`);
  }

  console.log(`Repo lokal ditemukan: ${repoPath}`);
}

export async function prepareGitRepository({ repoUrl, branch }) {
  const repoPath = getRepoPath(repoUrl);

  await ensureLocalRepository(repoUrl, repoPath);

  const git = simpleGit({ baseDir: repoPath });

  await ensureOrigin(git, repoUrl);
  await ensureBranch(git, branch);
  await ensureCommitIdentity(git);

  return { repoPath };
}
