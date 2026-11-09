// Barrel de exportacion de componentes.
// Los componentes importan entre si desde "./components" para mantener una
// unica API publica del sistema de diseno.

// --- Animations ---
export * from "./animations/animationsindex";

// --- Atoms ---
export * from "./atoms/BackgroundFX";
export * from "./atoms/Button";
export * from "./atoms/IconRender";
export * from "./atoms/LanguageSwitcher";
export * from "./atoms/LanguageToggle";
export * from "./atoms/LinkButton";
export * from "./atoms/Paragraph";
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
export * from "./molecules/ErrorMessage";
export * from "./molecules/Formulary";
export * from "./molecules/Modal";
export * from "./molecules/NavBar";
export * from "./molecules/ProjectCard";
export * from "./molecules/SuccessMessage";
export * from "./molecules/TecnologiesCard";

// --- Organisms ---
export * from "./organisms/AboutMeSection";
export * from "./organisms/ContactSection";
export * from "./organisms/ErrorPage";
export * from "./organisms/Footer";
export * from "./organisms/Header";
export * from "./organisms/HeroSection";
export * from "./organisms/ProjectsSection";
export * from "./organisms/SkillsSection";

// --- Skeletons ---
export * from "./skeletons/skeletonindex";
