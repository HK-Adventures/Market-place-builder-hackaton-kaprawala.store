import { Rule } from 'sanity';

// Define more specific types for validation functions
type ValidationFn = (value: unknown) => true | string | Promise<true | string>;
type MessageFn = (message: string) => Rule;

export interface SanityRule extends Rule {
  required(): Rule;
  min(_min: number): Rule;
  max(_max: number): Rule;
  length(_exactLength: number): Rule;
  email(): Rule;
  unique(): Rule;
  warning: MessageFn;
  error: MessageFn;
  regex(_pattern: RegExp): Rule;
  custom(_fn: ValidationFn): Rule;
}

export interface SanityValidation {
  validation?: (_rule: SanityRule) => Rule | Rule[];
}

export type ValidationRule = {
  required: () => ValidationRule;
  custom: (_fn: (value: unknown) => boolean | string) => ValidationRule;
};

export type Validation = {
  validation?: (_rule: ValidationRule) => ValidationRule;
}; 