import { askQuestions } from './core/askQuestions.js';
import { generateCommit } from './core/generateCommit.js';
import { prepareGitRepository } from './core/prepareGitRepository.js';

async function main() {
  const forcedSkipPush = process.argv.includes('--no-push');

  console.log('Auto Commit Bot');
  console.log('================\n');

  const answers = await askQuestions({ forcedSkipPush });

  const target = await prepareGitRepository({
    repoUrl: answers.repoUrl,
    branch: answers.branch,
  });

  console.log('\nKonfigurasi');
  console.log(`Remote : ${answers.repoUrl}`);
  console.log(`Folder : ${target.repoPath}`);
  console.log(`Branch : ${answers.branch}`);
  console.log(`Push   : ${answers.shouldPush ? 'ya' : 'tidak'}\n`);

  for (let currentCommit = 1; currentCommit <= answers.totalCommits; currentCommit += 1) {
    await generateCommit(currentCommit, answers.totalCommits, {
      repoPath: target.repoPath,
      branch: answers.branch,
      shouldPush: answers.shouldPush,
    });
  }

  console.log(answers.shouldPush ? '\nSelesai push ke GitHub.' : '\nSelesai membuat commit lokal.');
}

main().catch((error) => {
  console.error('\nProgram berhenti karena terjadi error:');
  console.error(error.message);
  process.exitCode = 1;
});
