import { Card, CardContent } from "../components/ui/card";
import { transactions } from "../data/mockData";

export default function TransactionList() {
  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <Card key={tx.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{tx.type}</p>
                <p className="text-sm text-muted-foreground">{tx.date}</p>
              </div>
              <div className="text-right">
                <p>{tx.amount}</p>
                <p className="text-sm text-muted-foreground">{tx.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
