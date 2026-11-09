import Image from "next/image";
import { Span } from "../components";
import type { LinkButtonProps } from "../types";
import { IconRender } from "./IconRender";

export function LinkButton({
  link,
  img,
  children,
  svg,
  alt,
  buttonBody,
  svgStyle,
  imgStyle,
  txtStyle,
  txt,
}: LinkButtonProps) {
  return (
    <a
      href={link ?? "#"}
      className={`flex justify-center items-center ${buttonBody}`}
      target={link?.startsWith("#") ? undefined : "_blank"}
      rel={link?.startsWith("#") ? undefined : "noopener noreferrer"}
    >
      {txt && <Span txt={txt} className={txtStyle} />}
      {svg && <IconRender name={svg} className={`size-full ${svgStyle}`} />}
      {img && (
        <Image
          src={`/${img}`}
          alt={alt || "icon"}
          width={80}
          height={80}
          className={`size-full ${imgStyle}`}
        />
      )}
      {children}
    </a>
  );
}
