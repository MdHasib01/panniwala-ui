import * as React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  MessagesSquare,
  Package as PackageIcon,
  Users,
  Truck,
  UserCircle,
  LogOut,
  ChevronsUpDown,
  Globe,
  MapPin,
  type LucideIcon,
} from 'lucide-react';
import logo from '@/src/assets/logo.png';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/src/admin/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/admin/components/ui/dropdown-menu';
import { useAuth } from '@/src/lib/auth';
import { useSocket, useSocketEvent } from '@/src/lib/socket';
import { api } from '@/src/lib/api';
import { ROLE_META } from '../lib/format';
import { UserAvatar } from './shared';
import type { Paginated, Role, User } from '@/src/lib/models';

interface NavItem {
  title: string;
  to: string;
  icon: LucideIcon;
  roles: Role[];
  badge?: 'chat' | 'suppliers' | 'areas';
}

const NAV: { label: string; items: NavItem[] }[] = [
  {
    label: 'General',
    items: [
      { title: 'Overview', to: '/admin', icon: LayoutDashboard, roles: ['admin', 'supplier', 'user'] },
      { title: 'Orders', to: '/admin/orders', icon: ShoppingBag, roles: ['admin', 'supplier', 'user'] },
      { title: 'Messages', to: '/admin/chat', icon: MessagesSquare, roles: ['admin', 'supplier', 'user'], badge: 'chat' },
    ],
  },
  {
    label: 'Management',
    items: [
      { title: 'Packages', to: '/admin/packages', icon: PackageIcon, roles: ['admin'] },
      { title: 'Users', to: '/admin/users', icon: Users, roles: ['admin'] },
      { title: 'Suppliers', to: '/admin/suppliers', icon: Truck, roles: ['admin'], badge: 'suppliers' },
      { title: 'Areas', to: '/admin/areas', icon: MapPin, roles: ['admin'], badge: 'areas' },
    ],
  },
  {
    label: 'Account',
    items: [{ title: 'Profile', to: '/admin/profile', icon: UserCircle, roles: ['admin', 'supplier', 'user'] }],
  },
];

/** Count of suppliers waiting for approval, kept live via socket. */
function usePendingSuppliers(enabled: boolean) {
  const [count, setCount] = React.useState(0);
  const load = React.useCallback(() => {
    if (!enabled) return;
    api
      .get<Paginated<User>>('/users', { role: 'supplier', status: 'pending', limit: 1 })
      .then((r) => setCount(r.total))
      .catch(() => {});
  }, [enabled]);
  React.useEffect(load, [load]);
  useSocketEvent('user:new', load);
  return { count, reload: load };
}

/** Count of supplier area requests waiting for a decision. */
function usePendingAreaRequests(enabled: boolean) {
  const [count, setCount] = React.useState(0);
  const load = React.useCallback(() => {
    if (!enabled) return;
    api
      .get<{ requests: unknown[] }>('/areas/manage')
      .then((r) => setCount(r.requests.length))
      .catch(() => {});
  }, [enabled]);
  React.useEffect(load, [load]);
  useSocketEvent('user:new', load);
  useSocketEvent('area:request', load);
  return { count, reload: load };
}

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { unreadChats } = useSocket();
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const pending = usePendingSuppliers(user?.role === 'admin');
  const areaRequests = usePendingAreaRequests(user?.role === 'admin');

  // Re-check pending approvals whenever the admin navigates (e.g. after approving one).
  React.useEffect(() => {
    if (user?.role === 'admin') {
      pending.reload();
      areaRequests.reload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!user) return null;

  const badgeFor = (b?: NavItem['badge']) => {
    if (b === 'chat') return unreadChats;
    if (b === 'suppliers') return pending.count;
    if (b === 'areas') return areaRequests.count;
    return 0;
  };

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/admin">
                <div className="bg-primary/10 flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg">
                  <img src={logo} alt="" className="size-7 object-contain" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">Pani Wala</span>
                  <span className="text-muted-foreground truncate text-xs">{ROLE_META[user.role].label} dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {NAV.map((group) => {
          const items = group.items.filter((i) => i.roles.includes(user.role));
          if (!items.length) return null;
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const active = item.to === '/admin' ? pathname === '/admin' : pathname.startsWith(item.to);
                    const badge = badgeFor(item.badge);
                    return (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                          <NavLink to={item.to} end={item.to === '/admin'} onClick={() => isMobile && setOpenMobile(false)}>
                            <item.icon />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                        {badge > 0 && (
                          <SidebarMenuBadge className="bg-primary text-primary-foreground! rounded-full px-1.5">
                            {badge}
                          </SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                  <UserAvatar name={user.name} className="size-8 rounded-lg" />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? 'bottom' : 'right'}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-muted-foreground text-xs">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/admin/profile">
                    <UserCircle /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/">
                    <Globe /> View website
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={logout}>
                  <LogOut /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
