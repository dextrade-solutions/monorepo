import { Button } from "@/components/ui/button";
import AssetList from "@/components/crypto/AssetList";

export default function Wallet() {
  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Wallet</h2>
        <div className="bg-card rounded-lg p-4 mb-4">
          <p className="text-sm text-muted-foreground">Balance</p>
          <p className="text-2xl font-bold">$1000.00 usd</p>
        </div>
        <div className="flex gap-2">
          <Button className="flex-1">Deposit</Button>
          <Button className="flex-1" variant="outline">Withdraw</Button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Assets</h3>
        <AssetList />
      </div>
    </div>
  );
}
