import type { Metadata } from "next";
import { FileClaimForm } from "@/components/FileClaimForm";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "File a Claim — Artquity",
};

export default function FilePage() {
  return (
    <Container className="py-16">
      <div className="max-w-2xl">
        <Eyebrow>New dispute</Eyebrow>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          File an IP claim
        </h1>
        <p className="mt-4 text-muted">
          Submit evidence that an NFT collection copied your artwork. The
          Intelligent Contract screens the claim at intake, then serves the named
          respondent on-chain.
        </p>
      </div>

      <div className="mt-12 max-w-3xl">
        <FileClaimForm />
      </div>
    </Container>
  );
}
