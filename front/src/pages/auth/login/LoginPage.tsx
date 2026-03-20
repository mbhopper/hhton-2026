import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppStore } from '../../../app/store/AppStoreProvider';
import { defaultPrivateRoute, routes } from '../../../shared/config/routes';
import { Button } from '../../../shared/ui/button/Button';
import { loginSchema, type LoginFormValues } from '../../../features/auth/lib/schemas';

export function LoginPage() {
  const { login } = useAppStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'alex@futurepass.app',
      password: 'future-pass',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await login(values.email, values.password);
    window.location.hash = `#${defaultPrivateRoute}`;
  });

  return (
    <section className="auth-card app-panel">
      <div className="section-label">Вход</div>
      <h1>Войдите в личный кабинет</h1>
      <p>Используйте рабочий email и пароль, чтобы перейти в приватную часть приложения.</p>
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <label>
          Email
          <input type="email" placeholder="name@company.ru" {...register('email')} />
          {errors.email && <span className="field-error">{errors.email.message}</span>}
        </label>
        <label>
          Пароль
          <input type="password" placeholder="Минимум 8 символов" {...register('password')} />
          {errors.password && <span className="field-error">{errors.password.message}</span>}
        </label>
        <Button type="submit" fullWidth disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? 'Входим…' : 'Войти'}
        </Button>
      </form>
      <a className="inline-link" href={`#${routes.register}`}>
        Нет аккаунта? Зарегистрируйтесь
      </a>
    </section>
  );
}
