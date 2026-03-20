import type { ChangeEventHandler, FocusEventHandler } from 'react';

export type FieldValues = Record<string, unknown>;

export type FieldError = {
  type?: string;
  message?: string;
};

export type FieldErrors<TFieldValues extends FieldValues> = Partial<Record<keyof TFieldValues, FieldError>>;

export type ResolverResult<TFieldValues extends FieldValues> = {
  values: TFieldValues;
  errors: FieldErrors<TFieldValues>;
};

export type Resolver<TFieldValues extends FieldValues> = (
  values: TFieldValues,
) => Promise<ResolverResult<TFieldValues>> | ResolverResult<TFieldValues>;

export type UseFormRegisterReturn = {
  name: string;
  value?: string | number | readonly string[] | undefined;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onBlur: FocusEventHandler<HTMLInputElement>;
};

export interface UseFormReturn<TFieldValues extends FieldValues> {
  register: <TName extends keyof TFieldValues>(name: TName) => UseFormRegisterReturn;
  handleSubmit: (
    callback: (values: TFieldValues) => void | Promise<void>,
  ) => (event?: { preventDefault?: () => void }) => Promise<void>;
  formState: {
    errors: FieldErrors<TFieldValues>;
    isSubmitting: boolean;
  };
}

export function useForm<TFieldValues extends FieldValues>(options?: {
  defaultValues?: Partial<TFieldValues>;
  resolver?: Resolver<TFieldValues>;
}): UseFormReturn<TFieldValues>;
