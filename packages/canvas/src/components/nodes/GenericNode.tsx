import { RegisteredNodes } from "@sysdraw/models";
import { IconsMap } from "../../assets";

export const GenericNode = ({ type }: { type: RegisteredNodes }) => {
  const Icon = IconsMap[type];
  return <Icon strokeWidth={1.5} className="w-full h-full text-text drop-shadow-sm" />;
};
