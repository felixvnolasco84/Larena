import AdminGate from "@/components/Kyc/AdminGate";
import AdminDetail from "@/components/Kyc/AdminDetail";
import type { Id } from "@/convex/_generated/dataModel";
export default function Page({ params }: { params: { id: string } }) {
  return (
    <AdminGate>
      <AdminDetail id={params.id as Id<"submissions">} />
    </AdminGate>
  );
}
