function normalizeEmail(email) {
  const [local, domain] = email.toLowerCase().split("@");

  // Normalize only Gmail addresses (ignore dots in the local part)
  if (domain === "gmail.com") { 
    return `${local.replace(/\./g, "")}@${domain}`;
  }

  return `${local}@${domain}`;
}

module.exports = normalizeEmail;