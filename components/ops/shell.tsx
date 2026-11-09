import Link from "next/link";

const links = [
  ["Overview", ""],
  ["Invitations", "/invitations"],
  ["Review queue", "/review"],
  ["Retirees", "/retirees"],
  ["Reports and disputes", "/reports"],
  ["Settlement", "/settlement"],
  ["Audit log", "/audit"],
];

export function OpsShell({ operatorId, name, children }: { operatorId: string; name: string; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-gosi-midnight-10 text-gosi-rich-blue">
      <div className="grid min-h-dvh md:grid-cols-[240px_1fr]">
        <aside className="bg-white p-4">
          <img src="/brand/logo/gosi-wordmark-color.svg" alt="gosi" className="mb-6 h-8" />
          <p className="mb-4 text-sm">{name}</p>
          <nav className="space-y-2 text-sm">
            {links.map(([label, href]) => (
              <Link key={label} className="block rounded-xl px-2 py-2 hover:bg-gosi-midnight-10" href={`/ops/${operatorId}${href}`}>{label}</Link>
            ))}
          </nav>
          <a className="mt-6 block rounded-xl px-2 py-2 text-sm text-gosi-blue hover:bg-gosi-midnight-10" href="/clock">Demo clock</a>
        </aside>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
