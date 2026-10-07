import AdminGate from "@/components/Kyc/AdminGate";
import AdminList from "@/components/Kyc/AdminList";
export default function Page() {
  return (
    <AdminGate>
      <AdminList />
    </AdminGate>
  );
}
