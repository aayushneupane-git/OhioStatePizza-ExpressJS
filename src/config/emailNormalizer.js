function normalizeEmail(email) {
  let [local, domain] = email.toLowerCase().split("@");
  if (domain === "gmail.com" || domain === "googlemail.com") {
    // Remove everything after a '+' (alias)
    local = local.split("+")[0];
    // Remove all dots
    local = local.replace(/\./g, "");
  }

  return `${local}@${domain}`;
}

module.exports = normalizeEmail;
