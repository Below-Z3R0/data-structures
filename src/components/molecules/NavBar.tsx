import { ThemeSwitcher } from "../atoms/ThemeSwitcher";
import { LanguageToggle, LinkButton, Title4 } from "../components";
import type { NavBarProps } from "../types";

export function NavBar({
  nav_data,
  GeneralOrganization,
  LinksOrganization,
  ThemeMenuOrganization,
  name,
  siteName = "Mi Proyecto",
}: NavBarProps & { siteName?: string }) {
  return (
    <nav
      className={`z-20 qw:left-5 qw:right-5 left-2 right-2 max-w-232 p-5 mt-1 rounded-2xl fixed mx-auto flex gap-6 items-center justify-between bg-background/80 backdrop-blur-xl border border-border shadow-2xl ${GeneralOrganization ?? ""}`}
    >
      {name && <Title4 txt={siteName} className="text-primary" />}
      <div className={`flex gap-4 items-center ${LinksOrganization ?? ""}`}>
        {nav_data.data.map((item) => (
          <LinkButton
            key={item.id}
            link={item.link}
            txt={item.name}
            txtStyle="hover:text-primary transition-colors text-sm"
          />
        ))}
        <LanguageToggle />
        <ThemeSwitcher ThemeMenuOrganization={`${ThemeMenuOrganization}`} />
      </div>
    </nav>
  );
}
