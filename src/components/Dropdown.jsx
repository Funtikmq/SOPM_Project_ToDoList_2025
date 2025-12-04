import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./Dropdown.css";

const Dropdown = ({
  options = [],
  value,
  onChange,
  placeholder = "Select",
  label,
  badgeClass = "",
  isDate = false,
  className = "",
  open: controlledOpen,
  onOpenChange,
}) => {
  const [open, setOpen] = useState(controlledOpen ?? false);
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (controlledOpen === undefined) return;
    setOpen(!!controlledOpen);
  }, [controlledOpen]);

  useEffect(() => {
    const handleClick = (e) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
        onOpenChange?.(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onOpenChange]);

  return (
    <div className={`dropdown ${className} ${open ? "open" : ""}`}>
      {label && <span className="dropdownLabel">{label}</span>}
      <button
        ref={triggerRef}
        className={`dropdownTrigger ${badgeClass}`}
        onClick={() => {
          setOpen((p) => {
            const next = !p;
            if (!p && triggerRef.current) {
              const rect = triggerRef.current.getBoundingClientRect();
              setMenuStyle({
                top: rect.bottom + 6 + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
              });
            }
            onOpenChange?.(next);
            return next;
          });
        }}
        onMouseDown={(e) => e.stopPropagation()}
        type="button"
      >
        <span className="dropdownValue">
          {selected ? selected.label : placeholder}
        </span>
        <span className={`dropdownIcon ${open ? "open" : ""}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M7 10l5 5l5-5z"
            />
          </svg>
        </span>
      </button>

      {open &&
        createPortal(
          <div
            className={`dropdownMenu customDropdownMenu ${open ? "open" : ""}`}
            ref={menuRef}
            style={{ position: "fixed", top: menuStyle.top, left: menuStyle.left, width: menuStyle.width }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {isDate ? (
              <div className="dropdownDate">
                <input
                  type="date"
                  value={value || ""}
                  onChange={(e) => {
                    onChange?.(e.target.value);
                    setOpen(false);
                    onOpenChange?.(false);
                  }}
                />
              </div>
            ) : (
              options.map((opt) => (
                <button
                  key={opt.value}
                  className={`dropdownOption ${opt.value === value ? "active" : ""}`}
                  onClick={() => {
                    onChange?.(opt.value);
                    setOpen(false);
                    onOpenChange?.(false);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  type="button"
                >
                  {opt.icon && <span className="dropdownOptionIcon">{opt.icon}</span>}
                  {opt.label}
                </button>
              ))
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

export default Dropdown;
