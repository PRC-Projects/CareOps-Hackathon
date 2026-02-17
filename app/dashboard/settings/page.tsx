import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateOrganization } from "@/actions/settings";
import { ServiceList } from "@/components/dashboard/service-list";

export default async function SettingsPage() {
  const user = await currentUser();
  const dbUser = await prisma.user.findUnique({
    where: { email: user?.emailAddresses[0].emailAddress },
    include: { 
      organization: { 
        include: { services: true, forms: true } 
      } 
    }
  });

  if (!dbUser?.organization) return <div>No Organization Found</div>;
  const org = dbUser.organization;

  // 🛑 FIX 1: Convert Decimal prices to plain numbers to prevent Build Error
  const plainServices = org.services.map(service => ({
    ...service,
    price: service.price.toNumber()
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <Tabs defaultValue="services" className="w-full">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        {/* TAB 1: SERVICES */}
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Service Menu</CardTitle>
              <CardDescription>Manage the services you offer to customers.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Pass the CLEAN plainServices */}
              <ServiceList 
                initialServices={plainServices} 
                availableForms={org.forms} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: GENERAL */}
        <TabsContent value="general">
          <Card>
            <CardHeader><CardTitle>Business Profile</CardTitle></CardHeader>
            <CardContent>
              {/* 🛑 FIX 2: Wrap the action to satisfy TypeScript return type */}
              <form 
                action={async (formData) => {
                  "use server";
                  await updateOrganization(formData);
                }} 
                className="space-y-4"
              >
                <div className="grid gap-2">
                  <Label>Business Name</Label>
                  <Input name="name" defaultValue={org.name} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input name="email" defaultValue={org.email} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone</Label>
                    <Input name="phone" defaultValue={org.phone || ""} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Address</Label>
                  <Input name="address" defaultValue={org.address || ""} />
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}