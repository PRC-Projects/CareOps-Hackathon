import { getTeamChats, getMessages, getAllStaff } from "@/actions/inbox";
import { InboxShell } from "@/components/inbox/inbox-shell";
import { currentUser } from "@clerk/nextjs/server";

export default async function InboxPage({ searchParams }: { searchParams: { id?: string } }) {
  const user = await currentUser();
  const chats = await getTeamChats();
  const staff = await getAllStaff();

  let messages: any[] = [];
  if (searchParams.id) {
    messages = await getMessages(searchParams.id);
  }

  return (
    <div className="h-full flex flex-col space-y-2">
      <InboxShell 
        initialChats={chats} 
        allStaff={staff}
        currentUserEmail={user?.emailAddresses[0].emailAddress || ""}
        defaultMessages={messages}
        defaultSelectedId={searchParams.id} 
      />
    </div>
  );
}