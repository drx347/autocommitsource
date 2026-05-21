import { askQuestions } from './core/shell2.js';
import { generateCommit } from './core/generateCommit.js';
import { prepareGitRepository } from './core/prepareGitRepository.js';
import { requestTerminalAccess, showTerminalIntro } from './core/terminalI.js';
import { colors, fail, label, success, theme } from './core/hackerTheme.js';

async function main() {
  const forcedSkipPush = process.argv.includes('--no-push');

  await requestTerminalAccess();
  await showTerminalIntro();

  const answers = await askQuestions({ forcedSkipPush });

  const target = await prepareGitRepository({
    repoUrl: answers.repoUrl,
    branch: answers.branch,
  });

  console.log(`\n${label('CONFIG')} ${theme('mission parameters locked', colors.dim)}`);
  console.log(`${theme('Remote', colors.cyan)} : ${answers.repoUrl}`);
  console.log(`${theme('Folder', colors.cyan)} : ${target.repoPath}`);
  console.log(`${theme('Branch', colors.cyan)} : ${answers.branch}`);
  console.log(`${theme('Push', colors.cyan)}   : ${answers.shouldPush ? 'yes' : 'no'}\n`);

  for (let currentCommit = 1; currentCommit <= answers.totalCommits; currentCommit += 1) {
    await generateCommit(currentCommit, answers.totalCommits, {
      repoPath: target.repoPath,
      branch: answers.branch,
      shouldPush: answers.shouldPush,
    });
  }

  console.log(answers.shouldPush ? `\n${success('Finished pushing to GitHub.')}` : `\n${success('Finished creating local commits.')}`);
}

main().catch((error) => {
  console.error(`\n${fail('Program stopped because an error occurred:')}`);
  console.error(error.message);
  process.exitCode = 1;
});
