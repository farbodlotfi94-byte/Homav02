import { ChevronLeft } from "lucide-react";
import { Logo } from "./Logo";

interface HeaderProps {
  onBack?: () => void;
  showBackButton?: boolean;
}

export function Header({ onBack, showBackButton = true }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-lg mx-auto px-6 h-14 flex items-center justify-between">
        <div className="w-9" />
        <Logo />
        {showBackButton ? (
          <button 
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-900 transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 text-gray-900 group-hover:text-white transition-colors" />
          </button>
        ) : (
          <div className="w-9" />
        )}
      </div>
    </header>
  );
}