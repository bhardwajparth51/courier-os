import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { DispatchManifest } from "@/components/operations/DispatchManifest";

export const dynamic = "force-dynamic";

export default async function ManifestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const manifest = await prisma.dispatchManifest.findUnique({
    where: { id },
    include: {
      bag: {
        include: {
          bagShipments: true,
        },
      },
    },
  });

  if (!manifest) notFound();

  return (
    <div>
      <Header title={`Manifest: ${manifest.manifestNumber}`} subtitle="Official franchise dispatch manifest" />
      <div className="page-container">
        <DispatchManifest manifest={JSON.parse(JSON.stringify(manifest))} />
      </div>
    </div>
  );
}
