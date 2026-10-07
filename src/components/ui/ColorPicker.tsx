import { useState, useRef } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { COLOR_OPTIONS, type ColorOption } from "../../lib/colors";
import { useClickOutside } from "../../lib/hooks/useClickOutside";
import { useAnimatedPresence } from "../../lib/hooks/useAnimatedPresence";

interface ColorPickerProps {
  value?: string; // the color name string e.g. "Navy"
  onChange: (name: string) => void;
  error?: string;
}

export function ColorPicker({ value, onChange, error }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { ref: dropdownRef, shouldRender } =
    useAnimatedPresence<HTMLDivElement>(isOpen, {
      from: { opacity: 0, y: -6, scale: 0.97 },
      to: { opacity: 1, y: 0, scale: 1 },
    });

  useClickOutside(
    [buttonRef as any, dropdownRef],
    () => setIsOpen(false),
    isOpen,
  );

  const selected = COLOR_OPTIONS.find((c) => c.name === value);

  const handleSelect = (color: ColorOption) => {
    onChange(color.name);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">
        Color (optional)
      </label>

      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen((o) => !o)}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-md border bg-surface text-left transition-colors
            focus:outline-none focus:ring-2 focus:ring-primary
            ${error ? "border-red-500" : "border-border"}`}
        >
          {selected ? (
            <>
              <span
                className="w-5 h-5 rounded-full border border-border shrink-0"
                style={{ backgroundColor: selected.hex }}
              />
              <span className="flex-1 text-sm">{selected.name}</span>
              <button
                type="button"
                onClick={handleClear}
                className="text-muted hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              <span className="w-5 h-5 rounded-full border-2 border-dashed border-border shrink-0" />
              <span className="flex-1 text-sm text-muted">
                Select a color...
              </span>
              <ChevronDown
                size={16}
                className={`text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </>
          )}
        </button>

        {shouldRender && (
          <div
            ref={dropdownRef}
            className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg p-3"
          >
            <div className="grid grid-cols-6 gap-2">
              {COLOR_OPTIONS.map((color) => {
                const isSelected = color.name === value;
                const isWhite = color.hex === "#FFFFFF";
                return (
                  <button
                    key={color.name}
                    type="button"
                    title={color.name}
                    onClick={() => handleSelect(color)}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-110
                        ${isSelected ? "ring-2 ring-offset-2 ring-primary" : ""}
                        ${isWhite ? "border border-border" : ""}`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {isSelected && (
                        <Check
                          size={14}
                          className={isWhite ? "text-foreground" : "text-white"}
                          strokeWidth={3}
                        />
                      )}
                    </span>
                    <span className="text-xs text-muted leading-tight text-center max-w-10 truncate">
                      {color.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
