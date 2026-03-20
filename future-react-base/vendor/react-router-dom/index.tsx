import {
  Children,
  Fragment,
  cloneElement,
  createContext,
  isValidElement,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type NavigateOptions = {
  replace?: boolean;
};

type RouteProps = {
  path?: string;
  index?: boolean;
  element?: ReactNode;
  children?: ReactNode;
};

type Branch = {
  fullPath: string;
  score: number;
  order: number[];
  elements: ReactNode[];
};

type RouterContextValue = {
  pathname: string;
  navigate: (to: string, options?: NavigateOptions) => void;
};

const RouterContext = createContext<RouterContextValue | null>(null);
const OutletContext = createContext<ReactNode>(null);

function normalizePath(pathname: string) {
  if (!pathname || pathname === '/') {
    return '/';
  }

  return pathname.replace(/\/+$/, '') || '/';
}

function splitPath(pathname: string) {
  return normalizePath(pathname)
    .split('/')
    .filter(Boolean);
}

function resolvePath(path: string | undefined, basePath: string) {
  if (!path) {
    return normalizePath(basePath);
  }

  if (path === '*') {
    return '*';
  }

  if (path.startsWith('/')) {
    return normalizePath(path);
  }

  const base = normalizePath(basePath);
  return normalizePath(base === '/' ? `/${path}` : `${base}/${path}`);
}

function compareOrder(a: number[], b: number[]) {
  const max = Math.max(a.length, b.length);

  for (let index = 0; index < max; index += 1) {
    const left = a[index] ?? -1;
    const right = b[index] ?? -1;

    if (left !== right) {
      return left - right;
    }
  }

  return 0;
}

function computeScore(fullPath: string) {
  if (fullPath === '*') {
    return -1;
  }

  return splitPath(fullPath).reduce((total, segment) => total + (segment === '*' ? 0 : 3), 1);
}

function matchPath(pattern: string, pathname: string) {
  if (pattern === '*') {
    return true;
  }

  return normalizePath(pattern) === normalizePath(pathname);
}

function useRouter() {
  const context = useContext(RouterContext);

  if (!context) {
    throw new Error('Router hooks must be used within BrowserRouter');
  }

  return context;
}

function buildBranches(children: ReactNode, basePath = '/', wrappers: ReactNode[] = [], order: number[] = []): Branch[] {
  const branches: Branch[] = [];

  Children.forEach(children, (child, index) => {
    if (!isValidElement<RouteProps>(child)) {
      return;
    }

    const { path, index: isIndex, element = null, children: nestedChildren } = child.props;
    const nextOrder = [...order, index];
    const nextWrappers = element === null ? wrappers : [...wrappers, element];
    const fullPath = isIndex ? normalizePath(basePath) : resolvePath(path, basePath);

    if (nestedChildren) {
      branches.push(...buildBranches(nestedChildren, fullPath, nextWrappers, nextOrder));
    }

    if (!nestedChildren || isIndex) {
      branches.push({
        fullPath,
        score: computeScore(fullPath),
        order: nextOrder,
        elements: nextWrappers,
      });
    }
  });

  return branches;
}

function renderMatch(elements: ReactNode[]) {
  if (elements.length === 0) {
    return null;
  }

  return elements.reduceRight<ReactNode>((outlet, element, index) => {
    if (index === elements.length - 1) {
      return element;
    }

    return <OutletContext.Provider value={outlet}>{element}</OutletContext.Provider>;
  }, null);
}

export function BrowserRouter({ children }: { children: ReactNode }) {
  const [pathname, setPathname] = useState(() => normalizePath(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => setPathname(normalizePath(window.location.pathname));

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string, options?: NavigateOptions) => {
    const nextPath = normalizePath(to);
    const method = options?.replace ? 'replaceState' : 'pushState';

    window.history[method](window.history.state, '', nextPath);
    setPathname(nextPath);
  };

  const value = useMemo(() => ({ pathname, navigate }), [pathname]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function Routes({ children }: { children: ReactNode }) {
  const { pathname } = useRouter();
  const branches = useMemo(() => buildBranches(children), [children]);
  const match = useMemo(
    () =>
      [...branches]
        .sort((left, right) => right.score - left.score || compareOrder(left.order, right.order))
        .find((branch) => matchPath(branch.fullPath, pathname)),
    [branches, pathname],
  );

  return <>{match ? renderMatch(match.elements) : null}</>;
}

export function Route(_props: RouteProps) {
  return null;
}

export function Outlet() {
  return <>{useContext(OutletContext)}</>;
}

export function Navigate({ to, replace = false }: { to: string; replace?: boolean }) {
  const { navigate } = useRouter();

  useEffect(() => {
    navigate(to, { replace });
  }, [navigate, replace, to]);

  return null;
}

export function useNavigate() {
  return useRouter().navigate;
}

export function Link({ to, onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  const { navigate } = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();
    navigate(to);
  };

  return <a {...props} href={to} onClick={handleClick} />;
}

export function NavLink({
  className,
  to,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'> & {
  className?: string | ((props: { isActive: boolean }) => string);
  to: string;
}) {
  const { pathname } = useRouter();
  const isActive = normalizePath(pathname) === normalizePath(to);
  const nextClassName = typeof className === 'function' ? className({ isActive }) : className;

  return <Link {...props} className={nextClassName} to={to} />;
}

export function useLocation() {
  return { pathname: useRouter().pathname };
}

export { Fragment };
export type { RouteProps };
