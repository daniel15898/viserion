import { ActionButtons } from "@/components/Sidebar/ActionButtons";
import { AppSidebar } from "@/components/Sidebar/AppSidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet } from "react-router";

function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar title="FEATURES" />
      <SidebarInset className="px-2">
        <AppLayoutHeader />
        <AppLayoutContent />
      </SidebarInset>
    </SidebarProvider>
  );
}

function AppLayoutHeader() {
  return (
    <header className="flex flex-wrap gap-3 min-h-8 py-3 shrink-0 items-center transition-all ease-linear border-b px-2">
      {/* Left side */}
      <div className="flex flex-1 items-center gap-2">
        <SidebarTrigger className="-ms-1" />
        <Separator
          orientation="vertical"
          className="me-2 data-[orientation=vertical]:h-4"
        />
      </div>
      {/* Right side */}
      <ActionButtons />
    </header>
  );
}

function AppLayoutContent() {
  return (
    <div className="flex h-full w-full max-h-[calc(100vh-5rem)] overflow-y-auto pl-2">
      {/* The pages will run here*/}
      <Outlet />
    </div>
  );
}

export default AppLayout;
