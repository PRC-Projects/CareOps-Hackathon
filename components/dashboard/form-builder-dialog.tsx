"use client";

import { useState } from "react";
import { upsertForm } from "@/actions/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, X, Loader2, FilePlus, Sparkles, Edit } from "lucide-react";
import { toast } from "sonner";
import { generateFormQuestions } from "@/actions/ai";

export function FormBuilderDialog({ formToEdit }: { formToEdit?: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(formToEdit?.name || "");
  
  // Fields State: Array of { id, label, type }
  const [fields, setFields] = useState<any[]>(
    formToEdit?.fields ? (formToEdit.fields as any[]) : []
  );

  const addField = () => {
    setFields([...fields, { id: Date.now().toString(), label: "", type: "text" }]);
  };

  const updateField = (index: number, key: string, value: string) => {
    const newFields = [...fields];
    newFields[index][key] = value;
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name) return toast.error("Name is required");
    setLoading(true);
    await upsertForm(formToEdit?.id, name, fields);
    setLoading(false);
    setOpen(false);
    toast.success("Form saved!");
  };

  const handleAIGenerate = async () => {
    if (!name) return toast.error("Please enter a Form Name first (e.g. 'Patient Intake')");
    
    setLoading(true);
    toast.info("AI is generating questions...");
    
    try {
      const aiQuestions = await generateFormQuestions(name); // We use the name as context
      if (aiQuestions.length > 0) {
        // Append new questions to existing ones
        setFields([...fields, ...aiQuestions]); 
        toast.success("Questions generated!");
      }
    } catch (e) {
      toast.error("AI failed to generate.");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={formToEdit ? "outline" : "default"}>
          {formToEdit ? <Edit className="w-4 h-4" /> : <><Plus className="w-4 h-4 mr-2" /> Create Form</>}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{formToEdit ? "Edit Form" : "New Form"}</DialogTitle></DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Form Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Car Inspection Checklist for Mechanics" />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Questions</Label>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleAIGenerate} disabled={loading} className="text-violet-600 border-violet-200 hover:bg-violet-50">
                  <Sparkles className="w-3 h-3 mr-2" /> Auto-Generate
                </Button>
                <Button size="sm" variant="secondary" onClick={addField}>
                  <Plus className="w-3 h-3 mr-1" /> Manually Add Question
                </Button>
              </div>
            </div>
            
            {fields.length === 0 && (
              <div className="text-sm text-zinc-500 text-center py-8 border border-dashed rounded-lg">
                No questions yet. Click "Add Question" to start.
              </div>
            )}

            {fields.map((field, idx) => (
              <div key={field.id} className="flex gap-2 items-start p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border">
                <div className="flex-1 space-y-2">
                   <Input 
                     placeholder="Question Label (e.g. What is your VIN?)" 
                     value={field.label} 
                     onChange={(e) => updateField(idx, "label", e.target.value)} 
                   />
                   <Select 
                     value={field.type} 
                     onValueChange={(val) => updateField(idx, "type", val)}
                   >
                     <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                     <SelectContent>
                       <SelectItem value="text">Short Text</SelectItem>
                       <SelectItem value="textarea">Long Text</SelectItem>
                       <SelectItem value="checkbox">Yes/No Checkbox</SelectItem>
                     </SelectContent>
                   </Select>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeField(idx)} className="text-zinc-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} className="w-full" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Form"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}