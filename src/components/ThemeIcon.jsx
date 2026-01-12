const ThemeIcon = ({ size = 22, color = "currentColor", ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    <circle cx="6" cy="12" r="2.6" />
    <circle cx="12" cy="12" r="2.6" />
    <circle cx="18" cy="12" r="2.6" />
  </svg>
);

export default ThemeIcon;
