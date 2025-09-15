import { CircleHelp } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";

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
        <HoverCard>
          <HoverCardTrigger>
            <CircleHelp className="h-5 w-5" />
          </HoverCardTrigger>
          <HoverCardContent>{children}</HoverCardContent>
        </HoverCard>
      </div>
    </div>
  );
}