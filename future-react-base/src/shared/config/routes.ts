export const routes = {
  root: '/',
  login: '/login',
  register: '/register',
  app: '/app',
  pass: '/app/pass',
  profile: '/app/profile',
  settings: '/app/settings',
  notFound: '/not-found',
  passNested: 'pass',
  profileNested: 'profile',
  settingsNested: 'settings',
} as const;

export const defaultUnauthorizedRoute = routes.login;
export const defaultAuthorizedRoute = routes.pass;
