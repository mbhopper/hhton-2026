import { Button } from '../../shared/ui/button/Button';

const toggles = [
  'Security alerts for new device sessions',
  'Weekly activity digest for pass usage',
  'Priority lane reminders before events',
];

export function SettingsPage() {
  return (
    <section className="settings-card app-panel">
      <div className="section-label">Preferences</div>
      <h1>Settings</h1>
      <div className="settings-list">
        {toggles.map((item) => (
          <label key={item} className="toggle-row">
            <span>{item}</span>
            <input type="checkbox" defaultChecked />
          </label>
        ))}
      </div>
      <Button>Save changes</Button>
    </section>
  );
}
