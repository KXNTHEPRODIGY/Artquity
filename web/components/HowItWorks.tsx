import { Container, Eyebrow } from "./ui";

const STEPS = [
  {
    n: "01",
    title: "Submit evidence",
    body: "The claimant files the original artwork, the allegedly infringing NFT collection, and an argument. An LLM intake officer screens it for plausibility.",
  },
  {
    n: "02",
    title: "Validators reach consensus",
    body: "GenLayer validators independently run a multimodal model over the evidence and converge on an outcome — no single party decides.",
  },
  {
    n: "03",
    title: "On-chain verdict",
    body: "The verdict and the model's written reasoning are recorded immutably in the Intelligent Contract, binding and publicly auditable.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-b border-border py-20">
      <Container>
        <Eyebrow>How it works</Eyebrow>
        <h2 className="mt-4 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
          From evidence to enforceable verdict, autonomously.
        </h2>

        <div className="mt-12 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-bg p-8">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-accent">{s.n}</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
