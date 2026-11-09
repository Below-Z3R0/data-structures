import { z } from "zod";
import { IconNameSchema } from "../services/assets/icon-registry";

export const SendEmailSchema = z.object({
  name: z.string().min(2, "Name to short!!").max(80, "Name to large"),
  user_email: z
    .email("Invalid email!!")
    .transform((v) => v.toLowerCase().trim()),
  title: z.string().min(3, "Subject to short!!"),
  message: z.string().min(8, "Message to short!!"),
});

export type SendEmail = z.infer<typeof SendEmailSchema>;

// =============================================================================
// SCHEMAS COMPARTIDOS
// =============================================================================

export const ContactItemSchema = z.object({
  id: z.number(),
  icon_key: IconNameSchema,
  name: z.string(),
  link: z.string(),
});

export const ContactListSchema = z.array(ContactItemSchema);

// =============================================================================
// GENERAL SCHEMAS (no traducibles, viven en content_blocks_metadata)
// =============================================================================

// general.themes: lista de temas disponibles (light, dark, etc.)
export const GeneralThemesSchema = z.object({
  themes: z.array(z.string()),
});

// general.contacts: mapa de contactos (github, linkedin, email, ...).
// Es un record para que cada proyecto agregue los suyos sin tocar el schema.
export const GeneralContactsSchema = z.record(z.string(), ContactItemSchema);

// =============================================================================
// CONTENT SCHEMAS (translations.content — textos traducibles por idioma)
// =============================================================================

export const HeroContentSchema = z.object({
  title: z.string(),
  contact: z.string(),
  workstatus: z.string(),
  paragraph_1: z.string(),
  paragraph_2: z.string(),
});

// section.navbar en BD: { data: [{ id, link, name }] }
export const NavbarContentSchema = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      link: z.string(),
      name: z.string(),
    }),
  ),
});

export const SkillsContentSchema = z.object({
  title_sm: z.string(),
  title_lg: z.string(),
  paragraph: z.string(),
});

export const AboutMeContentSchema = z.object({
  title_sm: z.string(),
  title_lg: z.string(),
  paragraph_1: z.string(),
  paragraph_2: z.string(),
});

export const ProjectsContentSchema = z.object({
  title_sm: z.string(),
  title_lg: z.string(),
  paragraph: z.string(),
  labels: z.object({
    featured: z.string(),
    in_construction: z.string(),
  }),
});

// Cada proyecto del sitio comparte este shape.
export const ProjectItemSchema = z.object({
  paragraph: z.string().optional(),
  tecnologies: z.array(
    z.object({
      icon_key: IconNameSchema,
      name: z.string(),
      color: z.string(),
      description: z.string(),
    }),
  ),
  modal: z
    .object({
      img_key: z.string().optional(),
      paragraph: z.string(),
      tecnologies: z.array(
        z.object({
          icon_key: IconNameSchema,
          name: z.string(),
          color: z.string(),
          description: z.string(),
        }),
      ),
    })
    .optional(),
});

export const FormSchema = z.object({
  send: z.string(),
  sending: z.string(),
  title: z.string(),
  top: z.array(
    z.object({
      name: z.string(),
      label: z.string(),
      type: z.string(),
      placeholder: z.string(),
    }),
  ),
  bottom: z.object({
    name: z.string(),
    label: z.string(),
    type: z.string(),
    placeholder: z.string(),
  }),
});

// section.contact en BD: { title_lg, title_sm, paragraph, form }
export const ContactContentSchema = z.object({
  title_lg: z.string(),
  title_sm: z.string(),
  paragraph: z.string(),
  form: FormSchema,
});

// section.footer en BD: { built_with, copyright }
export const FooterContentSchema = z.object({
  built_with: z.string(),
  copyright: z.string(),
});

// =============================================================================
// METADATA SCHEMAS (content_blocks_metadata — datos no traducibles)
// =============================================================================

export const HeroMetadataSchema = z.object({
  image_key: z.string(),
  contact: z.object({
    link: z.string(),
    icon_key: z.string(),
  }),
});

// SkillsMetadataSchema: categorias con sus skills.
export const SkillsMetadataSchema = z.object({
  categories: z.array(
    z.object({
      name: z.string(),
      skills: z.array(
        z.object({
          name: z.string(),
          color: z.string(),
          icon_key: IconNameSchema,
        }),
      ),
    }),
  ),
});

export const AboutMeMetadataSchema = z.object({
  image_key: z.string(),
});

// Projects metadata: snake_case confirmado en BD oficial.
export const ProjectsMetadataSchema = z.object({
  title: z.string(),
  image_key: z.string().optional(),
  link_github: z.string(),
  link_live_demo: z.string().nullable(),
  is_relevant: z.boolean().optional(),
  is_in_construction: z.boolean().optional(),
});

// =============================================================================
// SECTION TYPES (combina content + metadata, segun orquestador)
// =============================================================================

// Hero: meta usa keys 'general' y 'contacts' (orquestador)
export type HeroSection = {
  data: HeroContent;
  meta: {
    general: HeroMetadata;
    contacts: GeneralContacts;
  };
};

// Navbar: data es el array directo de links (lo unwrappea el orquestador)
export type NavbarItem = NavbarContent["data"][number];
export type NavbarSection = {
  data: NavbarItem[];
};

// Skills
export type SkillsSection = {
  data: SkillsContent;
  meta: SkillsMetadata;
};

// Projects: SIN wrapper — el orquestador retorna directo
export type ProjectsSection = ProjectsContent;

// AboutMe
export type AboutMeSection = {
  data: AboutMeContent;
  meta: AboutMeMetadata;
};

// Contact: meta es el array de contactos del proyecto
export type ContactSection = {
  data: ContactContent;
  meta: ContactItem[];
};

// Footer: meta es el array de links del navbar (reusamos NavbarItem[] para los links del pie)
export type FooterSection = {
  data: FooterContent;
  meta: NavbarItem[];
};

// Projects: cada item tiene key + data + meta
export type ProjectBlock = {
  key: number;
  data: ProjectItem;
  meta: ProjectsMetadata;
};
export type ProjectsList = Array<ProjectBlock>;

// =============================================================================
// TIPOS INFERIDOS DE SCHEMAS
// =============================================================================

export type HeroContent = z.infer<typeof HeroContentSchema>;
export type NavbarContent = z.infer<typeof NavbarContentSchema>;
export type SkillsContent = z.infer<typeof SkillsContentSchema>;
export type AboutMeContent = z.infer<typeof AboutMeContentSchema>;
export type ProjectsContent = z.infer<typeof ProjectsContentSchema>;
export type ProjectItem = z.infer<typeof ProjectItemSchema>;
export type ModalContent = z.input<typeof ProjectItemSchema>["modal"];
export type ContactContent = z.infer<typeof ContactContentSchema>;
export type FooterContent = z.infer<typeof FooterContentSchema>;

export type HeroMetadata = z.infer<typeof HeroMetadataSchema>;
export type SkillsMetadata = z.infer<typeof SkillsMetadataSchema>;
export type AboutMeMetadata = z.infer<typeof AboutMeMetadataSchema>;
export type ProjectsMetadata = z.infer<typeof ProjectsMetadataSchema>;

export type GeneralThemes = z.infer<typeof GeneralThemesSchema>;

// GeneralContacts: mapa de contactos del proyecto
export type GeneralContacts = z.infer<typeof GeneralContactsSchema>;

export type Contact = z.infer<typeof ContactItemSchema>;
export type ContactItem = z.infer<typeof ContactItemSchema>;
export type ContactList = z.infer<typeof ContactListSchema>;
export type Form = z.infer<typeof FormSchema>;
