import { ALL_RULES } from "./rules";
import { RuleContext, RuleEvaluationResult, SecurityEngineResult } from "./types";
import { calculateRiskScore } from "./scoring/risk-engine";

export class SecureFlowEngine {
  public evaluate(context: RuleContext): SecurityEngineResult {
    const findings: RuleEvaluationResult[] = [];
    const triggeredRules: string[] = [];
    
    for (const rule of ALL_RULES) {
      if (!rule.enabled) continue;
      
      try {
        const result = rule.evaluate(context);
        if (result) {
          findings.push(result);
          triggeredRules.push(rule.id);
        }
      } catch (e) {
        console.error(`Rule ${rule.id} failed to evaluate:`, e);
      }
    }
    
    const { score, level } = calculateRiskScore(findings);
    
    return {
      findings,
      riskScore: score,
      riskLevel: level,
      triggeredRules
    };
  }
}
