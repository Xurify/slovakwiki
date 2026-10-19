import { practiceItemHref } from "$lib/catalog/practice";
import { DEMONSTRATIVE_RULE_LABELS } from "$lib/learning/demonstratives/rule-labels";
import type { PracticeRule } from "./weak-spots";

const RULE_LABELS_BY_GRAMMAR_TOPIC: Record<string, Record<string, string>> = {
  demonstratives: DEMONSTRATIVE_RULE_LABELS,
};

export function practiceRulesForGrammarTopic(slug: string): PracticeRule[] {
  const labels = RULE_LABELS_BY_GRAMMAR_TOPIC[slug] ?? {};
  return Object.entries(labels).flatMap(([formId, label]) => {
    const practiceHref = practiceItemHref(formId);
    return practiceHref ? [{ formId, label, practiceHref }] : [];
  });
}
