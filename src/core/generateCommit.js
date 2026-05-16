import fs from 'fs';
import path from 'path';
import simpleGit from 'simple-git';

const git = simpleGit();
const dataFilePath = path.resolve('commits', 'data.txt');

const commitMessages = [
  'update activity log',
  'refresh commit data',
  'record bot progress',
  'sync generated changes',
  'save daily progress',
  'update contribution data',
];

function getRandomCommitMessage(commitNumber) {
  const randomIndex = Math.floor(Math.random() * commitMessages.length);
  return `Auto Commit ${commitNumber} - ${commitMessages[randomIndex]}`;
}

function getRandomDelay() {
  return Math.floor(Math.random() * 2000) + 1000;
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function updateCommitFile(commitNumber) {
  const timestamp = new Date().toISOString();
  const content = `Commit ke-${commitNumber} dibuat pada ${timestamp}\n`;

  fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
  fs.appendFileSync(dataFilePath, content, 'utf8');
}

export async function generateCommit(commitNumber, totalCommits, options = {}) {
  updateCommitFile(commitNumber);

  const message = getRandomCommitMessage(commitNumber);

  try {
    await git.add('.');
    await git.commit(message);

    if (!options.skipPush) {
      await git.push('origin', 'main');
    }

    const status = options.skipPush ? 'Commit lokal berhasil' : 'Commit berhasil';
    console.log(`[${commitNumber}/${totalCommits}] ${status} - ${message}`);
  } catch (error) {
    console.error(`[${commitNumber}/${totalCommits}] Commit gagal`);
    console.error(`Pesan error: ${error.message}`);
    throw new Error('Git push atau commit gagal. Periksa remote, branch main, dan koneksi GitHub.');
  }

  if (commitNumber < totalCommits) {
    const delay = getRandomDelay();
    console.log(`Menunggu ${(delay / 1000).toFixed(1)} detik...\n`);
    await wait(delay);
  }
}
