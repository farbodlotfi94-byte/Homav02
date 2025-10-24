import svgPaths from "./svg-an2xierte7";

function KeyboardArrowDown() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="keyboard_arrow_down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="keyboard_arrow_down">
          <path d={svgPaths.p2b1b0180} fill="var(--fill-0, #1D1B20)" id="icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="basis-0 bg-gray-100 grow h-[48px] min-h-px min-w-px relative rounded-[16px] shrink-0" data-name="Button">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[8px] h-[48px] items-center justify-center px-[16px] py-[8px] relative w-full">
          <KeyboardArrowDown />
          <p className="font-['Vazirmatn:Medium',_sans-serif] font-medium leading-[20px] relative shrink-0 text-[#101828] text-[14px] text-nowrap whitespace-pre" dir="auto">
            جزئیات محصول
          </p>
        </div>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full">
      <Button />
    </div>
  );
}

export default function Component() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[16px] items-start relative rounded-[24px] size-full" data-name="Component 1">
      <Frame />
    </div>
  );
}