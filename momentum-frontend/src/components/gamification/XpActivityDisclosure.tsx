import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type XpActivityItem = {
  label: string;
  value: string;
  detail: string;
};

type Props = {
  title: string;
  subtitle: string;
  items: XpActivityItem[];
  closedLabel?: string;
  footnote?: string;
};

export default function XpActivityDisclosure({
  title,
  subtitle,
  items,
  footnote,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (root.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative w-fit self-start">
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className="flex h-7 min-w-[2.5rem] items-center justify-center rounded-full border border-[#e4dccd] bg-[#fffdfa] px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6c6559] shadow-[0_8px_18px_rgba(57,52,43,0.08)] transition-colors hover:bg-[#faf6ef] hover:text-[#304034]"
        aria-expanded={isOpen}
        aria-label={title}
        title={title}
      >
        XP
      </button>

      {isOpen ? (
        <button
          aria-hidden="true"
          tabIndex={-1}
          className="fixed inset-0 z-30 cursor-default bg-transparent"
          onClick={() => setIsOpen(false)}
        >
          {" "}
        </button>
      ) : null}

      {isOpen ? (
        <div className="absolute right-0 top-full z-40 mt-1.5 w-[17rem] rounded-[0.95rem] border border-[#e7e0d4] bg-[#fffdfa] p-2.5 shadow-[0_18px_40px_rgba(57,52,43,0.14)] sm:w-[18rem]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-heading text-[0.95rem] font-semibold text-[#2f3e32]">
                {title}
              </p>
              <p className="mt-0.5 text-[11px] leading-5 text-[#8a826f]">
                {subtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#e4dccd] bg-white/80 text-[#6c6559] transition-colors hover:bg-[#faf6ef]"
              aria-label="Close XP activity"
            >
              <ChevronDown className="h-4 w-4 rotate-180" />
            </button>
          </div>

          <div className="mt-2.5 max-h-[15rem] space-y-1.5 overflow-y-auto border-t border-[#eee7da] pt-2.5 pr-1 [scrollbar-color:#d8d1c4_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d8d1c4] [&::-webkit-scrollbar-thumb]:border-[2px] [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent">
            {items.map((item) => (
              <div
                key={item.label}
                className="rounded-[0.85rem] border border-[#ece5d8] bg-white/75 px-2.5 py-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold text-[#2f3e32]">
                    {item.label}
                  </p>
                  <span className="rounded-full bg-[#f4efe6] px-2 py-0.5 text-[11px] font-semibold text-[#61584a]">
                    {item.value}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-[#7b7467]">{item.detail}</p>
              </div>
            ))}

            {footnote ? (
              <p className="pt-0.5 text-[11px] text-[#8a826f]">{footnote}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
