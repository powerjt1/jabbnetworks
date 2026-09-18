import { SettingsForm } from "@/components/settings-form";
import { PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/lib/data";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  const user = getCurrentUser();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Your profile, rates, notifications and payout details."
      />
      <SettingsForm user={user} />
    </div>
  );
}
