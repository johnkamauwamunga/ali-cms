const ITERATIONS = 160000;

function toHex(bytes) {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function fromHex(value) {
  return new Uint8Array(value.match(/.{1,2}/g).map((part) => Number.parseInt(part, 16)));
}

function normalizeAnswer(value) {
  return value.trim().toLocaleLowerCase();
}

async function deriveSecret(value, saltHex) {
  if (!globalThis.crypto?.subtle) throw new Error('Secure browser cryptography is unavailable.');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(value), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({
    name: 'PBKDF2',
    salt: fromHex(saltHex),
    iterations: ITERATIONS,
    hash: 'SHA-256',
  }, key, 256);
  return toHex(bits);
}

function createSalt() {
  return toHex(crypto.getRandomValues(new Uint8Array(16)));
}

export async function createAuthCredentials(password, securityAnswer) {
  const [passwordCredential, answerCredential] = await Promise.all([
    createSecretCredential(password),
    createSecretCredential(securityAnswer, true),
  ]);
  return {
    password: passwordCredential,
    securityAnswer: answerCredential,
  };
}

export async function createSecretCredential(value, normalize = false) {
  const salt = createSalt();
  return {
    salt,
    hash: await deriveSecret(normalize ? normalizeAnswer(value) : value, salt),
  };
}

export async function verifySecret(value, credential, normalize = false) {
  if (!credential?.salt || !credential?.hash) return false;
  const candidate = normalize ? normalizeAnswer(value) : value;
  const actual = await deriveSecret(candidate, credential.salt);
  let difference = actual.length ^ credential.hash.length;
  for (let index = 0; index < Math.max(actual.length, credential.hash.length); index += 1) {
    difference |= (actual.charCodeAt(index) || 0) ^ (credential.hash.charCodeAt(index) || 0);
  }
  return difference === 0;
}
