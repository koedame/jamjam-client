/**
 * ProfileTab - Profile settings (display name)
 */

import { useTranslation } from "react-i18next";
import { FormField } from "../FormField";
import { Input } from "../Input";
import "./TabContent.css";

export interface ProfileTabProps {
  /** Current display name */
  displayName: string;
  /** Error message */
  error?: string;
  /** Display name change handler */
  onDisplayNameChange: (name: string) => void;
}

export function ProfileTab({
  displayName,
  error,
  onDisplayNameChange,
}: ProfileTabProps) {
  const { t } = useTranslation();

  return (
    <div className="tab-content">
      <h2 className="tab-content__title">{t("settings.profile.title", "Profile")}</h2>

      <FormField
        label={t("settings.profile.name", "Display Name")}
        htmlFor="display-name"
        hint={t("settings.profile.nameHint", "This name is shown to other participants")}
        error={error}
      >
        <Input
          id="display-name"
          type="text"
          value={displayName}
          onChange={onDisplayNameChange}
          placeholder={t("settings.profile.namePlaceholder")}
          maxLength={32}
          hasError={!!error}
        />
      </FormField>
    </div>
  );
}

export default ProfileTab;
