import { CircleHelp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type HoverQuestionMarkProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function TitleWithQuestionMark({ title, children, className }: HoverQuestionMarkProps) {
  return (
    <div className={`grid grid-cols-[1fr_auto_1fr] items-center w-full ${className}`}>
      <div></div>
      <label className="text-sm">{title}</label>
      <div className="flex justify-end ml-2">
        <Popover>
          <PopoverTrigger>
            <CircleHelp className="h-5 w-5" />
          </PopoverTrigger>
          <PopoverContent>{children}</PopoverContent>
        </Popover>
      </div>
    </div>
  );
}