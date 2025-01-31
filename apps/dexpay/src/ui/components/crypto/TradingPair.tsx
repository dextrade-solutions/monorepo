import { Card, CardContent } from "@mui/material";
import { tradingPairs } from "../../data/mockData";
import { formatDistanceToNow } from "date-fns";

export default function TradingPair() {
  return (
    <div className="space-y-4">
      {tradingPairs.map((pair) => (
        <Card key={pair.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className={`rounded-full h-2 w-2 ${pair.side === 'SOLD' ? 'bg-red-500' : 'bg-green-500'}`} />
                <span className="font-medium">{pair.baseAsset}/{pair.quoteAsset}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(pair.date), { addSuffix: true })}
              </span>
            </div>
            <div className="text-sm text-muted-foreground flex justify-between">
              <span>Price: {pair.price}</span>
              <span>{pair.status}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
