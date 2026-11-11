import { iconSizeVariants, type IconProps } from ".";

interface LogoProps extends Partial<IconProps> {
  className?: string;
}

export const LogoIcon = ({ size = "md", className }: LogoProps) => {
  return (
    <img
      src="/favicon.svg"
      alt="Brainscratch logo"
      className={`${className || iconSizeVariants[size]} object-contain select-none inline-block`}
      draggable={false}
    />
  );
};
