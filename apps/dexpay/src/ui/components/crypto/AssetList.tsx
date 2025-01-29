import { Card, CardContent } from "@/components/ui/card";
import { assets } from "@/data/mockData";

export default function AssetList() {
  return (
    <div className="space-y-4">
      {assets.map((asset) => (
        <Card key={asset.symbol}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">{asset.icon}</span>
              <span className="font-medium">{asset.symbol}</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{asset.balance}</p>
              <p className="text-xs text-muted-foreground">$0.00</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
