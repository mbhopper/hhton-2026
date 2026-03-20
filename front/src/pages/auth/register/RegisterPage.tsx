import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppStore } from '../../../app/store/AppStoreProvider';
import { defaultPrivateRoute, routes } from '../../../shared/config/routes';
import { Button } from '../../../shared/ui/button/Button';
import { registerSchema, type RegisterFormValues } from '../../../features/auth/lib/schemas';

export function RegisterPage() {
  const { register: registerUser } = useAppStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: 'Александр',
      lastName: 'Иванов',
      middleName: '',
      email: 'alex@futurepass.app',
      phone: '+7 (999) 123-45-67',
      department: 'Разработка',
      position: 'Frontend developer',
      password: 'future-pass',
      confirmPassword: 'future-pass',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await registerUser(values);
    window.location.hash = `#${defaultPrivateRoute}`;
  });

  return (
    <section className="auth-card app-panel">
      <div className="section-label">Регистрация</div>
      <h1>Создайте аккаунт сотрудника</h1>
      <p>Заполните профиль, чтобы сразу попасть в приватную часть приложения после регистрации.</p>
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <div className="auth-form__grid auth-form__grid--double">
          <label>
            Имя
            <input placeholder="Иван" {...register('firstName')} />
            {errors.firstName && <span className="field-error">{errors.firstName.message}</span>}
          </label>
          <label>
            Фамилия
            <input placeholder="Иванов" {...register('lastName')} />
            {errors.lastName && <span className="field-error">{errors.lastName.message}</span>}
          </label>
        </div>
        <label>
          Отчество
          <input placeholder="Иванович" {...register('middleName')} />
          {errors.middleName && <span className="field-error">{errors.middleName.message}</span>}
        </label>
        <label>
          Email
          <input type="email" placeholder="name@company.ru" {...register('email')} />
          {errors.email && <span className="field-error">{errors.email.message}</span>}
        </label>
        <div className="auth-form__grid auth-form__grid--double">
          <label>
            Телефон
            <input type="tel" placeholder="+7 (___) ___-__-__" {...register('phone')} />
            {errors.phone && <span className="field-error">{errors.phone.message}</span>}
          </label>
          <label>
            Подразделение
            <input placeholder="Например, IT" {...register('department')} />
            {errors.department && <span className="field-error">{errors.department.message}</span>}
          </label>
        </div>
        <label>
          Должность
          <input placeholder="Например, Product manager" {...register('position')} />
          {errors.position && <span className="field-error">{errors.position.message}</span>}
        </label>
        <div className="auth-form__grid auth-form__grid--double">
          <label>
            Пароль
            <input type="password" placeholder="Минимум 8 символов" {...register('password')} />
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </label>
          <label>
            Повторите пароль
            <input type="password" placeholder="Повторите пароль" {...register('confirmPassword')} />
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword.message}</span>}
          </label>
        </div>
        <Button type="submit" fullWidth disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
        </Button>
      </form>
      <a className="inline-link" href={`#${routes.login}`}>
        Уже есть аккаунт? Войдите
      </a>
    </section>
  );
}
