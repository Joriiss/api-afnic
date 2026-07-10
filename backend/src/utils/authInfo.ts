import { randomBytes } from 'node:crypto';

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghjkmnpqrstuvwxyz';
const DIGITS = '23456789';
const ALL = UPPER + LOWER + DIGITS;

function pickChar(pool: string): string {
  return pool[randomBytes(1)[0]! % pool.length]!;
}

function shuffle(chars: string[]): string[] {
  const copy = [...chars];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = randomBytes(1)[0]! % (index + 1);
    [copy[index], copy[swapIndex]] = [copy[swapIndex]!, copy[index]!];
  }

  return copy;
}

export function generateAuthInfo(length = 16): string {
  const normalizedLength = Math.min(32, Math.max(12, length));
  const required = [pickChar(UPPER), pickChar(LOWER), pickChar(DIGITS)];
  const rest = Array.from({ length: normalizedLength - required.length }, () => pickChar(ALL));

  return shuffle([...required, ...rest]).join('');
}

export function isValidAuthInfo(value: string): boolean {
  if (value.length < 12 || value.length > 32) {
    return false;
  }

  if (/[\s\t]/.test(value)) {
    return false;
  }

  return /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);
}
