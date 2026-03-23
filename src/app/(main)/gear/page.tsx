import { getGearItems } from "@/lib/actions/gear";
import { getGearSetups } from "@/lib/actions/gear";
import { getGearWishlist } from "@/lib/actions/gear";
import { requirePaidPlan } from "@/lib/actions/spotify";
import { GearView } from "@/components/gear/gear-view";

export default async function GearPage() {
  const [gearItems, gearSetups, wishlistItems, planCheck] = await Promise.all([
    getGearItems(),
    getGearSetups(),
    getGearWishlist(),
    requirePaidPlan(),
  ]);

  return (
    <GearView
      initialGearItems={gearItems}
      initialGearSetups={gearSetups}
      initialWishlistItems={wishlistItems}
      userPlan={planCheck.plan}
    />
  );
}
