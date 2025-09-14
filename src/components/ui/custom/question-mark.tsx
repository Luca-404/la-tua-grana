import { CircleHelp } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../hover-card";

type HoverQuestionMarkProps = {
  children: React.ReactNode;
  className?: string;
};

export function HoverQuestionMark({ children, className }: HoverQuestionMarkProps) {
  return (
    <HoverCard>
      <HoverCardTrigger className={className}>
        <CircleHelp className="w-5 h-5 shrink-0" />
      </HoverCardTrigger>
      <HoverCardContent>{children}</HoverCardContent>
    </HoverCard>
  );
}
