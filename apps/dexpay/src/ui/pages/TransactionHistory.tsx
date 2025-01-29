import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransactionList from "@/components/transaction/TransactionList";

export default function TransactionHistory() {
  return (
    <div className="container max-w-md mx-auto p-4">
      <h2 className="text-lg font-semibold mb-4">Transactions history</h2>
      
      <Tabs defaultValue="all">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
          <TabsTrigger value="withdrawals" className="flex-1">Withdrawals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <TransactionList />
        </TabsContent>
        
        <TabsContent value="withdrawals">
          <TransactionList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
