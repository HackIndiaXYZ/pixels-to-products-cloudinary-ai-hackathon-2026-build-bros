export const PATTERNS = {
  AWS_ACCESS_KEY: /AKIA[0-9A-Z]{16}/i,
  JWT: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/i,
  PRIVATE_KEY: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/i,
  EMAIL: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  PHONE: /(?:\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/i,
  IP_ADDRESS: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/,
  URL: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/i,
  GENERIC_API_KEY: /(?:api[_-]?key|secret|token|password)[\s]*[:=][\s]*["']?([a-zA-Z0-9]{16,})["']?/i
};
