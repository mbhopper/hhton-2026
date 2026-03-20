import { useAppStore } from '../../app/store/AppStoreProvider';

export function ProfileDetails() {
  const { user } = useAppStore();

  return (
    <section className="profile-card app-panel">
      <div className="section-label">Identity</div>
      <h1>{user?.name ?? 'Loading profile'}</h1>
      <dl className="profile-list">
        <div>
          <dt>Email</dt>
          <dd>{user?.email ?? '—'}</dd>
        </div>
        <div>
          <dt>City</dt>
          <dd>{user?.city ?? '—'}</dd>
        </div>
        <div>
          <dt>Membership</dt>
          <dd>{user?.membershipLevel ?? '—'}</dd>
        </div>
        <div>
          <dt>User ID</dt>
          <dd>{user?.id ?? '—'}</dd>
        </div>
      </dl>
    </section>
  );
}
