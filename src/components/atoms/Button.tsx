import Image from "next/image";
import { Span } from "../components";
import type { ButtonProps } from "../types";
import { IconRender } from "./IconRender";

export function Button({
  txt,
  img,
  children,
  svg,
  alt,
  svgStyle,
  buttonBody,
  txtStyle,
  imgStyle,
  type = "button",
  onClick,
}: ButtonProps) {
  return (
    <button
      className={`flex justify-center items-center ${buttonBody}`}
      type={type}
      onClick={onClick}
    >
      {txt && <Span txt={txt} className={txtStyle} />}
      {svg && <IconRender name={svg} className={`size-full ${svgStyle}`} />}
      {img && (
        <Image
          src={`/${img}`}
          alt={alt || "icon"}
          className={`size-full ${imgStyle}`}
          width={80}
          height={80}
        />
      )}
      {children}
    </button>
  );
}
