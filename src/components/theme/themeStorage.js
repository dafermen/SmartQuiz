export const THEME_KEY = "smartquiz_theme";

const defaultThemeColors = {
  primary: "#0f9f8f",
  secondary: "#162033",
  accent: "#f4b84a",
  background: "#f5f7fb",
  surface: "#ffffff",
  text: "#162033",
  muted: "#64748b",
  success: "#16a34a",
  warning: "#f59e0b",
  danger: "#dc2626"
};

export const themePresets = [
  {
    id: "smartquiz",
    labelKey: "smartquizPreset",
    colors: defaultThemeColors
  },
  {
    id: "corporateBlue",
    labelKey: "corporateBluePreset",
    colors: {
      primary: "#2563eb",
      secondary: "#111827",
      accent: "#38bdf8",
      background: "#f6f8fc",
      surface: "#ffffff",
      text: "#111827",
      muted: "#64748b",
      success: "#16a34a",
      warning: "#d97706",
      danger: "#dc2626"
    }
  },
  {
    id: "healthcare",
    labelKey: "healthcarePreset",
    colors: {
      primary: "#0f766e",
      secondary: "#134e4a",
      accent: "#22c55e",
      background: "#f3fbf8",
      surface: "#ffffff",
      text: "#12312c",
      muted: "#5b716b",
      success: "#15803d",
      warning: "#ca8a04",
      danger: "#b91c1c"
    }
  },
  {
    id: "education",
    labelKey: "educationPreset",
    colors: {
      primary: "#4f46e5",
      secondary: "#312e81",
      accent: "#f59e0b",
      background: "#f8f7ff",
      surface: "#ffffff",
      text: "#1f1b4d",
      muted: "#6b7280",
      success: "#16a34a",
      warning: "#d97706",
      danger: "#dc2626"
    }
  },
  {
    id: "security",
    labelKey: "securityPreset",
    colors: {
      primary: "#14b8a6",
      secondary: "#0f172a",
      accent: "#eab308",
      background: "#f1f5f9",
      surface: "#ffffff",
      text: "#0f172a",
      muted: "#64748b",
      success: "#22c55e",
      warning: "#f59e0b",
      danger: "#ef4444"
    }
  },
  {
    id: "minimal",
    labelKey: "minimalPreset",
    colors: {
      primary: "#404040",
      secondary: "#171717",
      accent: "#737373",
      background: "#fafafa",
      surface: "#ffffff",
      text: "#171717",
      muted: "#737373",
      success: "#15803d",
      warning: "#a16207",
      danger: "#b91c1c"
    }
  }
];

const canUseLocalStorage = () => typeof window !== "undefined" && window.localStorage;
const isHexColor = (value) => /^#[0-9a-f]{6}$/i.test(value || "");

const normalizeHexColor = (value, fallback) => (
  isHexColor(value) ? value.toLowerCase() : fallback
);

export const normalizeTheme = (theme = {}) => (
  Object.fromEntries(
    Object.entries(defaultThemeColors).map(([key, fallback]) => [
      key,
      normalizeHexColor(theme[key], fallback)
    ])
  )
);

const hexToRgb = (hex) => {
  const cleanHex = hex.replace("#", "");
  return {
    r: parseInt(cleanHex.slice(0, 2), 16),
    g: parseInt(cleanHex.slice(2, 4), 16),
    b: parseInt(cleanHex.slice(4, 6), 16)
  };
};

const rgbToHex = ({ r, g, b }) => (
  `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`
);

const mixColors = (hex, targetHex, weight = 0.14) => {
  const color = hexToRgb(hex);
  const target = hexToRgb(targetHex);

  return rgbToHex({
    r: Math.round(color.r + (target.r - color.r) * weight),
    g: Math.round(color.g + (target.g - color.g) * weight),
    b: Math.round(color.b + (target.b - color.b) * weight)
  });
};

const hexToHsl = (hex) => {
  const { r, g, b } = hexToRgb(hex);
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;

  if (max !== min) {
    const delta = max - min;
    saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    if (max === red) {
      hue = (green - blue) / delta + (green < blue ? 6 : 0);
    } else if (max === green) {
      hue = (blue - red) / delta + 2;
    } else {
      hue = (red - green) / delta + 4;
    }

    hue /= 6;
  }

  return `${Math.round(hue * 360)} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`;
};

const setCssVariable = (root, name, value) => {
  root.style.setProperty(name, value);
};

export const applyThemeToDocument = (theme) => {
  if (typeof document === "undefined") return;

  const normalizedTheme = normalizeTheme(theme);
  const root = document.documentElement;
  const primarySoft = mixColors(normalizedTheme.primary, "#ffffff", 0.9);
  const accentSoft = mixColors(normalizedTheme.accent, "#ffffff", 0.86);
  const border = mixColors(normalizedTheme.muted, "#ffffff", 0.62);

  Object.entries(normalizedTheme).forEach(([key, value]) => {
    setCssVariable(root, `--sq-${key}`, value);
  });

  setCssVariable(root, "--sq-primary-hover", mixColors(normalizedTheme.primary, "#000000", 0.13));
  setCssVariable(root, "--sq-secondary-hover", mixColors(normalizedTheme.secondary, "#000000", 0.1));
  setCssVariable(root, "--sq-primary-soft", primarySoft);
  setCssVariable(root, "--sq-accent-soft", accentSoft);
  setCssVariable(root, "--sq-border", border);

  setCssVariable(root, "--background", hexToHsl(normalizedTheme.background));
  setCssVariable(root, "--foreground", hexToHsl(normalizedTheme.text));
  setCssVariable(root, "--card", hexToHsl(normalizedTheme.surface));
  setCssVariable(root, "--card-foreground", hexToHsl(normalizedTheme.text));
  setCssVariable(root, "--popover", hexToHsl(normalizedTheme.surface));
  setCssVariable(root, "--popover-foreground", hexToHsl(normalizedTheme.text));
  setCssVariable(root, "--primary", hexToHsl(normalizedTheme.primary));
  setCssVariable(root, "--primary-foreground", "0 0% 100%");
  setCssVariable(root, "--secondary", hexToHsl(normalizedTheme.secondary));
  setCssVariable(root, "--secondary-foreground", "0 0% 100%");
  setCssVariable(root, "--accent", hexToHsl(accentSoft));
  setCssVariable(root, "--accent-foreground", hexToHsl(normalizedTheme.text));
  setCssVariable(root, "--muted", hexToHsl(primarySoft));
  setCssVariable(root, "--muted-foreground", hexToHsl(normalizedTheme.muted));
  setCssVariable(root, "--destructive", hexToHsl(normalizedTheme.danger));
  setCssVariable(root, "--border", hexToHsl(border));
  setCssVariable(root, "--input", hexToHsl(border));
  setCssVariable(root, "--ring", hexToHsl(normalizedTheme.primary));
  setCssVariable(root, "--chart-1", hexToHsl(normalizedTheme.primary));
  setCssVariable(root, "--chart-2", hexToHsl(normalizedTheme.secondary));
  setCssVariable(root, "--chart-3", hexToHsl(normalizedTheme.accent));
  setCssVariable(root, "--chart-4", hexToHsl(normalizedTheme.success));
  setCssVariable(root, "--chart-5", hexToHsl(normalizedTheme.danger));
};

export const getTheme = () => {
  if (!canUseLocalStorage()) return defaultThemeColors;

  try {
    const storedValue = localStorage.getItem(THEME_KEY);
    if (!storedValue) return defaultThemeColors;
    return normalizeTheme(JSON.parse(storedValue));
  } catch {
    return defaultThemeColors;
  }
};

export const saveTheme = (theme) => {
  const normalizedTheme = normalizeTheme(theme);

  if (canUseLocalStorage()) {
    localStorage.setItem(THEME_KEY, JSON.stringify(normalizedTheme));
  }

  applyThemeToDocument(normalizedTheme);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("smartquiz-theme-updated"));
  }

  return normalizedTheme;
};

export const resetTheme = () => saveTheme(defaultThemeColors);

export const getDefaultTheme = () => defaultThemeColors;
