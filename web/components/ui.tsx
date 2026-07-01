import Link from "next/link";
import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="eyebrow">{children}</span>;
}

type Variant = "accent" | "outline" | "ghost";

const VARIANTS: Record<Variant, string> = {
  accent:
    "bg-accent text-[#06070a] hover:bg-accent-press border border-transparent",
  outline:
    "bg-transparent text-text border border-border-strong hover:border-accent hover:text-accent",
  ghost: "bg-transparent text-muted hover:text-text border border-transparent",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-none px-5 py-2.5 text-sm font-semibold tracking-tight transition-colors disabled:cursor-not-allowed disabled:opacity-40";

export function Button({
  children,
  href,
  onClick,
  variant = "accent",
  type = "button",
  disabled,
  className = "",
  external,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  external?: boolean;
}) {
  const cls = `${BASE} ${VARIANTS[variant]} ${className}`;
  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noreferrer" className={cls}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      {children && <p className="max-w-2xl text-muted">{children}</p>}
    </div>
  );
}
