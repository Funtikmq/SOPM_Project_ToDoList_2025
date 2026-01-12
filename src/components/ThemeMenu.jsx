import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../context/ThemeContext";
import "./ThemeMenu.css";

const ThemeMenu = ({ open, anchorRef, onClose, position }) => {
  const { availableThemes, theme, setTheme } = useTheme();
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (e) => {
      if (menuRef.current?.contains(e.target) || anchorRef?.current?.contains(e.target)) return;
      onClose?.();
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open, anchorRef, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="themeMenuPopover themePickerDropdown"
      ref={menuRef}
      style={{
        top: position?.top ?? 0,
        left: position?.left ?? 0,
      }}
    >
      <div className="themeMenuTitle">Theme Picker</div>
      <div className="themeMenuGrid">
        {availableThemes.map((item) => (
          <button
            key={item.id}
            className={`themeOption ${item.id} ${theme === item.id ? "selected" : ""}`}
            onClick={() => {
              setTheme(item.id);
              onClose?.();
            }}
          >
            <span className="themeSwatch" />
            <span className="themeLabel">{item.label}</span>
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
};

export default ThemeMenu;
