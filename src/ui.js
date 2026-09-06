// Minimal, dependency-free terminal styling.
// Colour is disabled when NO_COLOR is set or when stdout is not a TTY.

const CSI = '\u001b[';

const enabled =
  process.env.FORCE_COLOR !== '0' &&
  !process.env.NO_COLOR &&
  (process.env.FORCE_COLOR ? true : Boolean(process.stdout.isTTY));

const wrap = (open, close) => (s) =>
  enabled ? `${CSI}${open}m${s}${CSI}${close}m` : String(s);

export const c = {
  bold: wrap(1, 22),
  dim: wrap(2, 22),
  red: wrap(31, 39),
  green: wrap(32, 39),
  yellow: wrap(33, 39),
  blue: wrap(34, 39),
  magenta: wrap(35, 39),
  cyan: wrap(36, 39),
  gray: wrap(90, 39),
};

export const log = (...a) => console.log(...a);
export const ok = (msg) => log(`${c.green('OK')} ${msg}`);
export const add = (msg) => log(`  ${c.green('+')} ${msg}`);
export const skip = (msg) => log(`  ${c.gray('.')} ${c.gray(msg)}`);
export const warn = (msg) => log(`  ${c.yellow('!')} ${msg}`);
export const fail = (msg) => log(`${c.red('x')} ${msg}`);
export const step = (msg) => log(`\n${c.bold(msg)}`);

export const banner = (version) =>
  log(
    [
      '',
      `${c.cyan(c.bold('  calicoach'))}${c.gray(`  v${version}`)}`,
      c.gray('  An expert calisthenics & strength coach, as Claude skills.'),
      '',
    ].join('\n')
  );
