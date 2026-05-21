import { colors, label, theme } from './hackerTheme.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const DEFAULT_PASSWORD = 'was here';
const MAX_PASSWORD_ATTEMPTS = 3;

function randomHexLine(length = 64) {
  const alphabet = '0123456789ABCDEF';
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

async function bootLine(text, delay = 140) {
  process.stdout.write(`${label('SYS')} ${text}`);
  await sleep(delay);
  process.stdout.write(` ${label('OK')}\n`);
}

async function auditBar(text, width = 28) {
  if (!process.stdout.isTTY) {
    console.log(`${label('SCAN')} ${text} ${label('OK')}`);
    return;
  }

  for (let step = 0; step <= width; step += 2) {
    const bar = '#'.repeat(step).padEnd(width, '.');
    const percent = String(Math.round((step / width) * 100)).padStart(3, ' ');
    process.stdout.write(`\r${label('SCAN')} ${theme(text, colors.cyan)} ${theme(`[${bar}]`, colors.green)} ${percent}%`);
    await sleep(35);
  }

  process.stdout.write(` ${label('OK')}\n`);
}

function askHiddenPassword(text) {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      resolve('');
      return;
    }

    let password = '';

    process.stdout.write(text);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    const onData = (key) => {
      if (key === '\u0003') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdout.write('\n');
        process.exit(130);
      }

      if (key === '\r' || key === '\n') {
        process.stdin.removeListener('data', onData);
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdout.write('\n');
        resolve(password);
        return;
      }

      if (key === '\u007f' || key === '\b') {
        if (password.length > 0) {
          password = password.slice(0, -1);
          process.stdout.write('\b \b');
        }
        return;
      }

      password += key;
      process.stdout.write('*');
    };

    process.stdin.on('data', onData);
  });
}

async function showLoading(text = 'loading secure console') {
  if (!process.stdout.isTTY) {
    return;
  }

  const frames = ['|', '/', '-', '\\'];

  for (let index = 0; index < 28; index += 1) {
    const frame = frames[index % frames.length];
    const dots = '.'.repeat((index % 4) + 1).padEnd(4, ' ');
    process.stdout.write(`\r${theme(frame, colors.brightGreen)} ${theme(text, colors.cyan)}${theme(dots, colors.dim)}`);
    await sleep(80);
  }

  process.stdout.write(`\r${label('OK')} ${theme('secure console ready', colors.brightGreen)}     \n\n`);
}

async function showAccessDeniedTaunt(remainingAttempts) {
  const taunts = [
    'unauthorized attempt detected',
    'audit log captured',
    'session locked behind consent gate',
  ];

  for (const taunt of taunts) {
    console.log(`${theme('[DENIED]', colors.red)} ${theme(taunt, colors.red)}`);
    await sleep(120);
  }

  if (remainingAttempts > 0) {
    console.log(`${theme('[LOCK]', colors.yellow)} Attempts remaining: ${remainingAttempts}.\n`);
    return;
  }

  console.log('');
}

export async function requestTerminalAccess() {
  if (!process.stdout.isTTY || !process.stdin.isTTY) {
    return;
  }

  console.clear();
  console.log(theme('AUTO COMMIT SECURE LOGIN', colors.brightGreen));
  console.log(theme('========================\n', colors.dim));

  const expectedPassword = process.env.AUTO_COMMIT_PASSWORD || DEFAULT_PASSWORD;

  for (let attempt = 1; attempt <= MAX_PASSWORD_ATTEMPTS; attempt += 1) {
    const password = await askHiddenPassword(`${theme('Password', colors.cyan)} : `);

    if (password === expectedPassword) {
      console.log(`\n${theme('ACCESS GRANTED', colors.brightGreen)} ${theme('// authentication accepted', colors.dim)}\n`);
      await showLoading();
      return;
    }

    const remainingAttempts = MAX_PASSWORD_ATTEMPTS - attempt;
    await showAccessDeniedTaunt(remainingAttempts);
  }

  throw new Error('Access denied. Too many incorrect password attempts.');
}

export async function showTerminalIntro() {
  if (!process.stdout.isTTY) {
    console.log('Auto Commit Bot');
    console.log('================\n');
    return;
  }

  console.clear();
  console.log(theme('=======================================================================', colors.dim));
  console.log(theme('==  [AUTHORIZED AUDIT NODE] :: AUTO COMMIT BOT :: ETHICAL OPS       ==', colors.green));
  console.log(theme('==  OPERATOR @exotickic     // GITHUB drx347   // CONSENT VERIFIED  ==', colors.green));
  console.log(theme('==  SCOPE: REPOSITORY ONLY  // MODE: SAFE AUTOMATION                 ==', colors.dim));
  console.log(theme('=======================================================================', colors.dim));

  for (let index = 0; index < 2; index += 1) {
    console.log(theme(randomHexLine(71), colors.dim));
    await sleep(70);
  }

  console.log(theme('=======================================================================', colors.dim));
  console.log(theme('        _         _          ____                          _ _   ', colors.green));
  console.log(theme('       / \\  _   _| |_ ___   / ___|___  _ __ ___  _ __ ___ (_) |_ ', colors.green));
  console.log(theme("      / _ \\| | | | __/ _ \\ | |   / _ \\| '_ ` _ \\| '_ ` _ \\| | __|", colors.green));
  console.log(theme('     / ___ \\ |_| | || (_) || |__| (_) | | | | | | | | | | | | |_ ', colors.green));
  console.log(theme('    /_/   \\_\\__,_|\\__\\___/  \\____\\___/|_| |_| |_|_| |_| |_|_|\\__|', colors.green));
  console.log(theme('=======================================================================', colors.dim));
  console.log(theme('              .-~~~~~~~~~~-.        G I T H U B   U P L I N K          ', colors.green));
  console.log(theme('          .-~~   .-""""-.   ~~-.    repository channel verified         ', colors.green));
  console.log(theme('        ./      /  .--.  \\      \\.  origin sync protocol ready          ', colors.green));
  console.log(theme('       /       |  / __ \\  |       \\ secure commit route online          ', colors.green));
  console.log(theme('      |        | | (__) | |        |                                    ', colors.green));
  console.log(theme('      |        |  \\____/  |        |   [git] [branch] [commit] [push]   ', colors.green));
  console.log(theme('       \\        \\  .--.  /        /                                     ', colors.green));
  console.log(theme('        `-.      `-.__.-`      .-`                                      ', colors.green));
  console.log(theme('           `-._   OCTOCAT   _.-`     authorized automation scope        ', colors.green));
  console.log(theme('               `~~~~~~~~~~`                                             ', colors.green));
  console.log(theme('=======================================================================', colors.dim));
  console.log(theme('>> node automation console         ::   ethical automation online', colors.green));
  console.log(theme('>> repository scope locked         ::   github channel verified', colors.green));
  console.log(theme('=======================================================================\n', colors.dim));

  await auditBar('checking authorization scope');
  await auditBar('verifying git workspace');
  await auditBar('validating github origin');
  await bootLine(theme('safe automation profile loaded', colors.cyan));
  await bootLine(theme('commit workflow ready under authorized scope', colors.brightGreen));

  console.log(`\n${theme('ACCESS GRANTED', colors.brightGreen)} ${theme('// ethical auto commit mode online', colors.dim)}\n`);
}
