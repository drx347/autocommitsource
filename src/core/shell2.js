import readline from 'readline';
import { colors, promptPrefix, theme, warn } from './shell.js';

const TYPE_DELAY = 14;

function createPrompt() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function question(rl, text) {
  return new Promise((resolve) => {
    rl.question(text, (answer) => resolve(answer.trim()));
  });
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function typeText(text, delay = TYPE_DELAY) {
  if (!process.stdout.isTTY) {
    process.stdout.write(text);
    return;
  }

  for (const character of text) {
    process.stdout.write(character);
    await wait(character === '\n' ? 40 : delay);
  }
}

async function typeQuestion(rl, text) {
  process.stdout.write(promptPrefix());
  await typeText(text);
  return question(rl, '');
}

function isValidGitUrl(url) {
  return (
    /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+(?:\.git)?$/i.test(url) ||
    /^git@github\.com:[\w.-]+\/[\w.-]+(?:\.git)?$/i.test(url)
  );
}

async function askRepoUrl(rl) {
  while (true) {
    const answer = await typeQuestion(rl, 'Enter the GitHub repository URL to auto commit\n\n> ');

    if (isValidGitUrl(answer)) {
      return answer;
    }

    console.log(`\n${warn('Invalid repository URL.')}`);
    console.log(`${theme('Example:', colors.dim)} https://github.com/user/repo.git or git@github.com:user/repo.git\n`);
  }
}

async function askCommitCount(rl) {
  while (true) {
    const answer = await typeQuestion(rl, '\nHow many commits do you want?\n\n> ');
    const commitCount = Number(answer);

    if (!Number.isInteger(commitCount) || commitCount <= 0) {
      console.log(`\n${warn('Input must be an integer greater than 0.')}`);
      continue;
    }

    return commitCount;
  }
}

async function askBranchName(rl) {
  const answer = await typeQuestion(rl, '\nWhich branch should be used?\n(default: main)\n\n> ');
  return answer.length > 0 ? answer : 'main';
}

async function askShouldPush(rl, forcedSkipPush) {
  if (forcedSkipPush) {
    return false;
  }

  while (true) {
    const answer = await typeQuestion(rl, '\nPush directly to this repository? (y/n)\n(default: y)\n\n> ');
    const normalized = answer.toLowerCase();

    if (normalized === '' || normalized === 'y' || normalized === 'yes') {
      return true;
    }

    if (normalized === 'n' || normalized === 'no') {
      return false;
    }

    console.log(`\n${warn('Answer with y or n.')}`);
  }
}

export async function askQuestions({ forcedSkipPush = false } = {}) {
  const rl = createPrompt();

  try {
    const repoUrl = await askRepoUrl(rl);
    const totalCommits = await askCommitCount(rl);
    const branch = await askBranchName(rl);
    const shouldPush = await askShouldPush(rl, forcedSkipPush);

    return {
      repoUrl,
      totalCommits,
      branch,
      shouldPush,
    };
  } finally {
    rl.close();
  }
}
