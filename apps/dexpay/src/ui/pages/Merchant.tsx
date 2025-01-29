import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Merchant() {
  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Merchant</h2>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total income</p>
            <p className="text-2xl font-bold mb-4">$4.00 usd</p>
            <Button className="w-full">Create invoice</Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Invoices</h3>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">1 USDT</span>
                <span className="text-sm text-muted-foreground">26/01/2024</span>
              </div>
              <p className="text-sm text-muted-foreground">Awaiting payment</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
