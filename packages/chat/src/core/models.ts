// Aliases from the agent's model-config.yaml.
// TODO: fetch from the commons (an endpoint) so this can't drift.
export const CHAT_MODELS: readonly string[] = ["(On-Prem) Meta Muse Glimmer 30B"];

export const DEFAULT_CHAT_MODEL = CHAT_MODELS[0];
