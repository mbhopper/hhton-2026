export type Issue = {
  path: Array<string | number>;
  message: string;
};

export class ZodError extends Error {
  issues: Issue[];
  constructor(issues: Issue[]);
}

export interface SafeParseSuccess<T> {
  success: true;
  data: T;
}

export interface SafeParseError {
  success: false;
  error: ZodError;
}

export interface Schema<T> {
  optional(): Schema<T | undefined>;
  _parse(value: unknown, path: Array<string | number>):
    | { success: true; data: T }
    | { success: false; issues: Issue[] };
}

export interface StringSchema extends Schema<string> {
  trim(): StringSchema;
  min(length: number, message: string): StringSchema;
  email(message: string): StringSchema;
  regex(pattern: RegExp, message: string): StringSchema;
}

export interface ObjectSchema<T> extends Schema<T> {
  refine(check: (values: T) => boolean, options?: { path?: Array<string | number>; message?: string }): ObjectSchema<T>;
  safeParse(values: unknown): SafeParseSuccess<T> | SafeParseError;
}

export const z: {
  string(): StringSchema;
  object<T extends Record<string, unknown>>(shape: { [K in keyof T]: Schema<T[K]> }): ObjectSchema<T>;
  ZodError: typeof ZodError;
};

export namespace z {
  export type infer<T> = T extends ObjectSchema<infer U> ? U : T extends Schema<infer U> ? U : never;
}
