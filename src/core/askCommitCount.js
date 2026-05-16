import readline from 'readline';

export function askCommitCount() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    const ask = () => {
      rl.question('Mau berapa commit?\n\n> ', (answer) => {
        const commitCount = Number(answer.trim());

        if (!Number.isInteger(commitCount) || commitCount <= 0) {
          console.log('\nInput harus angka bulat lebih dari 0.\n');
          ask();
          return;
        }

        rl.close();
        resolve(commitCount);
      });
    };

    ask();
  });
}
