import svgPaths from "./svg-exwl9f18tp";

function Group() {
  return (
    <div className="absolute h-[133px] left-[82px] top-[190px] w-[216px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 216 133">
        <g id="Group 1">
          <rect fill="var(--fill-0, #00312D)" height="96" id="Rectangle 1" rx="48" width="96" />
          <rect fill="var(--fill-0, #00312D)" height="96" id="Rectangle 2" rx="48" width="96" x="120" />
          <path d={svgPaths.p19adc580} fill="var(--fill-0, #00312D)" id="Ellipse 1 (Stroke)" />
        </g>
      </svg>
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute left-[331px] size-[32px] top-[583px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Frame 25">
          <rect fill="var(--fill-0, #00312D)" height="32" rx="16" width="32" />
          <path d={svgPaths.p287a1d00} fill="var(--fill-0, #9BC263)" id="Ellipse 1 (Stroke)" />
        </g>
      </svg>
    </div>
  );
}

function ArrowForward() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="arrow_forward">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="arrow_forward">
          <path d={svgPaths.p54e7200} fill="var(--fill-0, white)" id="icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="box-border content-stretch flex gap-[8px] items-center justify-center px-[32px] py-[16px] relative rounded-[24px] shrink-0 w-[150px]" style={{ backgroundColor: "var(--feedback-good)" }}>
      <p className="relative shrink-0 text-nowrap text-white whitespace-pre" style={{ fontFamily: "var(--font-family-vazirmatn)", fontWeight: "var(--font-weight-semibold)", fontSize: "16px", lineHeight: "24px" }} dir="auto">
        ثبت
      </p>
      <ArrowForward />
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute bg-[rgba(16,24,40,0.05)] box-border content-stretch flex items-center justify-between left-1/2 pl-[64px] pr-0 py-0 rounded-[24px] top-[685px] translate-x-[-50%] w-[336px]">
      <p className="relative shrink-0 text-nowrap whitespace-pre" style={{ fontFamily: "var(--font-family-vazirmatn)", fontWeight: "var(--font-weight-semibold)", fontSize: "16px", lineHeight: "24px", color: "var(--feedback-good)" }} dir="auto">
        نظر بده!
      </p>
      <Frame />
    </div>
  );
}

function Frame4() {
  return (
    <div className="absolute content-stretch flex gap-[256px] items-center leading-[normal] left-1/2 text-center text-nowrap top-[352px] translate-x-[-50%] whitespace-pre" style={{ fontFamily: "var(--font-family-vazirmatn)", fontWeight: 900, fontSize: "64px" }}>
      <p className="opacity-[0.35] relative shrink-0" style={{ color: "var(--feedback-bad)" }} dir="auto">
        بد
      </p>
      <p className="opacity-[0.35] relative shrink-0" style={{ color: "var(--feedback-neutral)" }} dir="auto">
        معمولی
      </p>
      <p className="opacity-[0.35] relative shrink-0" style={{ color: "var(--feedback-good)" }} dir="auto">
        خوب
      </p>
    </div>
  );
}

export default function Frame1() {
  return (
    <div className="overflow-clip relative rounded-[24px] size-full" style={{ backgroundColor: "#9bc263" }}>
      <p className="absolute left-1/2 text-center top-[80px] translate-x-[-50%] w-[364px]" style={{ fontFamily: "var(--font-family-vazirmatn)", fontWeight: "var(--font-weight-semibold)", fontSize: "20px", lineHeight: "30px", color: "var(--feedback-good)" }} dir="auto">
        تجربه‌ات چطور بود؟
      </p>
      <Group />
      <div className="absolute h-[16px] left-[19px] top-[591px] w-[336px]" data-name="Union">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 336 16">
          <path d={svgPaths.p276798f0} fill="var(--fill-0, #101828)" id="Union" opacity="0.05" />
        </svg>
      </div>
      <Frame2 />
      <Frame3 />
      <Frame4 />
    </div>
  );
}
