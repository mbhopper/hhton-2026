class ZodError extends Error {
  constructor(issues) {
    super('Validation failed');
    this.issues = issues;
  }
}

class BaseSchema {
  optional() {
    return new OptionalSchema(this);
  }
}

class StringSchema extends BaseSchema {
  constructor() {
    super();
    this._rules = [];
    this._trim = false;
  }

  trim() {
    this._trim = true;
    return this;
  }

  min(length, message) {
    this._rules.push({
      check: (value) => value.length >= length,
      message,
    });
    return this;
  }

  email(message) {
    this._rules.push({
      check: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message,
    });
    return this;
  }

  regex(pattern, message) {
    this._rules.push({
      check: (value) => pattern.test(value),
      message,
    });
    return this;
  }

  _parse(value, path) {
    const nextValue = typeof value === 'string' ? (this._trim ? value.trim() : value) : value;

    if (typeof nextValue !== 'string') {
      return { success: false, issues: [{ path, message: 'Некорректное значение.' }] };
    }

    for (const rule of this._rules) {
      if (!rule.check(nextValue)) {
        return { success: false, issues: [{ path, message: rule.message }] };
      }
    }

    return { success: true, data: nextValue };
  }
}

class OptionalSchema extends BaseSchema {
  constructor(inner) {
    super();
    this.inner = inner;
  }

  _parse(value, path) {
    if (value === undefined || value === null || value === '') {
      return { success: true, data: undefined };
    }

    return this.inner._parse(value, path);
  }
}

class ObjectSchema extends BaseSchema {
  constructor(shape) {
    super();
    this.shape = shape;
    this._refinements = [];
  }

  refine(check, options) {
    this._refinements.push({ check, options });
    return this;
  }

  safeParse(values) {
    const data = {};
    const issues = [];

    for (const key of Object.keys(this.shape)) {
      const result = this.shape[key]._parse(values?.[key], [key]);
      if (result.success) {
        data[key] = result.data;
      } else {
        issues.push(...result.issues);
      }
    }

    if (issues.length === 0) {
      for (const refinement of this._refinements) {
        if (!refinement.check(data)) {
          issues.push({
            path: refinement.options?.path ?? [],
            message: refinement.options?.message ?? 'Некорректное значение.',
          });
        }
      }
    }

    if (issues.length > 0) {
      return { success: false, error: new ZodError(issues) };
    }

    return { success: true, data };
  }
}

export const z = {
  string: () => new StringSchema(),
  object: (shape) => new ObjectSchema(shape),
  ZodError,
};
