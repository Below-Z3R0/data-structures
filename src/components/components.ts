// Barrel de exportacion de componentes.
// Los componentes importan entre si desde "./components" para mantener una
// unica API publica del sistema de diseno.

// --- Animations ---
export * from "./animations/animationsindex";

// --- Atoms ---
export * from "./atoms/BackgroundFX";
export * from "./atoms/Button";
export * from "./atoms/LanguageSwitcher";
export * from "./atoms/NoiseTexture";
export * from "./atoms/Paragraph";
export * from "./atoms/PilaCell";
export * from "./atoms/PilaInput";
export * from "./atoms/Span";
export * from "./atoms/ThemeSwitcher";
export * from "./atoms/ThemeToggle";
export * from "./atoms/Title1";
export * from "./atoms/Title2";
export * from "./atoms/Title3";
export * from "./atoms/Title4";

// --- Hooks ---
export * from "./hooks/themeProvider";
export * from "./hooks/useTheme";

// --- Molecules ---
export * from "./molecules/Modal";
export * from "./molecules/PilaVisualizer";

// --- Organisms ---
export * from "./organisms/ErrorPage";
export * from "./organisms/HeroSection";
export * from "./organisms/PilaSection";

// --- Skeletons ---
export * from "./skeletons/skeletonindex";
