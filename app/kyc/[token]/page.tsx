import KycClient from "@/components/Kyc/Client";
export default function Page({ params }: { params: { token: string } }) {
  return <KycClient token={params.token} />;
}
