import type { ReactNode } from "react";

type SpotProps = { className?: string };

const blue = "#00004E";
const green = "#00BF00";
const link = "#0064FF";
const ink = "#333371";
const mint = "#E6F9E6";
const wash = "#E6F0FF";

function Frame({ className, children }: SpotProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 160 120" fill="none" className={className} aria-hidden>
      {children}
    </svg>
  );
}

export function EducationIllustration({ className }: SpotProps) {
  return (
    <Frame className={className}>
      <path d="M28 78c14-8 26-8 40 0V40c-14-8-26-8-40 0v38z" fill={wash} stroke={blue} strokeWidth="2" strokeLinejoin="round" />
      <path d="M68 78c14-8 26-8 40 0V40c-14-8-26-8-40 0v38z" fill="white" stroke={blue} strokeWidth="2" strokeLinejoin="round" />
      <path d="M68 40v38" stroke={blue} strokeWidth="2" />
      <path d="M40 48h16M40 56h12M80 48h16M80 56h12" stroke={link} strokeWidth="2" strokeLinecap="round" />
      <rect x="108" y="18" width="40" height="28" rx="12" fill={mint} stroke={blue} strokeWidth="2" />
      <text x="128" y="37" textAnchor="middle" fill={blue} fontSize="13" fontFamily="Arial, sans-serif">Aa</text>
      <rect x="18" y="18" width="36" height="28" rx="12" fill="white" stroke={green} strokeWidth="2" />
      <text x="36" y="37" textAnchor="middle" fill={blue} fontSize="14" fontFamily="Arial, sans-serif">ع</text>
      <path d="M118 70l22 28" stroke={ink} strokeWidth="2" strokeLinecap="round" />
      <path d="M116 68l6 2-4 5z" fill={green} />
    </Frame>
  );
}

export function AccountingIllustration({ className }: SpotProps) {
  return (
    <Frame className={className}>
      <rect x="18" y="28" width="52" height="68" rx="12" fill={wash} stroke={blue} strokeWidth="2" />
      <rect x="28" y="38" width="32" height="16" rx="4" fill="white" stroke={link} strokeWidth="2" />
      <circle cx="34" cy="66" r="3" fill={green} />
      <circle cx="46" cy="66" r="3" fill={blue} />
      <circle cx="58" cy="66" r="3" fill={green} />
      <circle cx="34" cy="78" r="3" fill={blue} />
      <circle cx="46" cy="78" r="3" fill={green} />
      <circle cx="58" cy="78" r="3" fill={blue} />
      <rect x="78" y="62" width="12" height="28" rx="4" fill={mint} stroke={blue} strokeWidth="2" />
      <rect x="94" y="48" width="12" height="42" rx="4" fill={wash} stroke={blue} strokeWidth="2" />
      <rect x="110" y="36" width="12" height="54" rx="4" fill={green} />
      <rect x="124" y="22" width="26" height="36" rx="6" fill="white" stroke={blue} strokeWidth="2" />
      <path d="M130 40h14M130 46h10" stroke={ink} strokeWidth="2" strokeLinecap="round" />
      <path d="M132 50l3 3 6-7" stroke={green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}

export function VideoSessionIllustration({ className }: SpotProps) {
  return (
    <Frame className={className}>
      <rect x="48" y="16" width="64" height="88" rx="16" fill="white" stroke={blue} strokeWidth="2" />
      <rect x="56" y="28" width="48" height="36" rx="8" fill={wash} stroke={link} strokeWidth="2" />
      <circle cx="80" cy="46" r="8" fill={mint} stroke={blue} strokeWidth="2" />
      <rect x="70" y="86" width="20" height="4" rx="2" fill={ink} />
      <rect x="104" y="58" width="36" height="24" rx="10" fill={mint} stroke={green} strokeWidth="2" />
      <circle cx="116" cy="70" r="3" fill={blue} />
      <circle cx="126" cy="70" r="3" fill={link} />
    </Frame>
  );
}

export function BookingIllustration({ className }: SpotProps) {
  return (
    <Frame className={className}>
      <rect x="40" y="22" width="80" height="76" rx="14" fill="white" stroke={blue} strokeWidth="2" />
      <path d="M40 42h80" stroke={blue} strokeWidth="2" />
      <rect x="40" y="22" width="80" height="20" rx="14" fill={wash} />
      <path d="M40 36h80" stroke={blue} strokeWidth="2" />
      <rect x="58" y="16" width="6" height="14" rx="3" fill={blue} />
      <rect x="96" y="16" width="6" height="14" rx="3" fill={blue} />
      <circle cx="80" cy="70" r="16" fill={mint} stroke={green} strokeWidth="2" />
      <path d="M72 70l5 5 11-12" stroke={green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}

export function VerifiedIllustration({ className }: SpotProps) {
  return (
    <Frame className={className}>
      <path d="M80 16l36 14v28c0 22-16 36-36 46-20-10-36-24-36-46V30l36-14z" fill={wash} stroke={blue} strokeWidth="2" strokeLinejoin="round" />
      <path d="M68 58l8 8 16-18" stroke={green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M112 78l16 10-16 10" stroke={link} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}

export function EmptySearchIllustration({ className }: SpotProps) {
  return (
    <Frame className={className}>
      <rect x="28" y="28" width="72" height="56" rx="14" fill="white" stroke={blue} strokeWidth="2" />
      <path d="M42 48h28M42 58h18" stroke={ink} strokeWidth="2" strokeLinecap="round" />
      <circle cx="108" cy="72" r="18" fill={mint} stroke={link} strokeWidth="2" />
      <path d="M120 84l14 14" stroke={blue} strokeWidth="2" strokeLinecap="round" />
    </Frame>
  );
}
