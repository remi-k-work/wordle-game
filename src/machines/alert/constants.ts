// The machine's only open state (kept beside the `states` node below so the two
// cannot drift); state/alert.ts keys its visibility selector off this
export const ALERT_FORFEIT_RUN_STATE = "forfeit-run" as const;
