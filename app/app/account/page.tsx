import { AccountSettings } from "@/components/account/AccountSettings";
import { requireUser } from "@/lib/authorization";

export default async function AccountPage() {
  const user = await requireUser();

  return <AccountSettings user={user} />;
}
