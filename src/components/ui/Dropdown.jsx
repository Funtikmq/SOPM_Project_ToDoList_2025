import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./Dropdown.css";

const PALETTE = {
  status: {
    upcoming: { text: "#7b5cff", bg: "linear-gradient(180deg, rgba(123,92,255,0.18), rgba(123,92,255,0.08))", border: "rgba(123,92,255,0.4)" },
    active: { text: "#d54df7", bg: "linear-gradient(180deg, rgba(213,77,247,0.2), rgba(213,77,247,0.1))", border: "rgba(213,77,247,0.4)" },
    overdue: { text: "#ff6d6d", bg: "linear-gradient(180deg, rgba(255,109,109,0.2), rgba(255,109,109,0.1))", border: "rgba(255,109,109,0.4)" },
    canceled: { text: "#999", bg: "linear-gradient(180deg, rgba(153,153,153,0.18), rgba(153,153,153,0.08))", border: "rgba(153,153,153,0.35)" },
  },
  priority: {
    high: { text: "#d64545", bg: "#ffb3b3", border: "rgba(255,179,179,0.7)" },
    medium: { text: "#d68136", bg: "#ffd9b3", border: "rgba(255,217,179,0.7)" },
    low: { text: "#3a8f5b", bg: "#c8f2d1", border: "rgba(200,242,209,0.7)" },
  },
};

const Dropdown = ({ value, options = [], onChange, color = "status", variant, className = "" }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const menuRef = useRef(null);
  const idRef = useRef(Math.random().toString(36).slice(2, 8));
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0, width: 0 });

  const current = options.find((o) => o.value === value);
  const paletteKey = variant || color || "status";
  const palette = (PALETTE[paletteKey] && PALETTE[paletteKey][value]) || {
    text: "#4a3c77",
    bg: "rgba(255,255,255,0.9)",
    border: "rgba(0,0,0,0.08)",
  };

  const optionClass = (val) => {
    if (paletteKey !== "priority") return "";
    if (val === "high") return "priorityOptionHigh";
    if (val === "medium") return "priorityOptionMedium";
    if (val === "low") return "priorityOptionLow";
    return "";
  };

  useLayoutEffect(() => {
    if (open && wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      setMenuStyle({
        top: rect.bottom + 6 + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [open]);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const handleScroll = () => setOpen(false);
    const handleExternalOpen = (e) => {
      if (e.detail !== idRef.current) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("ui-dropdown-open", handleExternalOpen);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("ui-dropdown-open", handleExternalOpen);
    };
  }, []);

  const toggle = (e) => {
    e.stopPropagation();
    setOpen((p) => {
      const next = !p;
      if (next) {
        window.dispatchEvent(new CustomEvent("ui-dropdown-open", { detail: idRef.current }));
      }
      return next;
    });
  };

  const selectOption = (opt) => {
    onChange?.(opt.value);
    setOpen(false);
  };

  return (
    <div className={`uiDropdown ${open ? "open" : ""} ${className}`} ref={wrapRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className={`uiDropdownTrigger ${open ? "open" : ""}`}
        style={{ color: palette.text, background: palette.bg, borderColor: open ? "#b366ff" : palette.border }}
        onClick={toggle}
      >
        <span className="uiDropdownValue">{current ? current.label : ""}</span>
        <span className={`uiDropdownIcon ${open ? "open" : ""}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </span>
      </button>

      {open &&
        createPortal(
          <div
            className={`uiDropdownMenu ${open ? "open" : ""}`}
            style={{ top: menuStyle.top, left: menuStyle.left, width: menuStyle.width }}
            ref={menuRef}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <ul className="uiDropdownList">
              {options.map((opt) => (
                <li key={opt.value} className="uiDropdownItem">
                  <button
                    type="button"
                    className={`uiDropdownOption ${value === opt.value ? "active" : ""} ${optionClass(opt.value)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectOption(opt);
                    }}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )}
    </div>
  );
};

export default Dropdown;
