import type { BuildTemplate } from "./types";
import { dayAppointmentTemplate } from "./templates/day-appointment";
import { introReplyTemplate } from "./templates/intro-reply";

const templatesById: Record<string, BuildTemplate> = {
  [dayAppointmentTemplate.id]: dayAppointmentTemplate,
  [introReplyTemplate.id]: introReplyTemplate,
};

/** Practice item ids that materialize from a build template at session time. */
export const BUILD_TEMPLATE_BY_ITEM_ID: Record<string, string> = {
  "everyday/day-meeting": dayAppointmentTemplate.id,
  "everyday/introduction": introReplyTemplate.id,
};

export function buildTemplateForItem(itemId: string): BuildTemplate | undefined {
  const templateId = BUILD_TEMPLATE_BY_ITEM_ID[itemId];
  if (!templateId) return undefined;
  return templatesById[templateId];
}

export function isBuildTemplateItem(itemId: string): boolean {
  return itemId in BUILD_TEMPLATE_BY_ITEM_ID;
}
