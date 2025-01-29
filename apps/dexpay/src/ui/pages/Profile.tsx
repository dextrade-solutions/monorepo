import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud } from "lucide-react";

export default function Profile() {
  return (
    <div className="container max-w-md mx-auto p-4">
      <h2 className="text-lg font-semibold mb-4">Profile</h2>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center flex-col mb-4">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-2">
              <UploadCloud className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Drag and drop a file here to update</p>
          </div>
          <Button className="w-full">Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
