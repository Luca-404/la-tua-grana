import { CircleHelp } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";

type HoverQuestionMarkProps = {
  title: string;
  children: React.ReactNode;
};

export function TitleWithQuestionMark({ title, children }: HoverQuestionMarkProps) {
  return (
<div className="grid grid-cols-[1fr_auto_1fr] items-center w-full">
  <div></div>
  <label className="whitespace-nowrap overflow-x-auto text-center">{title}</label>
  <div className="flex justify-end ml-2">
    <HoverCard>
      <HoverCardTrigger>
        <CircleHelp />
      </HoverCardTrigger>
      <HoverCardContent>{children}</HoverCardContent>
    </HoverCard>
  </div>
</div>

  );
}