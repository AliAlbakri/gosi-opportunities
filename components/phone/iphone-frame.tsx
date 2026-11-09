import type { ReactNode } from "react";

function Hardware({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <span className="absolute left-0 top-[118px] h-7 w-[3px] rounded-l-sm bg-[#3a3a3c]" />
      <span className="absolute left-0 top-[164px] h-12 w-[3px] rounded-l-sm bg-[#3a3a3c]" />
      <span className="absolute left-0 top-[224px] h-12 w-[3px] rounded-l-sm bg-[#3a3a3c]" />
      <span className="absolute right-0 top-[176px] h-16 w-[3px] rounded-r-sm bg-[#3a3a3c]" />
    </div>
  );
}

export function IphoneFrame({
  children,
  responsive = false,
}: {
  children: ReactNode;
  /** Bezel only from 500px up. Below that the glass fills the viewport, so an iframe does not nest a second phone. */
  responsive?: boolean;
}) {
  if (!responsive) {
    return (
      <div className="relative mx-auto h-[892px] w-[438px]">
        <Hardware />
        <div className="absolute left-3 top-3 h-[868px] w-[414px] rounded-[54px] bg-[#1c1c1e] p-3 shadow-[0_24px_60px_rgba(0,0,78,0.28)]">
          <div className="h-[844px] w-[390px] overflow-hidden rounded-[42px] bg-gosi-midnight-10 [transform:translateZ(0)]">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-[500px]:grid min-[500px]:min-h-dvh min-[500px]:place-items-center min-[500px]:bg-[#e7e8ee] min-[500px]:p-6">
      <div className="relative max-[499px]:h-dvh max-[499px]:overflow-hidden min-[500px]:h-[892px] min-[500px]:w-[438px]">
        <Hardware className="max-[499px]:hidden" />
        <div className="h-full w-full min-[500px]:absolute min-[500px]:left-3 min-[500px]:top-3 min-[500px]:h-[868px] min-[500px]:w-[414px] min-[500px]:rounded-[54px] min-[500px]:bg-[#1c1c1e] min-[500px]:p-3 min-[500px]:shadow-[0_24px_60px_rgba(0,0,78,0.28)]">
          <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-gosi-midnight-10 [transform:translateZ(0)] min-[500px]:h-[844px] min-[500px]:w-[390px] min-[500px]:rounded-[42px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
