import { CaseDetail } from "@/components/CaseDetail";

export default async function DisputePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CaseDetail id={Number(id)} />;
}
