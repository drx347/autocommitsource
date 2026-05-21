const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BRIGHT_GREEN = '\x1b[92m';

export function theme(text, ansiColor = GREEN) {
  return `${ansiColor}${text}${RESET}`;
}

export const colors = {
  reset: RESET,
  dim: DIM,
  red: RED,
  green: GREEN,
  yellow: YELLOW,
  cyan: CYAN,
  brightGreen: BRIGHT_GREEN,
};

export function label(text) {
  return theme(`[${text}]`, BRIGHT_GREEN);
}

export function promptPrefix() {
  return `${theme('root@autocommit', BRIGHT_GREEN)}${theme(':~#', CYAN)} `;
}

export function prompt(text) {
  return `${promptPrefix()}${text}`;
}

export function success(text) {
  return `${label('OK')} ${text}`;
}

export function warn(text) {
  return `${theme('[WARN]', YELLOW)} ${text}`;
}

export function fail(text) {
  return `${theme('[FAIL]', RED)} ${text}`;
}
