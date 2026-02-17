"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sendMessage, startDM } from "@/actions/inbox";
import { generateSmartReply, summarizeConversation } from "@/actions/ai"; // <--- AI IMPORTS
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Send, Search, UserPlus, Loader2, Sparkles, FileText, Phone } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface InboxShellProps {
  initialChats: any[];
  allStaff: any[];
  currentUserEmail: string;
  defaultMessages?: any[];
  defaultSelectedId?: string;
}

export function InboxShell({ 
  initialChats, 
  allStaff, 
  currentUserEmail, 
  defaultMessages = [], 
  defaultSelectedId 
}: InboxShellProps) {
  
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(defaultSelectedId || null);
  const [messages, setMessages] = useState<any[]>(defaultMessages);
  const [inputText, setInputText] = useState("");
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(!!defaultSelectedId);
  const [loadingChat, setLoadingChat] = useState(false);
  
  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (defaultSelectedId) {
      setSelectedId(defaultSelectedId);
      setIsMobileChatOpen(true);
    }
    if (defaultMessages) setMessages(defaultMessages);
    setLoadingChat(false);
  }, [defaultSelectedId, defaultMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loadingChat]);

  const getChatName = (chat: any) => {
    if (chat.isGroup) return chat.name;
    const other = chat.participants.find((p: any) => p.email !== currentUserEmail);
    return other ? other.name : "Unknown";
  };

  const handleChatSelect = (chatId: string) => {
    if (chatId === selectedId) return;
    setLoadingChat(true);
    setSelectedId(chatId);
    router.push(`/dashboard/inbox?id=${chatId}`); 
  };

  const handleStartDM = async (userId: string) => {
    setLoadingChat(true);
    const chatId = await startDM(userId);
    if (chatId) {
      router.push(`/dashboard/inbox?id=${chatId}`);
      router.refresh(); 
    } else {
      setLoadingChat(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !selectedId) return;
    const tempMsg = { id: Date.now().toString(), content: inputText, createdAt: new Date(), direction: "OUTBOUND" };
    setMessages((prev) => [...prev, tempMsg]);
    const text = inputText;
    setInputText("");
    await sendMessage(selectedId, text);
    router.refresh();
  };

  // --- AI HANDLERS ---
  const handleSmartReply = async () => {
    if (!messages.length) return;
    setAiLoading(true);
    
    const history = messages.slice(-10).map(m => 
      `${m.direction === 'OUTBOUND' ? 'Staff' : 'Teammate'}: ${m.content}`
    );

    const reply = await generateSmartReply(history);
    if (reply) {
      setInputText(reply);
      toast.success("AI generated a reply!");
    } else {
      toast.error("AI couldn't generate a reply.");
    }
    setAiLoading(false);
  };

  const handleSummarize = async () => {
    if (!messages.length) return;
    setAiLoading(true);
    
    const history = messages.map(m => 
      `${m.direction === 'OUTBOUND' ? 'Staff' : 'Teammate'}: ${m.content}`
    );

    const summary = await summarizeConversation(history);
    setSummaryText(summary);
    setSummaryOpen(true);
    setAiLoading(false);
  };
  // -------------------

  const activeChat = initialChats.find(c => c.id === selectedId);

  return (
    <div className="flex h-[calc(100vh-140px)] border rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 shadow-2xl">
      
      {/* LEFT SIDEBAR */}
      <div className={cn("w-full md:w-80 border-r bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col", isMobileChatOpen ? "hidden md:flex" : "flex")}>
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg mb-4">Team Chat</h2>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-400" />
            <Input placeholder="Search team..." className="pl-8 bg-white dark:bg-zinc-900" />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            <div className="text-xs font-semibold text-zinc-500 mb-2 px-2">RECENT</div>
            {initialChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat.id)}
                className={cn(
                  "p-3 mb-1 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-zinc-800 transition flex gap-3 items-center",
                  selectedId === chat.id && "bg-white dark:bg-zinc-800 shadow-sm border"
                )}
              >
                <Avatar>
                  <AvatarFallback className="bg-violet-100 text-violet-700 font-bold">
                    {getChatName(chat)?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <span className="font-medium truncate text-sm">{getChatName(chat)}</span>
                    <span className="text-[10px] text-zinc-400">
                      {chat.updatedAt ? formatDistanceToNow(new Date(chat.updatedAt)) : ""}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 truncate">
                    {chat.messages[0]?.content || "No messages yet"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2 mt-4">
             <div className="text-xs font-semibold text-zinc-500 mb-2 px-2">ALL STAFF</div>
             {allStaff.map((staff) => (
               <div key={staff.id} onClick={() => handleStartDM(staff.id)} className="p-3 mb-1 rounded-lg cursor-pointer hover:bg-zinc-200/50 flex gap-3 items-center opacity-70 hover:opacity-100">
                 <Avatar className="h-8 w-8">
                   <AvatarFallback>{staff.name?.[0] || "?"}</AvatarFallback>
                 </Avatar>
                 <span className="text-sm font-medium">{staff.name}</span>
                 <UserPlus className="ml-auto w-4 h-4 text-zinc-400" />
               </div>
             ))}
          </div>
        </ScrollArea>
      </div>

      {/* RIGHT CHAT AREA */}
      <div className={cn("flex-1 flex flex-col bg-[#efeae2] dark:bg-[#0b141a]", !isMobileChatOpen ? "hidden md:flex" : "flex")}>
        {loadingChat ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
          </div>
        ) : selectedId && activeChat ? (
          <>
            {/* Header */}
            <div className="p-3 border-b bg-zinc-100 dark:bg-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileChatOpen(false)}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Avatar>
                  <AvatarFallback>{getChatName(activeChat)?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-sm">{getChatName(activeChat)}</h3>
                  <p className="text-xs text-zinc-500">Online</p>
                </div>
              </div>
              
              {/* AI SUMMARIZE BUTTON */}
              <div className="flex gap-1">
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={handleSummarize} 
                   disabled={aiLoading} 
                   title="Summarize Chat"
                 >
                   {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4 text-zinc-500" />}
                 </Button>
                 <Button variant="ghost" size="icon">
                   <Phone className="w-4 h-4 text-zinc-500" />
                 </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-opacity-5" ref={scrollRef}>
              <div className="space-y-2">
                {messages.map((msg) => {
                  const isMe = msg.direction === "OUTBOUND"; 
                  return (
                    <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[70%] px-3 py-1.5 rounded-lg text-sm shadow-sm", 
                        isMe ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-black dark:text-white" : "bg-white dark:bg-zinc-800 text-black dark:text-white"
                      )}>
                        <p>{msg.content}</p>
                        <span className="text-[10px] opacity-50 block text-right mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Input & AI REPLY */}
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 flex gap-2 items-end">
              <Button 
                 variant="outline" 
                 size="icon" 
                 onClick={handleSmartReply} 
                 disabled={aiLoading || messages.length === 0}
                 className="text-violet-600 border-violet-200 hover:bg-violet-50 bg-white"
                 title="Generate AI Reply"
               >
                 <Sparkles className="w-4 h-4" />
               </Button>
               
              <Input 
                value={inputText} 
                onChange={(e) => setInputText(e.target.value)} 
                className="bg-white dark:bg-zinc-900 border-none"
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <Button size="icon" onClick={handleSend} className="bg-emerald-600 hover:bg-emerald-700">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-400 flex-col gap-2">
            <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center">
              <span className="text-2xl">👋</span>
            </div>
            <p>Select a teammate to start chatting</p>
          </div>
        )}
      </div>

      {/* SUMMARY DIALOG */}
      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conversation Summary</DialogTitle>
            <DialogDescription>Generated by CareOps AI</DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-line text-sm bg-zinc-50 p-4 rounded-md border min-h-[100px]">
            {summaryText}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}