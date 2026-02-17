import { getForms, deleteForm } from "@/actions/forms";
import { FormBuilderDialog } from "@/components/dashboard/form-builder-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trash2 } from "lucide-react";

export default async function FormsPage() {
  const forms = await getForms();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Intake Forms</h1>
          <p className="text-muted-foreground">Create forms for customers to fill out.</p>
        </div>
        <FormBuilderDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {forms.map((form) => (
          <Card key={form.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {form.name}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{form._count.submissions}</div>
              <p className="text-xs text-muted-foreground">Submissions</p>
              
              <div className="flex justify-end gap-2 mt-4">
                <FormBuilderDialog formToEdit={form} />
                
                {/* FIX: We wrap the deleteForm action in an inline server action 
                   that implicitly returns Promise<void>, satisfying TypeScript.
                */}
                <form action={async () => {
                  "use server";
                  await deleteForm(form.id);
                }}>
                   <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50">
                     <Trash2 className="w-4 h-4" />
                   </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}