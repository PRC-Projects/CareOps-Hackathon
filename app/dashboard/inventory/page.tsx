import { getInventory, updateStock, deleteItem } from "@/actions/inventory";
import { AddInventoryDialog } from "@/components/dashboard/add-inventory-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getInventoryInsight } from "@/actions/ai";
import { AlertTriangle, Trash2, Plus, Minus, Package } from "lucide-react";

export default async function InventoryPage() {
  const items = await getInventory();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">Track resources and set alerts.</p>
        </div>
        <AddInventoryDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-10 text-muted-foreground bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-dashed">
            No items tracked yet. Add your first resource!
          </div>
        ) : (
          items.map((item) => {
            const isLowStock = item.quantity <= item.threshold;
            const percentage = Math.min((item.quantity / (item.threshold * 3)) * 100, 100);

            return (
              <Card key={item.id} className={`relative overflow-hidden transition-all ${isLowStock ? 'border-red-500 shadow-md shadow-red-500/10' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                      <Package className="w-4 h-4 text-zinc-500" />
                      {item.name}
                    </CardTitle>
                    {isLowStock && (
                      <Badge variant="destructive" className="animate-pulse">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Low Stock
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="text-3xl font-bold">{item.quantity}</div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Threshold: {item.threshold}
                      </div>
                    </div>

                    {/* Visual Stock Bar */}
                    <Progress value={percentage} className={`h-2 ${isLowStock ? "bg-red-100" : "bg-zinc-100"}`} />

                    {/* Quick Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex gap-2">
                        <form action={updateStock.bind(null, item.id, -1)}>
                          <Button size="icon" variant="outline" className="h-8 w-8">
                            <Minus className="w-4 h-4" />
                          </Button>
                        </form>
                        <form action={updateStock.bind(null, item.id, 1)}>
                          <Button size="icon" variant="outline" className="h-8 w-8">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </form>
                      </div>

                      <form action={deleteItem.bind(null, item.id)}>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}