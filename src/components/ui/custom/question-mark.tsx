import { CircleHelp } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../hover-card";

type HoverQuestionMarkProps = {
  children: React.ReactNode;
  className?: string;
};

export function HoverQuestionMark({children, className}: HoverQuestionMarkProps) {
  return (
    <HoverCard>
      <HoverCardTrigger className={className}>
        <CircleHelp />
      </HoverCardTrigger>
      <HoverCardContent>
        {children}
      </HoverCardContent>
    </HoverCard>
  );
}
