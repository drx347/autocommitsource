import readline from 'readline';

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

function isValidGitUrl(url) {
  return (
    /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+(?:\.git)?$/i.test(url) ||
    /^git@github\.com:[\w.-]+\/[\w.-]+(?:\.git)?$/i.test(url)
  );
}

async function askRepoUrl(rl) {
  while (true) {
    const answer = await question(rl, 'Masukkan link repo GitHub yang mau di-auto commit\n\n> ');

    if (isValidGitUrl(answer)) {
      return answer;
    }

    console.log('\nLink repo tidak valid. Contoh: https://github.com/user/repo.git atau git@github.com:user/repo.git\n');
  }
}

async function askCommitCount(rl) {
  while (true) {
    const answer = await question(rl, '\nMau berapa commit?\n\n> ');
    const commitCount = Number(answer);

    if (!Number.isInteger(commitCount) || commitCount <= 0) {
      console.log('\nInput harus angka bulat lebih dari 0.');
      continue;
    }

    return commitCount;
  }
}

async function askBranchName(rl) {
  const answer = await question(rl, '\nBranch yang mau dipakai?\n(default: main)\n\n> ');
  return answer.length > 0 ? answer : 'main';
}

async function askShouldPush(rl, forcedSkipPush) {
  if (forcedSkipPush) {
    return false;
  }

  while (true) {
    const answer = await question(rl, '\nMau langsung push ke repo tersebut? (y/n)\n(default: y)\n\n> ');
    const normalized = answer.toLowerCase();

    if (normalized === '' || normalized === 'y' || normalized === 'yes') {
      return true;
    }

    if (normalized === 'n' || normalized === 'no') {
      return false;
    }

    console.log('\nJawab dengan y atau n.');
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
