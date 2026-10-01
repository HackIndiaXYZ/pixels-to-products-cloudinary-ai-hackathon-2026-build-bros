import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const DOMAINS = [
  { num: "01", name: "Application Security",     desc: "Source code, SQL, API handlers, auth logic" },
  { num: "02", name: "Cloud Security",            desc: "Terraform, CloudFormation, S3, IAM, cloud configs" },
  { num: "03", name: "Infrastructure Security",   desc: "Kubernetes, Dockerfile, Helm, compose files" },
  { num: "04", name: "Network Security",          desc: "Firewall rules, iptables, nginx, VPN configs" },
  { num: "05", name: "Supply Chain Security",     desc: "CI/CD pipelines, package manifests, GitHub Actions" },
  { num: "06", name: "Policy & Compliance",       desc: "Security policies, RBAC, OPA, compliance docs" },
  { num: "07", name: "Runtime / Incident",        desc: "HTTP logs, auth logs, application events" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "INPUT",    body: "Paste code, configuration, logs, policies, or any security-relevant data." },
  { step: "02", title: "DETECT",   body: "SecureFlow identifies the input type automatically — no manual selection." },
  { step: "03", title: "ANALYZE",  body: "The appropriate security analysis lens is applied for the detected domain." },
  { step: "04", title: "EXPLAIN",  body: "Findings are translated into understandable risks with CWE and framework references." },
  { step: "05", title: "REMEDIATE",body: "Receive prioritized actions and specific, implementable fixes." },
];

const DEMO_FINDING = `resource "aws_s3_bucket" "data" {
  bucket = "company-sensitive-data"
  acl    = "public-read"
}`;

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: "var(--color-background)", minHeight: "100vh" }}>

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav
        style={{ borderBottom: "1px solid var(--color-rule)" }}
        className="flex items-center justify-between px-8 py-4"
      >
        <div>
          <span className="font-ui text-sm font-semibold tracking-wide" style={{ color: "var(--color-ink)" }}>
            SECUREFLOW AI
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/dashboard/evidence">
            <Button variant="ghost" size="sm">Evidence Library</Button>
          </Link>
          <Link href="/dashboard/analysis/new">
            <Button variant="primary" size="sm">
              Start Analysis <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="px-8 pt-20 pb-16" style={{ borderBottom: "1px solid var(--color-rule)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Left — editorial text */}
            <div>
              <p className="eyebrow mb-6">AI SECURITY INTELLIGENCE ENGINE</p>

              <h1 className="headline-xl mb-8">
                Paste anything.<br />
                Understand<br />
                the risk.
              </h1>

              <p
                className="text-base leading-relaxed mb-10 max-w-md"
                style={{ color: "var(--color-ink-2)" }}
              >
                SecureFlow AI automatically identifies what you&apos;re analyzing
                and applies the appropriate security lens — from source code and
                cloud infrastructure to logs, policies, and security configurations.
              </p>

              <div className="flex items-center gap-3">
                <Link href="/dashboard/analysis/new">
                  <Button variant="primary" size="lg">
                    Start Analysis <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/dashboard/evidence">
                  <Button variant="secondary" size="lg">View Library</Button>
                </Link>
              </div>
            </div>

            {/* Right — actual product demo */}
            <div
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-rule)",
              }}
            >
              {/* Demo header */}
              <div
                className="px-5 py-3 flex items-center justify-between"
                style={{ borderBottom: "1px solid var(--color-rule)", backgroundColor: "var(--color-surface-2)" }}
              >
                <span className="eyebrow">SECURITY ANALYSIS</span>
                <span className="font-technical text-xs" style={{ color: "var(--color-ink-3)" }}>
                  DEMO OUTPUT
                </span>
              </div>

              {/* Input shown */}
              <div className="px-5 pt-4 pb-3" style={{ borderBottom: "1px solid var(--color-rule-light)" }}>
                <p className="eyebrow mb-2" style={{ color: "var(--color-ink-4)" }}>INPUT</p>
                <pre
                  className="font-technical text-xs leading-relaxed overflow-x-auto"
                  style={{ color: "var(--color-ink-2)" }}
                >
                  {DEMO_FINDING}
                </pre>
              </div>

              {/* Detection */}
              <div className="px-5 py-3" style={{ borderBottom: "1px solid var(--color-rule-light)" }}>
                <p className="eyebrow mb-1" style={{ color: "var(--color-ink-4)" }}>DETECTED</p>
                <p className="font-technical text-sm" style={{ color: "var(--color-ink)" }}>
                  Terraform / Cloud Infrastructure
                </p>
              </div>

              {/* Risk score */}
              <div
                className="px-5 py-3 flex items-center justify-between"
                style={{ borderBottom: "1px solid var(--color-rule-light)" }}
              >
                <div>
                  <p className="eyebrow mb-1" style={{ color: "var(--color-ink-4)" }}>RISK SCORE</p>
                  <p style={{ fontFamily: "var(--font-editorial)", fontSize: "2rem", lineHeight: 1, color: "var(--color-high)" }}>
                    82
                    <span className="font-ui text-sm ml-1.5" style={{ color: "var(--color-ink-3)" }}>/ 100</span>
                  </p>
                </div>
                <span className="sev-label sev-high">HIGH</span>
              </div>

              {/* Finding */}
              <div className="px-5 py-4 finding-high pl-6">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p
                    className="font-ui text-sm font-semibold"
                    style={{ color: "var(--color-ink)" }}
                  >
                    Publicly accessible S3 storage bucket
                  </p>
                  <span className="sev-label sev-high flex-shrink-0">HIGH</span>
                </div>
                <p className="font-ui text-xs mb-2" style={{ color: "var(--color-ink-3)" }}>
                  Cloud Security › Storage Access Control
                </p>
                <div className="flex gap-2 mb-3">
                  <span className="font-technical text-xs px-1.5 py-0.5 border border-[--color-rule]" style={{ color: "var(--color-ink-3)" }}>CWE-284</span>
                  <span className="font-technical text-xs px-1.5 py-0.5 border border-[--color-rule]" style={{ color: "var(--color-ink-3)" }}>CIS AWS 2.1.5</span>
                </div>
                <p className="font-ui text-xs" style={{ color: "var(--color-ink-2)" }}>
                  <strong>Fix:</strong> Set{" "}
                  <code
                    className="font-technical"
                    style={{ backgroundColor: "var(--color-surface-2)", padding: "0 3px" }}
                  >
                    acl = &quot;private&quot;
                  </code>{" "}
                  and apply an explicit bucket policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── One Input, Multiple Lenses ────────────────────────────────────── */}
      <section className="px-8 py-16" style={{ borderBottom: "1px solid var(--color-rule)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div>
              <p className="eyebrow mb-4">COVERAGE</p>
              <h2 className="headline-lg">
                One input.<br />
                Multiple<br />
                security lenses.
              </h2>
            </div>
            <div className="lg:col-span-2">
              <div style={{ borderTop: "1px solid var(--color-rule)" }}>
                {DOMAINS.map((d) => (
                  <div
                    key={d.num}
                    className="flex items-start gap-6 py-4"
                    style={{ borderBottom: "1px solid var(--color-rule-light)" }}
                  >
                    <span className="font-technical text-xs w-6 flex-shrink-0" style={{ color: "var(--color-ink-4)", paddingTop: "2px" }}>
                      {d.num}
                    </span>
                    <div>
                      <p className="font-ui text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
                        {d.name}
                      </p>
                      <p className="font-ui text-xs mt-0.5" style={{ color: "var(--color-ink-3)" }}>
                        {d.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="px-8 py-16" style={{ borderBottom: "1px solid var(--color-rule)" }}>
        <div className="max-w-6xl mx-auto">
          <p className="eyebrow mb-10">HOW IT WORKS</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-0" style={{ borderLeft: "1px solid var(--color-rule)" }}>
            {HOW_IT_WORKS.map((h) => (
              <div
                key={h.step}
                className="px-6 py-6"
                style={{ borderRight: "1px solid var(--color-rule)", borderBottom: "1px solid var(--color-rule)" }}
              >
                <p className="font-technical text-xs mb-3" style={{ color: "var(--color-ink-4)" }}>{h.step}</p>
                <p className="font-ui text-xs font-bold tracking-widest mb-3" style={{ color: "var(--color-ink)" }}>
                  {h.title}
                </p>
                <p className="font-ui text-xs leading-relaxed" style={{ color: "var(--color-ink-3)" }}>
                  {h.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section className="px-8 py-20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-8">
          <div>
            <p className="eyebrow mb-4">READY?</p>
            <h2 className="headline-lg max-w-sm">
              Security intelligence,<br />in seconds.
            </h2>
          </div>
          <Link href="/dashboard/analysis/new">
            <Button variant="primary" size="xl">
              Start Analysis <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer
        className="px-8 py-6 flex items-center justify-between"
        style={{ borderTop: "1px solid var(--color-rule)" }}
      >
        <span className="font-ui text-xs font-semibold tracking-wide" style={{ color: "var(--color-ink-3)" }}>
          SECUREFLOW AI
        </span>
        <span className="font-technical text-xs" style={{ color: "var(--color-ink-4)" }}>
          AI SECURITY INTELLIGENCE ENGINE
        </span>
      </footer>
    </div>
  );
}
