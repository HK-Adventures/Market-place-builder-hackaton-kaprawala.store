import { Rule } from 'sanity';

export interface SanityRule extends Rule {
  required(): Rule;
  min(min: number): Rule;
  max(max: number): Rule;
  length(exactLength: number): Rule;
  email(): Rule;
  unique(): Rule;
  warning(message: string): Rule;
  error(message: string): Rule;
  regex(pattern: RegExp): Rule;
  custom(fn: (value: any) => true | string | Promise<true | string>): Rule;
}

export interface SanityValidation {
  validation?: (rule: SanityRule) => Rule | Rule[];
} 