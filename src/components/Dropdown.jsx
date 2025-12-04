import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./Dropdown.css";

const STATUS_COLORS = {
  upcoming: { bg: "linear-gradient(180deg,#f1e9ff,#e2d4ff)", text: "#7a42ff", border: "rgba(122,66,255,0.4)" },
  active: { bg: "linear-gradient(180deg,#f6ddff,#ebb8ff)", text: "#be2fff", border: "rgba(190,47,255,0.45)" },
  overdue: { bg: "linear-gradient(180deg,#ffe5e1,#ffd2cb)", text: "#e04343", border: "rgba(224,67,67,0.4)" },
  canceled: { bg: "linear-gradient(180deg,#ededf0,#e1e1e4)", text: "#7f7f7f", border: "rgba(127,127,127,0.35)" },
};

const PRIORITY_COLORS = {
  high: { bg: "linear-gradient(180deg,#ffe2dd,#ffc7c0)", text: "#d6423a", border: "rgba(214,66,58,0.4)" },
  medium: { bg: "linear-gradient(180deg,#ffe9d3,#ffd9b5)", text: "#c76f19", border: "rgba(199,111,25,0.4)" },
  low: { bg: "linear-gradient(180deg,#e3f7ed,#c7edda)", text: "#2f9f7a", border: "rgba(47,159,122,0.35)" },
};

const COLOR_MAP = { ...STATUS_COLORS, ...PRIORITY_COLORS };

const Dropdown = ({
  value,
  onChange,
  options = [],
  placeholder = "Select",
  variant = "status", // "status" | "priority"
  label,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const selected = options.find((o) => o.value === value);
  const colors = COLOR_MAP[value] || { bg: "rgba(255,255,255,0.9)", text: "#4a3c77", border: "rgba(0,0,0,0.08)" };

  const closeMenu = () => setOpen(false);

  useLayoutEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuStyle({
        top: rect.bottom + 8 + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [open]);

  useEffect(() => {
    const handleClick = (e) => {
      if (triggerRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      closeMenu();
    };
    const handleScroll = () => closeMenu();
    if (open) {
      document.addEventListener("mousedown", handleClick);
      window.addEventListener("scroll", handleScroll, true);
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  return (
    <div className={`dropdownWrapper ${className}`}>
      {label && <span className="dropdownLabel">{label}</span>}
      <button
        ref={triggerRef}
        type="button"
        className={`dropdownPill dropdownPill--${variant} dropdownPill--${value} ${open ? "open" : ""}`}
        style={{
          background: colors.bg,
          color: colors.text,
          borderColor: colors.border,
        }}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        <span className="dropdownValue">{selected ? selected.label : placeholder}</span>
        <span className={`dropdownIcon ${open ? "open" : ""}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
            <path fill="currentColor" d="M7 10l5 5l5-5z" />
          </svg>
        </span>
      </button>

      {open &&
        createPortal(
          <div
            className={`dropdownMenu glassMenu ${open ? "open" : ""}`}
            style={{ position: "fixed", top: menuStyle.top, left: menuStyle.left, width: menuStyle.width }}
            ref={menuRef}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {options.map((opt) => {
              const optColors = COLOR_MAP[opt.value] || colors;
              const isActive = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`dropdownOption ${isActive ? "dropdownOptionSelected" : ""} dropdownOption--${opt.value}`}
                  style={{
                    color: optColors.text,
                    borderColor: isActive ? optColors.border : "transparent",
                    background: isActive ? optColors.bg : "transparent",
                  }}
                  onClick={() => {
                    onChange?.(opt.value);
                    closeMenu();
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
};

export default Dropdown;
