export const enum GenerationPartType {
  AIGenerated = "aiGenerated",
  UserGenerated = "userGenerated",
  UserTweaked = "userTweaked",
  Placeholder = "placeholder",
}

export type GenerationPartAIGenerated<Value = string> = {
  type: GenerationPartType.AIGenerated;
  value: Value;
  lastGenerationId: string;
};

export type GenerationPartUserGenerated<Value = string> = {
  type: GenerationPartType.UserGenerated;
  value: Value;
  lastGenerationId: null;
};

export type GenerationPartUserTweaked<Value = string> = {
  type: GenerationPartType.UserTweaked;
  value: Value;
  originalValue: Value;
  lastGenerationId: string;
};

export type GenerationPartPlaceholder<Value = string> = {
  type: GenerationPartType.Placeholder;
  value?: Value;
  lastGenerationId: string;
};

export type GenerationPart<Value = string> =
  | GenerationPartUserGenerated<Value>
  | GenerationPartAIGenerated<Value>
  | GenerationPartUserTweaked<Value>;

export type GenerationPartOrPlaceholder<Value = string> =
  | GenerationPartUserGenerated<Value>
  | GenerationPartAIGenerated<Value>
  | GenerationPartUserTweaked<Value>
  | GenerationPartPlaceholder<Value>;
