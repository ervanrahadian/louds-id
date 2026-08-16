const PREFIX = "enc:v1:";
const IV_LENGTH = 12;
const PBKDF2_ITERATIONS = 150_000;
const SALT = new TextEncoder().encode("louds-id-message-salt-v1");

let keyPromise: Promise<CryptoKey> | null = null;

function messageSecret(): string {
  const fromEnv = import.meta.env.VITE_MESSAGE_SECRET;
  if (typeof fromEnv === "string" && fromEnv.trim()) {
    return fromEnv.trim();
  }
  return "louds-id.connect-share-grow.v1";
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function copyBytes(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy;
}

async function getKey(): Promise<CryptoKey> {
  if (!keyPromise) {
    keyPromise = (async () => {
      const material = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(messageSecret()),
        "PBKDF2",
        false,
        ["deriveKey"],
      );

      return crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: SALT,
          iterations: PBKDF2_ITERATIONS,
          hash: "SHA-256",
        },
        material,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"],
      );
    })();
  }

  return keyPromise;
}

export function isEncryptedMessage(value: string): boolean {
  return value.startsWith(PREFIX);
}

/** AES-GCM encrypts chat text for storage in Firestore. */
export async function encryptMessage(plaintext: string): Promise<string> {
  if (!plaintext) {
    return plaintext;
  }

  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext),
  );
  const packed = new Uint8Array(iv.length + cipher.byteLength);
  packed.set(iv, 0);
  packed.set(new Uint8Array(cipher), iv.length);
  return PREFIX + bytesToBase64(packed);
}

/** Decrypts stored chat text. Plaintext and unknown values pass through. */
export async function decryptMessage(value: string): Promise<string> {
  if (!value || !isEncryptedMessage(value)) {
    return value;
  }

  try {
    const packed = base64ToBytes(value.slice(PREFIX.length));
    if (packed.length <= IV_LENGTH) {
      return value;
    }

    const key = await getKey();
    const iv = copyBytes(packed.subarray(0, IV_LENGTH));
    const data = copyBytes(packed.subarray(IV_LENGTH));
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data,
    );
    return new TextDecoder().decode(plain);
  } catch {
    return value;
  }
}
