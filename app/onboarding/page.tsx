"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form"; // <--- IMPORT THIS
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema } from "@/lib/validators";
import { generateBusinessSuggestions } from "@/actions/onboarding-ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Sparkles, ArrowRight, CheckCircle, Plus, Trash2 } from "lucide-react";
import { createOrganization } from "@/actions/create-organization";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const form = useForm({
    defaultValues: {
      name: "",
      type: "",
      description: "",
      services: [{ name: "", price: 0, duration: 30 }], // Default empty row
      email: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  });

  // 1. Setup Field Array for Dynamic List
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "services",
  });

  const handleStep1Submit = async () => {
    const name = form.getValues("name");
    const type = form.getValues("type");

    if (!name || !type) {
      toast.error("Please enter both Business Name and Type");
      return;
    }

    setIsGenerating(true);
    toast.info("Consulting our AI business expert...");

    try {
      const suggestions = await generateBusinessSuggestions(name, type);
      
      if (suggestions && suggestions.services.length > 0) {
        form.setValue("description", suggestions.description);
        
        // 2. Clear existing and Append AI suggestions
        remove(); // Clear all
        suggestions.services.forEach((s: any) => append(s));
        
        toast.success("Strategy generated! Feel free to edit.");
        setStep(2);
      } else {
        toast.error("AI could not generate suggestions. Please enter manually.");
        setStep(2);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinalSubmit = async (data: any) => {
    setIsGenerating(true); // Show loading state
    toast.info("Setting up your workspace...");

    try {
      // Call the Server Action
      const result = await createOrganization(data);

      // If we are here, it likely redirected. 
      // But if it returned an error object:
      if (result && !result.success) {
        toast.error(result.error);
        setIsGenerating(false);
      }
    } catch (error) {
      toast.error("Something went wrong saving your business.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar (Same as before) */}
        <div className="mb-8 flex justify-between items-center px-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                step >= s ? "bg-primary border-primary text-primary-foreground" : "border-zinc-300 text-zinc-400"
              }`}>
                {step > s ? <CheckCircle className="w-6 h-6" /> : s}
              </div>
              <span className="text-xs mt-2 text-zinc-500 font-medium">
                {s === 1 ? "Identity" : s === 2 ? "Services" : "Contact"}
              </span>
            </div>
          ))}
        </div>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">
              {step === 1 && "Let's build your workspace"}
              {step === 2 && "Refine your offerings"}
              {step === 3 && "Final details"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Tell us about your business, and our AI will do the heavy lifting."}
              {step === 2 && "Review what our AI suggested. You can edit anything."}
              {step === 3 && "How should customers contact you?"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              
              {/* STEP 1: Identity */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Business Name</Label>
                    <Input {...form.register("name")} placeholder="e.g. Pritam's Dental Clinic" />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Type</Label>
                    <Input {...form.register("type")} placeholder="e.g. Dentist, Salon, Law Firm" />
                  </div>
                  <Button 
                    onClick={handleStep1Submit} 
                    className="w-full mt-4" 
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Strategy...
                      </>
                    ) : (
                      <>
                        Continue with AI <Sparkles className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              )}

              {/* STEP 2: Services (Now Editable!) */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Business Description</Label>
                    <Textarea {...form.register("description")} className="h-24" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                       <Label>Services (Name • Duration (min) • Price)</Label>
                       <Button 
                         type="button" 
                         variant="ghost" 
                         size="sm" 
                         className="h-8 text-xs"
                         onClick={() => append({ name: "", duration: 30, price: 0 })}
                        >
                         <Plus className="w-3 h-3 mr-1" /> Add Manual
                       </Button>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {fields.map((field, index) => (
                         <div key={field.id} className="flex gap-2 items-start">
                           <div className="flex-1">
                             <Input 
                               {...form.register(`services.${index}.name`)} 
                               placeholder="Service Name" 
                               className="h-9"
                             />
                           </div>
                           <div className="w-20">
                             <Input 
                               type="number"
                               {...form.register(`services.${index}.duration`, { valueAsNumber: true })} 
                               placeholder="Min" 
                               className="h-9"
                             />
                           </div>
                           <div className="w-24 relative">
                             <span className="absolute left-2 top-2 text-xs text-zinc-500">$</span>
                             <Input 
                               type="number"
                               {...form.register(`services.${index}.price`, { valueAsNumber: true })} 
                               className="h-9 pl-5" 
                             />
                           </div>
                           <Button
                             type="button"
                             variant="ghost"
                             size="icon"
                             className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                             onClick={() => remove(index)}
                           >
                             <Trash2 className="w-4 h-4" />
                           </Button>
                         </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setStep(1)} className="w-1/3">Back</Button>
                    <Button onClick={() => setStep(3)} className="w-2/3">Looks Good <ArrowRight className="ml-2 h-4 w-4" /></Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Final Details */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <Input {...form.register("email")} placeholder="contact@business.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Input {...form.register("timezone")} disabled />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setStep(2)} className="w-1/3">Back</Button>
                    <Button onClick={form.handleSubmit(handleFinalSubmit)} className="w-2/3">Launch Workspace</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}