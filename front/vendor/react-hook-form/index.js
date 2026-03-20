import { useCallback, useMemo, useState } from 'react';

export function useForm(options = {}) {
  const { defaultValues = {}, resolver } = options;
  const [values, setValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback(async (nextValues) => {
    if (!resolver) {
      setErrors({});
      return { values: nextValues, errors: {} };
    }

    const result = await resolver(nextValues);
    setErrors(result.errors ?? {});
    return result;
  }, [resolver]);

  const register = useCallback((name) => ({
    name,
    value: values[name] ?? '',
    onChange: async (event) => {
      const nextValue = event?.target?.value ?? event;
      setValues((previous) => {
        const nextValues = { ...previous, [name]: nextValue };
        void validate(nextValues);
        return nextValues;
      });
    },
    onBlur: () => undefined,
  }), [validate, values]);

  const handleSubmit = useCallback((callback) => async (event) => {
    event?.preventDefault?.();
    const result = await validate(values);

    if (Object.keys(result.errors ?? {}).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await callback(result.values);
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, values]);

  const formState = useMemo(() => ({
    errors,
    isSubmitting,
  }), [errors, isSubmitting]);

  return {
    register,
    handleSubmit,
    formState,
  };
}
