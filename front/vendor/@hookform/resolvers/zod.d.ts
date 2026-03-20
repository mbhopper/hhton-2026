import type { Resolver } from 'react-hook-form';

export function zodResolver<TFieldValues extends Record<string, unknown>>(schema: {
  safeParse(values: unknown):
    | { success: true; data: TFieldValues }
    | { success: false; error: { issues: Array<{ path: Array<string | number>; message: string }> } };
}): Resolver<TFieldValues>;
