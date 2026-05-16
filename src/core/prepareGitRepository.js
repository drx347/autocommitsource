import simpleGit from 'simple-git';

const git = simpleGit();

async function hasConfigValue(key) {
  try {
    const value = await git.raw(['config', '--get', key]);
    return value.trim().length > 0;
  } catch {
    return false;
  }
}

async function ensureCommitIdentity() {
  const hasUserName = await hasConfigValue('user.name');
  const hasUserEmail = await hasConfigValue('user.email');

  if (!hasUserName) {
    await git.addConfig('user.name', 'Auto Commit Bot');
  }

  if (!hasUserEmail) {
    await git.addConfig('user.email', 'auto-commit-bot@example.com');
  }
}

async function ensureMainBranch() {
  await git.raw(['branch', '-M', 'main']);
}

async function hasOriginRemote() {
  const remotes = await git.getRemotes(true);
  return remotes.some((remote) => remote.name === 'origin');
}

export async function prepareGitRepository({ skipPush = false } = {}) {
  const isRepo = await git.checkIsRepo();

  if (!isRepo) {
    console.log('Git repository belum ada. Membuat repository lokal...');
    await git.init();
  }

  await ensureMainBranch();
  await ensureCommitIdentity();

  if (!skipPush && !(await hasOriginRemote())) {
    throw new Error(
      'Remote origin belum diset. Jalankan: git remote add origin <URL_REPOSITORY_GITHUB>, lalu coba lagi. Untuk tes lokal gunakan: npm run local'
    );
  }
}
