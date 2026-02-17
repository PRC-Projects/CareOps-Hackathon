"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Square, Sparkles, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { transcribeAudio, cleanVoiceNote } from "@/actions/ai"; 

interface VoiceNoteProps {
  bookingId?: string;
  defaultValue?: string;
  onSave?: (note: string) => void;
}

export function VoiceNote({ bookingId, defaultValue = "", onSave }: VoiceNoteProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Transcribing...
  const [isPolishing, setIsPolishing] = useState(false);   // Polishing...
  const [transcript, setTranscript] = useState(defaultValue);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // 1. Start Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await handleTranscribe(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info("Recording started...");
    } catch (err) {
      console.error("Mic Error:", err);
      toast.error("Could not access microphone.");
    }
  };

  // 2. Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true); // Start loading spinner
    }
  };

  // 3. Send to Gemini for Transcription
  const handleTranscribe = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const result = await transcribeAudio(formData);
      
      if (result.error) {
        toast.error(result.error);
      } else if (result.text) {
        setTranscript((prev) => (prev ? prev + " " + result.text : result.text));
        toast.success("Transcription complete!");
      }
    } catch (e) {
      toast.error("Transcription failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. Polish Text (Existing Logic)
  const handlePolish = async () => {
    if (!transcript) return;
    setIsPolishing(true);
    try {
      const polished = await cleanVoiceNote(transcript);
      setTranscript(polished);
      toast.success("Note polished!");
      
      if (bookingId && onSave) {
        onSave(polished);
      }
    } catch (e) {
      toast.error("AI cleanup failed.");
    } finally {
      setIsPolishing(false);
    }
  };

  const handleManualSave = () => {
    if (onSave) {
      onSave(transcript);
      toast.success("Note saved locally.");
    }
  };

  return (
    <div className="space-y-2 border p-3 rounded-lg bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-semibold uppercase text-zinc-500 flex items-center gap-2">
           <Mic className="w-3 h-3 text-violet-500" /> Dictation
        </h3>
        <div className="flex gap-2">
           {/* RECORD BUTTON */}
           {isRecording ? (
             <Button 
               size="sm" 
               variant="destructive" 
               onClick={stopRecording}
               className="h-7 text-xs px-2 animate-pulse"
             >
               <Square className="w-3 h-3 mr-1 fill-current" /> Stop
             </Button>
           ) : (
             <Button 
               size="sm" 
               variant="secondary" 
               onClick={startRecording}
               disabled={isProcessing}
               className="h-7 text-xs px-2"
             >
               {isProcessing ? (
                 <Loader2 className="w-3 h-3 mr-1 animate-spin" />
               ) : (
                 <Mic className="w-3 h-3 mr-1" />
               )}
               {isProcessing ? "Processing..." : "Record"}
             </Button>
           )}

           {/* POLISH BUTTON */}
           {/* <Button 
             size="sm" 
             variant="outline" 
             onClick={handlePolish} 
             disabled={!transcript || isPolishing || isRecording || isProcessing}
             className="h-7 text-xs px-2 text-violet-600 border-violet-200 hover:bg-violet-50"
           >
             {isPolishing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
             Polish
           </Button> */}

           {/* SAVE BUTTON */}
           <Button 
             size="sm" 
             variant="ghost"
             onClick={handleManualSave}
             className="h-7 text-xs px-2 text-zinc-500 hover:text-green-600"
             title="Save Note"
           >
             <Save className="w-3 h-3" />
           </Button>
        </div>
      </div>
      <Textarea 
        value={transcript} 
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="Click Record, speak your note, then click Stop..."
        className="min-h-[80px] bg-zinc-50 dark:bg-zinc-950 resize-none text-sm focus-visible:ring-violet-500"
      />
    </div>
  );
}