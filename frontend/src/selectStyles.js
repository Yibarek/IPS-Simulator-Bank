export const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "var(--surface-color)",
    borderColor: state.isFocused
      ? "var(--accent-color)"
      : "var(--border-color)",
    boxShadow: state.isFocused
      ? "0 0 0 1px var(--accent-color)"
      : "none",
    color: "var(--default-color)",
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: "var(--accent-color)",
    },
  }),

  menu: (base) => ({
    ...base,
    backgroundColor: "var(--card-bg)",
    border: "1px solid var(--border-color)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "var(--accent-color)"
      : state.isFocused
      ? "var(--accent-soft)"
      : "transparent",
    color: state.isSelected
      ? "var(--contrast-color)"
      : "var(--default-color)",
    cursor: "pointer",
  }),

  singleValue: (base) => ({
    ...base,
    color: "var(--default-color)",
  }),

  input: (base) => ({
    ...base,
    color: "var(--default-color)",
  }),

  placeholder: (base) => ({
    ...base,
    color: "var(--muted-text)",
  }),

  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused
      ? "var(--accent-color)"
      : "var(--muted-text)",
    "&:hover": {
      color: "var(--accent-color)",
    },
  }),

  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: "var(--border-color)",
  }),

  menuList: (base) => ({
    ...base,
    maxHeight: 220,
    overflowY: "auto",
  }),
};
