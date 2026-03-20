import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../app/store/AppStoreProvider';
import { defaultAuthorizedRoute, routes } from '../../shared/config/routes';
import { Button } from '../../shared/ui/button/Button';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const { login, register } = useAppStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('alex@futurepass.app');
  const [name, setName] = useState('Alex Future');
  const [password, setPassword] = useState('future-pass');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = mode === 'register';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate(defaultAuthorizedRoute, { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-card app-panel">
      <div className="section-label">{isRegister ? 'Create account' : 'Welcome back'}</div>
      <h1>{isRegister ? 'Set up access for the private zone' : 'Sign in to manage your pass'}</h1>
      <p>
        Future React Base now starts with a modular app shell: providers, router, store, pages,
        widgets, features, entities and shared segments.
      </p>
      <form className="auth-form" onSubmit={handleSubmit}>
        {isRegister && (
          <label>
            Full name
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
        )}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </label>
        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Please wait…' : isRegister ? 'Create profile' : 'Continue'}
        </Button>
      </form>
      <Link className="inline-link" to={isRegister ? routes.login : routes.register}>
        {isRegister ? 'Already have access? Sign in' : 'No account yet? Create one'}
      </Link>
    </section>
  );
}
