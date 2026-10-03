import { credentialRules } from "./credentials";
import { piiRules } from "./pii";
import { infrastructureRules } from "./infrastructure";
import { contentRules } from "./content";
import { SecurityRule } from "../types";

export const ALL_RULES: SecurityRule[] = [
  ...credentialRules,
  ...piiRules,
  ...infrastructureRules,
  ...contentRules
];
