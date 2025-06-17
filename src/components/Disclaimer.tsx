import { Card, CardContent } from "@/components/ui/card";

function Disclaimer() {
  return (
    <Card id="disclaimerSection" className="w-full my-4">
      <CardContent className="flex items-center justify-center p-6">
        <span className="text-center text-muted-foreground">
          Questa simulazione ha esclusivamente finalità informative e potrebbe non riflettere con precisione
          la realtà.
          <br /> Non rappresenta, né intende costituire in alcun modo una consulenza finanziaria .
        </span>
      </CardContent>
    </Card>
  );
}

export default Disclaimer;