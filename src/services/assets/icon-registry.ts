import { z } from "zod";
import {
  AlertCircleIcon,
  DayAndNightIcon,
  DockerIcon,
  FigmaIcon,
  FramerIcon,
  GitHubIcon,
  GitIcon,
  HamburNavIcon,
  HomeIcon,
  HTML5Icon,
  LanguageIcon,
  LinkedInIcon,
  MailIcon,
  MotionIcon,
  NextIcon,
  NodeIcon,
  PostGresSQLIcon,
  ReactIcon,
  RefreshCwIcon,
  SupaBaseIcon,
  TailwindIcon,
  TypeScriptIcon,
  ZodIcon,
} from "@/services/assets/Icons";

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export const ICON_REGISTRY = {
  react: ReactIcon,
  docker: DockerIcon,
  node: NodeIcon,
  supabase: SupaBaseIcon,
  typescript: TypeScriptIcon,
  tailwind: TailwindIcon,
  postgressql: PostGresSQLIcon,
  figma: FigmaIcon,
  html5: HTML5Icon,
  github: GitHubIcon,
  git: GitIcon,
  next: NextIcon,
  hamburnav: HamburNavIcon,
  language: LanguageIcon,
  linkedin: LinkedInIcon,
  mail: MailIcon,
  daynight: DayAndNightIcon,
  alert_circle: AlertCircleIcon,
  refresh_cw: RefreshCwIcon,
  home: HomeIcon,
  zod: ZodIcon,
  motion: MotionIcon,
  framer: FramerIcon,
} as const satisfies Record<string, IconComponent>;

export const IconNameSchema = z.string().refine((val) => val in ICON_REGISTRY, {
  message: "Debe ser una key del registry (react, docker...)",
});

// Helper para usar en componentes
export type IconKey = keyof typeof ICON_REGISTRY;
