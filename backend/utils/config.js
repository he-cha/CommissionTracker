function getJWTSecret() {
  const secret=process.env.JWT_SECRET;
  if (!secret || secret.trim().length<32 || /^(changeme|replace_|your_)/i.test(secret)) throw new Error('Configure JWT_SECRET with at least 32 non-placeholder characters');
  return secret;
}
module.exports={getJWTSecret};
