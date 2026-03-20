export function zodResolver(schema) {
  return async (values) => {
    const result = schema.safeParse(values);

    if (result.success) {
      return {
        values: result.data,
        errors: {},
      };
    }

    const errors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string' && !errors[key]) {
        errors[key] = {
          type: 'validation',
          message: issue.message,
        };
      }
    }

    return {
      values,
      errors,
    };
  };
}
