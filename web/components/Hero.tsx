import { Button, Container, Eyebrow } from "./ui";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 hero-grid" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-25 blur-[120px]"
        style={{ background: "var(--accent)" }}
      />
      <Container className="relative py-24 sm:py-32">
        <div className="max-w-3xl">
          <Eyebrow>GenLayer · Intelligent Contracts</Eyebrow>
          <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Autonomous adjudication
            <br />
            for NFT art disputes.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            File a claim that an NFT collection copied your work. A multimodal LLM
            weighs the evidence under validator consensus, and the verdict is
            recorded on-chain — no court, no middleman.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button href="/file" variant="accent">
              File a Claim →
            </Button>
            <Button href="/disputes" variant="outline">
              Browse Disputes
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
