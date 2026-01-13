import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../context/ThemeContext";
import ThemeIcon from "./ThemeIcon";
import "./ThemePicker.css";

const DROPDOWN_WIDTH = 240;

const ThemePicker = () => {
  const { availableThemes, theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const padding = 8;
    const maxLeft = window.innerWidth - DROPDOWN_WIDTH - padding;
    const computedLeft = Math.max(padding, Math.min(maxLeft, rect.left + window.scrollX));
    setPosition({
      top: rect.bottom + window.scrollY + 8,
      left: computedLeft,
    });
  };

  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (e) => {
      if (menuRef.current?.contains(e.target) || triggerRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const handleResize = () => updatePosition();
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  const dropdown = useMemo(() => {
    if (!open) return null;
    return createPortal(
      <div
        className="themePickerDropdown"
        style={{ top: position.top, left: position.left, width: DROPDOWN_WIDTH }}
        ref={menuRef}
      >
        <div className="themePickerTitle">Theme Picker</div>
        <div className="themePickerGrid">
          {availableThemes.map((item) => (
            <button
              key={item.id}
              className={`themePickerOption ${item.id} ${theme === item.id ? "selected" : ""}`}
              onClick={() => {
                setTheme(item.id);
                setOpen(false);
              }}
            >
              <span className="themePickerSwatch" />
              <span className="themePickerLabel">{item.label}</span>
            </button>
          ))}
        </div>
      </div>,
      document.body
    );
  }, [open, position.top, position.left, availableThemes, theme, setTheme]);

  return (
    <div className="themePickerWrap" ref={triggerRef}>
      <button
        className="iconButton theme-picker-btn"
        onClick={() => {
          updatePosition();
          setOpen((p) => !p);
        }}
        aria-label="Theme Picker"
        title="Theme Picker"
        type="button"
      >
        <ThemeIcon />
      </button>
      {dropdown}
    </div>
  );
};

export default ThemePicker;
