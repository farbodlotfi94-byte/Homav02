import svgPaths from "./svg-3warqgas9r";

function Group() {
  return (
    <div className="absolute h-[105.254px] left-[84.75px] top-[217.75px] w-[210.51px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 211 106">
        <g id="Group 1">
          <rect fill="var(--fill-0, #5D0D02)" height="64" id="Rectangle 1" rx="32" transform="rotate(-45 4.86374e-05 45.2548)" width="64" x="4.86374e-05" y="45.2548" />
          <rect fill="var(--fill-0, #5D0D02)" height="64" id="Rectangle 2" rx="32" transform="rotate(45 165.255 -1.22186e-05)" width="64" x="165.255" y="-1.22186e-05" />
          <path d={svgPaths.p3d02600} fill="var(--fill-0, #5D0D02)" id="Ellipse 1 (Stroke)" />
        </g>
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="relative size-[32px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Frame 25">
          <rect fill="var(--fill-0, #5D0D02)" height="32" rx="16" width="32" />
          <path d={svgPaths.p287a1d00} fill="var(--fill-0, #FF7A7B)" id="Ellipse 1 (Stroke)" />
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
    <div className="bg-[#5d0d02] box-border content-stretch flex gap-[8px] items-center justify-center px-[32px] py-[16px] relative rounded-[24px] shrink-0 w-[150px]">
      <p className="font-['Vazirmatn:SemiBold',_sans-serif] font-semibold leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre" dir="auto">
        ثبت
      </p>
      <ArrowForward />
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute bg-[rgba(16,24,40,0.05)] box-border content-stretch flex items-center justify-between left-1/2 pl-[64px] pr-0 py-0 rounded-[24px] top-[685px] translate-x-[-50%] w-[336px]">
      <p className="font-['Vazirmatn:SemiBold',_sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#5d0d02] text-[16px] text-nowrap whitespace-pre" dir="auto">
        نظر بده!
      </p>
      <Frame />
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute content-stretch flex font-['Vazirmatn:Black',_sans-serif] font-black gap-[256px] items-center leading-[normal] left-[162px] text-[64px] text-center text-nowrap top-[352px] whitespace-pre">
      <p className="opacity-[0.35] relative shrink-0 text-[#5d0d02]" dir="auto">
        بد
      </p>
      <p className="opacity-[0.35] relative shrink-0 text-[#fc6f20]" dir="auto">
        معمولی
      </p>
      <p className="opacity-[0.35] relative shrink-0 text-[#00312d]" dir="auto">
        خوب
      </p>
    </div>
  );
}

export default function Frame4() {
  return (
    <div className="bg-[#ff7a7b] overflow-clip relative rounded-[24px] size-full">
      <p className="absolute font-['Vazirmatn:Medium',_sans-serif] font-medium leading-[30px] left-1/2 text-[#5d0d02] text-[20px] text-center top-[80px] translate-x-[-50%] w-[364px]" dir="auto">
        تجربه‌ات چطور بود؟
      </p>
      <Group />
      <div className="absolute h-[16px] left-[19px] top-[591px] w-[336px]" data-name="Union">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 336 16">
          <path d={svgPaths.p276798f0} fill="var(--fill-0, #101828)" id="Union" opacity="0.05" />
        </svg>
      </div>
      <div className="absolute flex items-center justify-center left-[11px] size-[32px] top-[583px]">
        <div className="flex-none rotate-[180deg]">
          <Frame1 />
        </div>
      </div>
      <Frame2 />
      <Frame3 />
    </div>
  );
}