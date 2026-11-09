import type {
  ButtonHTMLAttributes,
  HTMLInputTypeAttribute,
  MouseEventHandler,
  ReactNode,
} from "react";

// =============================================================================
// TIPOS INFERIDOS DE SCHEMAS.TS (tipos de dominio de la BD)
// =============================================================================

import type { IconKey } from "@/services/assets/icon-registry";
import type {
  AboutMeContent,
  AboutMeMetadata,
  AboutMeSection,
  Contact,
  ContactContent,
  ContactSection,
  FooterContent,
  FooterSection,
  Form,
  HeroContent,
  HeroMetadata,
  HeroSection,
  ModalContent,
  NavbarContent,
  NavbarSection,
  ProjectItem,
  ProjectsContent,
  ProjectsList,
  ProjectsMetadata,
  ProjectsSection,
  SkillsContent,
  SkillsMetadata,
  SkillsSection,
} from "./schemas";

// =============================================================================
// GLOBALES
// =============================================================================

export type Theme = "dark" | "light" | "system";
export type Language = "en" | "es";

// =============================================================================
// ATOMS — contratos UI puros (sin lógica de negocio)
// =============================================================================

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children?: ReactNode;
  alt?: string;
  img?: string | null;
  /** Key del ICON_REGISTRY (e.g. "github", "daynight") o path "folder/file.svg". */
  svg?: IconKey | string;
  svgStyle?: string;
  txt?: string | null;
  buttonBody?: string;
  txtStyle?: string;
  imgStyle?: string;
}

export type TitleProps = {
  txt: string | undefined;
  className?: string;
};

export interface LinkButtonProps extends ButtonProps {
  link: string | null;
}

export interface IconRendererProps {
  name: string;
  className?: string;
}

export interface Title {
  txt: string | undefined;
  className?: string;
}

export interface SpanProps extends Title {
  children?: ReactNode;
  id?: string;
  role?: string;
}

// =============================================================================
// MOLECULES — UI con data del orquestador
// =============================================================================

export interface NavBarProps {
  nav_data: NavbarSection;
  name?: boolean;
  GeneralOrganization?: string;
  LinksOrganization?: string;
  ThemeMenuOrganization?: string;
}

export interface ProjectCardProps {
  project_data: { meta: ProjectsMetadata; data: ProjectItem };
  labels_data: { featured: string; in_construction: string };
  category: string | undefined;
}

type ModalData = ModalContent & {
  category: string | undefined;
  title: string;
};

export interface ModalProps {
  img: string | undefined;
  in_construction: string;
  data: ModalData;
  activeTxt: string | undefined;
  setActivetxt: (txt: string) => void;
  open: boolean;
  onClose: () => void;
}

export interface TecnologiesConfig {
  svg: IconKey | string;
  color?: string;
  name?: string;
  bar?: boolean;
  cardStyle?: string;
  iconStyle?: string;
  description?: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: HTMLInputTypeAttribute;
  placeholder: string;
}

export interface FormularyProps {
  form_data: Form;
  bodyStyle?: string;
  labelStyle?: string;
  inputStyle?: string;
  className?: string;
}

export type FormStatus = "idle" | "loading" | "success" | "error";

export interface SuccessMessageProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  autoCloseMs?: number;
}

export interface ErrorMessageProps {
  show: boolean;
  onClose: () => void;
  onRetry?: () => void;
  title?: string;
  message?: string;
}

export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

// =============================================================================
// ORGANISMS — secciones completas (reciben data del orquestador)
// =============================================================================

export interface HeroSectionProps {
  hero_data: HeroSection;
}

export interface TecnologiesSectionProps {
  skills_data: SkillsSection;
}

export interface ProjectsSectionProps {
  project_section_data: ProjectsSection;
  projects_array_data: ProjectsList;
  currentLang: string;
}

export interface AboutMeSectionProps {
  aboutme_data: AboutMeSection;
}

export interface ContactSectionProps {
  contact_data: ContactSection;
}

export interface FooterProps {
  footer_data: FooterSection;
}

// =============================================================================
// ANIMATIONS
// =============================================================================

export interface AnimationProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export interface SlideProps extends AnimationProps {
  x?: number;
}

export interface PopProps extends AnimationProps {
  scale?: number;
}

// =============================================================================
// RE-EXPORTS — para que los componentes solo importen de types.ts
// =============================================================================

export type {
  AboutMeContent,
  AboutMeMetadata,
  AboutMeSection,
  Contact,
  ContactContent,
  ContactSection,
  FooterContent,
  FooterSection,
  HeroContent,
  HeroMetadata,
  HeroSection,
  NavbarContent,
  NavbarSection,
  ProjectItem,
  ProjectsContent,
  ProjectsList,
  ProjectsMetadata,
  ProjectsSection,
  SkillsContent,
  SkillsMetadata,
  SkillsSection,
};
