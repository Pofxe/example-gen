const JSON_EXPORT_PASSWORD_SHA256 =
  '6ff2c2630d3a775bea943ca74a837e7e39927f2bbf359b3902f8ab98f141e58c';

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyJsonExportPassword(password: string): Promise<boolean> {
  const hash = await sha256Hex(password);
  return hash === JSON_EXPORT_PASSWORD_SHA256;
}
