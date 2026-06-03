import type { UserSettings } from "../types";
import { Settings } from "../components/Settings/Settings";

export function SettingsPage({
  settings,
  updateSettings,
  source,
}: {
  settings: UserSettings;
  updateSettings: (patch: Partial<UserSettings>) => void;
  source: "firestore" | "memory";
}) {
  return (
    <Settings settings={settings} updateSettings={updateSettings} source={source} />
  );
}
