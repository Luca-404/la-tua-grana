import { CircleHelp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";

type HoverQuestionMarkProps = {
  children: React.ReactNode;
  className?: string;
};

export function HoverQuestionMark({ children, className }: HoverQuestionMarkProps) {
  return (
    <Popover>
      <PopoverTrigger className={className}>
        <CircleHelp className="w-4 h-4 shrink-0" />
      </PopoverTrigger>
      <PopoverContent>{children}</PopoverContent>
    </Popover>
  );
}
