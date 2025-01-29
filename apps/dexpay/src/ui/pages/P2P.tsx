import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TradingPair from "@/components/crypto/TradingPair";

export default function P2P() {
  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">P2P</h2>
        <div className="bg-card rounded-lg p-4 mb-4">
          <p className="text-sm text-muted-foreground">Total income</p>
          <p className="text-2xl font-bold mb-4">$120.00 usd</p>
          <Button className="w-full">Create pair</Button>
        </div>
      </div>

      <Tabs defaultValue="pairs">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="pairs" className="flex-1">Pairs</TabsTrigger>
          <TabsTrigger value="trades" className="flex-1">Trades history</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pairs">
          <TradingPair />
        </TabsContent>
        
        <TabsContent value="trades">
          <TradingPair />
        </TabsContent>
      </Tabs>
    </div>
  );
}
