import * as React from "react";
import { AudioWaveform, Database, RadioTower } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router";
import SidebarLogo from "./SidebarLogo";
import { ROUTES } from "@/router/routerConfig";

// This is sample data.
const sidebarLinks = [
  {
    title: "FEATURES",
    items: [
      {
        title: "Sample",
        url: ROUTES.SAMPLE,
        icon: AudioWaveform,
      },
      {
        title: "Transmit",
        url: ROUTES.TRANSMIT,
        icon: RadioTower,
      },
      {
        title: "Sample Table",
        url: ROUTES.SAMPLE_TABLE,
        icon: Database,
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const currentLocation = useLocation();

  const isLinkActive = (href: string) => {
    return currentLocation.pathname === href;
  };

  return (
    <Sidebar collapsible="icon" variant="inset" {...props} className="p-1.5">
      <SidebarHeader className="h-16 max-md:mt-2 mb-2 justify-center pl-1">
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent className="-mt-2">
        {sidebarLinks.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel className="uppercase text-muted-foreground/65">
              {item.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="flex flex-col gap-2">
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className="group/menu-button group-data-[collapsible=icon]:px-[5px]! font-medium gap-3 h-9 [&>svg]:size-auto"
                      tooltip={item.title}
                      isActive={isLinkActive(item.url)}
                    >
                      <Link to={item.url}>
                        {item.icon && (
                          <item.icon
                            className="text-muted-foreground/65  group-data-[active=true]/menu-button:text-primary"
                            size={22}
                            aria-hidden="true"
                          />
                        )}
                        <span className=" w-full flex items-center ">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>{/* <NavUser user={data.user} /> */}</SidebarFooter>
    </Sidebar>
  );
}
