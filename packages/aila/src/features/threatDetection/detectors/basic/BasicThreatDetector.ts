import type {
  ThreatCategory,
  ThreatDetectionMessage,
  ThreatDetectionResult,
  ThreatSeverity,
} from "../AilaThreatDetector";
import { AilaThreatDetector } from "../AilaThreatDetector";

type ThreatPattern = {
  pattern: RegExp;
  category: ThreatCategory;
  severity: ThreatSeverity;
  message: string;
};

export class BasicThreatDetector extends AilaThreatDetector {
  private readonly patterns: ThreatPattern[] = [
    {
      pattern:
        /ignore previous instructions|ignore all instructions|disregard previous/i,
      category: "system_prompt_override",
      severity: "high",
      message: "Attempt to override system prompt detected",
    },
    {
      pattern:
        /what are your instructions|tell me your prompt|show me your system message/i,
      category: "prompt_extraction",
      severity: "medium",
      message: "Attempt to extract prompt detected",
    },
    {
      pattern: /exec\s*\(|eval\s*\(|process\.env|require\s*\(|import\s*\(/i,
      category: "malicious_code",
      severity: "critical",
      message: "Potential malicious code execution attempt detected",
    },
    {
      pattern:
        /\b(?:\d{3}-\d{2}-\d{4}|(?:\d{4}-){3}\d{4}|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b)/i,
      category: "pii",
      severity: "high",
      message: "Potential PII (SSN or credit card number) detected",
    },
    {
      pattern: /SELECT.*FROM|INSERT.*INTO|UPDATE.*SET|DELETE.*FROM/i,
      category: "sql_injection",
      severity: "critical",
      message: "Potential SQL injection attempt detected",
    },
    {
      // eslint-disable-next-line no-control-regex
      pattern: /\x1B|\x7F|\x1F/,
      category: "ascii_smuggling",
      severity: "medium",
      message: "Potential ASCII smuggling detected",
    },
  ];

  async detectThreat(
    content: ThreatDetectionMessage[],
  ): Promise<ThreatDetectionResult> {
    const stringContent = content.map((message) => message.content).join("\n");

    const detectedThreats = this.patterns
      .map((pattern) => ({
        isMatch: pattern.pattern.test(stringContent),
        pattern,
      }))
      .filter((result) => result.isMatch);

    if (detectedThreats.length === 0) {
      return {
        provider: "basic",
        isThreat: false,
        message: "No threats detected",
        findings: [],
        rawResponse: { matchedPatterns: [] },
        details: { confidence: 1.0 },
      };
    }

    // Get the highest severity threat
    const highestThreat = detectedThreats.reduce((highest, current) => {
      const severityOrder: ThreatSeverity[] = [
        "low",
        "medium",
        "high",
        "critical",
      ];
      if (
        severityOrder.indexOf(current.pattern.severity) >
        severityOrder.indexOf(highest!.pattern.severity)
      ) {
        return current;
      }
      return highest;
    }, detectedThreats[0]);

    if (!highestThreat) {
      return {
        provider: "basic",
        isThreat: false,
        message: "No threats detected",
        findings: [],
        rawResponse: { matchedPatterns: [] },
        details: { confidence: 1.0 },
      };
    }

    return {
      provider: "basic",
      isThreat: true,
      severity: highestThreat.pattern.severity,
      category: highestThreat.pattern.category,
      message: highestThreat.pattern.message,
      findings: detectedThreats.map((threat) => ({
        category: threat.pattern.category,
        severity: threat.pattern.severity,
        providerCode: threat.pattern.pattern.source,
        detected: true,
        snippet: threat.pattern.message,
        confidence: 1,
      })),
      rawResponse: {
        matchedPatterns: detectedThreats.map((threat) => ({
          pattern: threat.pattern.pattern.source,
          category: threat.pattern.category,
          severity: threat.pattern.severity,
          message: threat.pattern.message,
        })),
      },
      details: {
        detectedElements: detectedThreats.map((t) => t.pattern.message),
        confidence: 1.0,
      },
    };
  }
}
