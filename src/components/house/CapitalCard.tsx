import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface CapitalCardProps {
  title: string;
  children: React.ReactNode;
  subTitle?: string;
  className?: string;
}

export function CapitalCard({children, title, subTitle, className}: CapitalCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-center text-2xl">{title}</CardTitle>
        <CardDescription>{subTitle}</CardDescription>
        <CardContent>
          {children}
        </CardContent>
      </CardHeader>
    </Card>
  );
}
