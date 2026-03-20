export const routes = {
  login: '/auth/login',
  register: '/auth/register',
  pass: '/pass',
  profile: '/profile',
  settings: '/settings',
} as const;

export const defaultPrivateRoute = routes.pass;
