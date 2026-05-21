import fs from 'fs';
import path from 'path';
import simpleGit from 'simple-git';
import { colors, fail, label, success, theme } from './shell.js';

const commitMessages = [
  '@exotickic',
  'stress enggineer',
  'fuckstack dev',
  'cyber enthusiast',
  'backend enjoyers',
  'love it',
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

function formatTraceId(commitNumber, totalCommits) {
  const width = String(totalCommits).length;
  return `${String(commitNumber).padStart(width, '0')}/${String(totalCommits).padStart(width, '0')}`;
}

function progressBar(commitNumber, totalCommits, width = 18) {
  const filled = Math.max(1, Math.round((commitNumber / totalCommits) * width));
  return `${'#'.repeat(filled)}${'.'.repeat(width - filled)}`;
}

function logCommitStep(traceId, code, text, color = colors.cyan) {
  console.log(`${label(`TRACE ${traceId}`)} ${theme(`[${code}]`, color)} ${text}`);
}

function updateCommitFile(repoPath, commitNumber) {
  const timestamp = new Date().toISOString();
  const content = `Commit ${commitNumber} created at ${timestamp}\n`;
  const dataFilePath = path.resolve(repoPath, 'commits', 'data.txt');

  fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
  fs.appendFileSync(dataFilePath, content, 'utf8');
}

export async function generateCommit(commitNumber, totalCommits, options = {}) {
  const git = simpleGit({ baseDir: options.repoPath });
  const traceId = formatTraceId(commitNumber, totalCommits);
  const progress = progressBar(commitNumber, totalCommits);

  logCommitStep(traceId, 'PAYLOAD', theme('writing authorized commit artifact', colors.cyan));
  updateCommitFile(options.repoPath, commitNumber);

  const message = getRandomCommitMessage(commitNumber);

  try {
    logCommitStep(traceId, 'STAGE', theme('indexing workspace delta', colors.cyan));
    await git.add('.');

    logCommitStep(traceId, 'COMMIT', `${theme('sealing git object', colors.cyan)} ${theme('//', colors.dim)} ${message}`);
    await git.commit(message);

    if (options.shouldPush) {
      logCommitStep(traceId, 'SYNC', `${theme('opening verified origin channel', colors.cyan)} ${theme('//', colors.dim)} ${options.branch}`);
      await git.push('origin', options.branch);
    }

    const status = options.shouldPush ? 'remote sync complete' : 'local trace complete';
    console.log(`${label('OK')} ${theme(`[${progress}]`, colors.green)} ${success(status)} ${theme('//', colors.dim)} ${theme(message, colors.brightGreen)}\n`);
  } catch (error) {
    console.error(`${label(`TRACE ${traceId}`)} ${fail('workflow interrupted')}`);
    console.error(`${theme('Error message:', colors.red)} ${error.message}`);
    throw new Error(`Git commit or push failed. Check the repository, remote origin, branch ${options.branch}, and GitHub connection.`);
  }

  if (commitNumber < totalCommits) {
    const delay = getRandomDelay();
    console.log(`${label('COOLDOWN')} ${theme('throttling next authorized trace', colors.dim)} ${theme('//', colors.dim)} ${(delay / 1000).toFixed(1)}s\n`);
    await wait(delay);
  }
}
