import { askCommitCount } from './core/askCommitCount.js';
import { generateCommit } from './core/generateCommit.js';
import { prepareGitRepository } from './core/prepareGitRepository.js';

async function main() {
  const skipPush = process.argv.includes('--no-push');

  console.log('Auto Commit Bot');
  console.log('================\n');

  await prepareGitRepository({ skipPush });

  if (skipPush) {
    console.log('Mode lokal aktif: commit dibuat tanpa git push.\n');
  }

  const totalCommits = await askCommitCount();

  for (let currentCommit = 1; currentCommit <= totalCommits; currentCommit += 1) {
    await generateCommit(currentCommit, totalCommits, { skipPush });
  }

  console.log(skipPush ? '\nSelesai membuat commit lokal.' : '\nSelesai push ke GitHub.');
}

main().catch((error) => {
  console.error('\nProgram berhenti karena terjadi error:');
  console.error(error.message);
  process.exitCode = 1;
});
