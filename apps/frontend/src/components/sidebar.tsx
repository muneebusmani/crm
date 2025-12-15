'use client';

import { UserType } from '@crm/types';
import {
  AccountBoxOutlined as AccountBoxOutlinedIcon,
  Circle as CircleIcon,
  Dashboard as DashboardIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  GroupOutlined as GroupOutlinedIcon,
  Groups2 as Groups2Icon,
  Home as HomeIcon,
  Inventory2Outlined as Inventory2OutlinedIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  MenuOpen,
  Message as MessageIcon,
  Person as PersonIcon,
  SwitchAccount as SwitchAccountIcon,
  ReceiptLong as ReceiptLongIcon,
  RequestQuote as RequestQuoteIcon,
  SupportAgent as SupportAgentIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import { useThemeMode } from '@/contexts/theme-context';
import {
  alpha,
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SxProps,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useLayoutEffect, useState } from 'react';

// Constants
const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_SHRUNK = 80;
const DRAWER_WIDTH_HIDDEN = 0;
const SIDEBAR_STORAGE_KEY = 'sidebar-preferences';

// Types
type SidebarMode = 'full' | 'shrink' | 'hover' | 'hidden';

interface NavigationItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  subItems?: Array<{
    text: string;
    path: string;
  }>;
}

interface SidebarProps {
  userType: UserType;
  mobileOpen?: boolean;
  onMobileToggle?: () => void;
  mode?: SidebarMode;
  onModeChange?: (mode: SidebarMode) => void;
}

interface SidebarContextType {
  mode: SidebarMode;
  isShrunk: boolean;
  isHidden: boolean;
  toggleMode: () => void;
  setMode: (mode: SidebarMode) => void;
}

interface SidebarPreferences {
  mode: SidebarMode;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(
  undefined,
);

// LocalStorage utilities
const getStoredSidebarPreferences = (): SidebarPreferences | null => {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error(
      'Error reading sidebar preferences from localStorage:',
      error,
    );
    return null;
  }
};

const setStoredSidebarPreferences = (preferences: SidebarPreferences): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving sidebar preferences to localStorage:', error);
  }
};

// ✅ REUSABLE COMPONENT: NavigationLink
const NavigationLink: React.FC<{
  href: string;
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
  onClick?: () => void;
  sx?: SxProps;
  pl?: number;
  showText?: boolean;
}> = ({
  href,
  icon,
  text,
  isActive,
  onClick,
  sx = {},
  pl = 0,
  showText = true,
}) => {
  const theme = useTheme();
  const sidebarContext = React.useContext(SidebarContext);
  const isShrunk = sidebarContext?.isShrunk || false;

  const baseSx: SxProps = {
    display: 'flex',
    alignItems: 'center',
    borderRadius: 1,
    my: pl ? 0.25 : 0.5,
    backgroundColor: isActive ? theme.palette.primary.dark : 'transparent',
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: isActive
        ? theme.palette.primary.dark
        : alpha(theme.palette.primary.contrastText, 0.1),
    },
    justifyContent: 'center',
    minHeight: 48,
  };

  return (
    <Link
      href={href}
      style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}
      onClick={onClick}
    >
      <Tooltip title={isShrunk && showText ? text : ''} placement="right">
        <ListItemButton sx={{ ...baseSx, ...sx }}>
          <ListItemIcon
            sx={{
              color: theme.palette.primary.contrastText,
              minWidth: pl ? 20 : isShrunk ? 0 : 40,
              justifyContent: 'center',
            }}
          >
            {icon}
          </ListItemIcon>
          {showText && (
            <ListItemText
              primary={text}
              sx={{ ml: pl ? 1 : 2, opacity: isShrunk ? 0 : 1 }}
            />
          )}
        </ListItemButton>
      </Tooltip>
    </Link>
  );
};

const userRoutesMap: Record<UserType, NavigationItem[]> = {
  admin: [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    // { text: 'Leads', icon: <GroupOutlinedIcon />, path: '/leads' },
    { text: 'Dealers', icon: <PersonIcon />, path: '/dealer' },
    { text: 'Admin', icon: <AdminPanelSettingsIcon />, path: '/adminstration' },
    { text: 'Support', icon: <SupportAgentIcon />, path: '/support' },
  ],
  dealer: [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Leads', icon: <Groups2Icon />, path: '/leads' },
    { text: 'Invoices', icon: <ReceiptLongIcon />, path: '/invoices' },
    { text: 'Quotations', icon: <RequestQuoteIcon />, path: '/quotations' },
    // { text: 'Messages', icon: <MessageIcon />, path: '/messages' },
    {
      text: 'Packages',
      icon: <Inventory2OutlinedIcon />,
      path: '/packages',
    },
    {
      text: 'Support',
      icon: <SupportAgentIcon />,
      path: '/support',
    },
    {
      text: 'Profile',
      icon: <AccountBoxOutlinedIcon />,
      path: '/profile',
    },
  ],
};

const userPrefixMap: Record<UserType, string> = {
  admin: '/admin',
  dealer: '/dealer',
};

const prefixRoutes = (
  items: NavigationItem[],
  prefix: string,
): NavigationItem[] =>
  items.map((item) => ({
    ...item,
    path: item.path === '/' ? prefix : `${prefix}${item.path}`,
  }));

// Theme Toggle Button Component
const ThemeToggleButton: React.FC<{ isShrunk: boolean }> = ({ isShrunk }) => {
  const { mode, toggleMode } = useThemeMode();
  const theme = useTheme();
  
  return (
    <ListItem disablePadding>
      <Tooltip title={isShrunk ? (mode === 'light' ? 'Dark Mode' : 'Light Mode') : ''} placement="right">
        <ListItemButton
          onClick={toggleMode}
          sx={{
            borderRadius: 1,
            my: 0.5,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.contrastText, 0.1),
            },
            justifyContent: isShrunk ? 'center' : 'flex-start',
            minHeight: 48,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: isShrunk ? 0 : 40,
              justifyContent: 'center',
              color: theme.palette.primary.contrastText,
            }}
          >
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </ListItemIcon>
          {!isShrunk && (
            <ListItemText primary={mode === 'light' ? 'Dark Mode' : 'Light Mode'} sx={{ ml: 1 }} />
          )}
        </ListItemButton>
      </Tooltip>
    </ListItem>
  );
};

// Bottom navigation is rendered at the footer of the sidebar.
// We include a dealer-only entry to switch profiles above Logout.
const getBottomNavigationItems = (userType: UserType): NavigationItem[] => {
  if (userType === 'dealer') {
    return [
      {
        text: 'Switch Profile',
        icon: <SwitchAccountIcon />,
        path: '/dealer/select-profile',
      },
      { text: 'Logout', icon: <LogoutIcon />, path: '/logout' },
    ];
  }
  return [{ text: 'Logout', icon: <LogoutIcon />, path: '/logout' }];
};

const Sidebar: React.FC<SidebarProps> = ({
  userType,
  mobileOpen = false,
  onMobileToggle,
  mode = 'full',
  onModeChange,
}) => {
  const navigationItems =
    userType && userRoutesMap[userType]
      ? prefixRoutes(userRoutesMap[userType], userPrefixMap[userType])
      : [];

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [hovered, setHovered] = useState(false);
  const [localMode, setLocalMode] = useState<SidebarMode>(mode);

  // Load preferences from localStorage on mount
  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPreferences = getStoredSidebarPreferences();
      if (storedPreferences?.mode) {
        setLocalMode(storedPreferences.mode);
        onModeChange?.(storedPreferences.mode);
      }
    }
  }, [onModeChange]);

  // Sync with props
  // useEffect(() => {
  //   setLocalMode(mode);
  // }, [mode]);

  const isShrunk =
    !isMobile &&
    (localMode === 'shrink' || (localMode === 'hover' && !hovered));
  const isHidden = localMode === 'hidden';
  const currentWidth = isHidden
    ? DRAWER_WIDTH_HIDDEN
    : isShrunk
      ? DRAWER_WIDTH_SHRUNK
      : DRAWER_WIDTH;

  const handleModeChange = (newMode: SidebarMode) => {
    setLocalMode(newMode);

    // Save to localStorage
    setStoredSidebarPreferences({ mode: newMode });

    // Notify parent component
    onModeChange?.(newMode);
  };

  const toggleMode = () => {
    const newMode = localMode === 'full' ? 'shrink' : 'full';
    handleModeChange(newMode);
  };

  const handleMouseEnter = () => {
    if (localMode === 'hover') {
      setHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (localMode === 'hover') {
      setHovered(false);
    }
  };

  const handleMobileClose = () => {
    if (isMobile && onMobileToggle) {
      onMobileToggle();
    }
  };

  const handleExpandClick = (itemText: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemText)
        ? prev.filter((item) => item !== itemText)
        : [...prev, itemText],
    );
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const renderNavigationItem = (item: NavigationItem) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems.includes(item.text);
    const active = isActive(item.path);

    if (hasSubItems && isShrunk) {
      // Special handling for subitems in shrunk mode
      return (
        <Tooltip key={item.text} title={item.text} placement="right">
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleExpandClick(item.text)}
              sx={{
                borderRadius: 1,
                my: 0.5,
                backgroundColor: active
                  ? theme.palette.primary.main
                  : 'transparent',
                color: active ? theme.palette.primary.contrastText : 'inherit',
                '&:hover': {
                  backgroundColor: active
                    ? theme.palette.primary.dark
                    : alpha(theme.palette.primary.main, 0.1),
                },
                justifyContent: 'center',
                minHeight: 48,
              }}
            >
              <ListItemIcon
                sx={{
                  color: active
                    ? theme.palette.primary.contrastText
                    : 'inherit',
                  minWidth: 0,
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
        </Tooltip>
      );
    }

    return (
      <React.Fragment key={item.text}>
        <ListItem disablePadding>
          {hasSubItems ? (
            <ListItemButton
              onClick={() => handleExpandClick(item.text)}
              sx={{
                borderRadius: 1,
                my: 0.5,
                backgroundColor: active
                  ? theme.palette.primary.dark
                  : 'transparent',
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: active
                    ? theme.palette.primary.dark
                    : alpha(theme.palette.primary.contrastText, 0.1),
                },
                justifyContent: isShrunk ? 'center' : 'flex-start',
                minHeight: 48,
              }}
            >
              <ListItemIcon
                sx={{
                  color: theme.palette.primary.contrastText,
                  minWidth: isShrunk ? 0 : 40,
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!isShrunk && (
                <>
                  <ListItemText primary={item.text} sx={{ ml: 1 }} />
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </>
              )}
            </ListItemButton>
          ) : (
            <NavigationLink
              href={item.path}
              icon={item.icon}
              text={item.text}
              isActive={active}
              onClick={handleMobileClose}
              showText={!isShrunk}
            />
          )}
        </ListItem>

        {hasSubItems && !isShrunk && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.subItems?.map((subItem) => (
                <ListItem key={subItem.text} disablePadding>
                  <NavigationLink
                    href={subItem.path}
                    icon={<CircleIcon sx={{ fontSize: 8 }} />}
                    text={subItem.text}
                    isActive={isActive(subItem.path)}
                    onClick={handleMobileClose}
                    pl={4}
                    showText={!isShrunk}
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const sidebarContextValue: SidebarContextType = {
    mode: localMode,
    isShrunk,
    isHidden,
    toggleMode,
    setMode: handleModeChange,
  };

  const drawerContent = (
    <SidebarContext.Provider value={sidebarContextValue}>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          borderColor: alpha(theme.palette.primary.contrastText, 0.12),
          transition: theme.transitions.create(['background-color', 'color']),
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            borderBottom: `1px solid ${alpha(theme.palette.primary.contrastText, 0.12)}`,
            minHeight: 64,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              transition: theme.transitions.create(['opacity', 'maxWidth'], {
                duration: theme.transitions.duration.shortest,
              }),
              opacity: isShrunk && !isMobile ? 0 : 1,
              maxWidth: isShrunk && !isMobile ? 0 : 'auto',
            }}
          >
            Engine Finders
          </Typography>
          <Box>
            {!isMobile && (
              <IconButton
                onClick={toggleMode}
                size="small"
                sx={{
                  color: 'inherit',
                }}
              >
                {isShrunk ? <MenuIcon /> : <MenuOpen />}
              </IconButton>
            )}
          </Box>
        </Box>
        {/* Main Navigation */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            py: 1,
          }}
        >
          <List>{navigationItems.map(renderNavigationItem)}</List>
        </Box>
        {/* Bottom Navigation */}
        <Box>
          <Divider />
          <List sx={{ py: 1 }}>
            <ThemeToggleButton isShrunk={isShrunk} />
            {getBottomNavigationItems(userType).map((item) => (
              <ListItem key={item.text} disablePadding>
                <NavigationLink
                  href={item.path}
                  icon={item.icon}
                  text={item.text}
                  isActive={isActive(item.path)}
                  onClick={handleMobileClose}
                  showText={!isShrunk}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </SidebarContext.Provider>
  );

  if (isHidden && !isMobile) {
    return null;
  }

  return (
    <Box
      component="nav"
      sx={{
        width: { md: currentWidth },
        flexShrink: { md: 0 },
        transition: theme.transitions.create('width'),
      }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            border: 'none',
            boxShadow: theme.shadows[8],
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: currentWidth,
              border: 'none',
              borderRight: `1px solid ${alpha(theme.palette.primary.contrastText, 0.12)}`,
              overflowX: 'hidden',
              transition: theme.transitions.create('width'),
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </Box>
  );
};

// Layout component
const Layout: React.FC<{
  children: React.ReactNode;
  userType: string | undefined;
  sidebarMode?: SidebarMode;
  onSidebarModeChange?: (mode: SidebarMode) => void;
}> = ({ children, userType, sidebarMode, onSidebarModeChange }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const currentWidth =
    sidebarMode === 'hidden'
      ? DRAWER_WIDTH_HIDDEN
      : sidebarMode === 'shrink' || sidebarMode === 'hover'
        ? DRAWER_WIDTH_SHRUNK
        : DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        userType={userType as UserType}
        mobileOpen={mobileOpen}
        onMobileToggle={handleDrawerToggle}
        mode={sidebarMode}
        onModeChange={onSidebarModeChange}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${currentWidth}px)` },
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
          transition: theme.transitions.create('width'),
        }}
      >
        {/* Mobile menu button */}
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              position: 'fixed',
              top: 16,
              left: 16,
              zIndex: theme.zIndex.appBar,
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.shadows[2],
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Desktop sidebar toggle for hidden mode */}
        {!isMobile && sidebarMode === 'hidden' && (
          <IconButton
            color="inherit"
            aria-label="show sidebar"
            edge="start"
            onClick={() => onSidebarModeChange?.('full')}
            sx={{
              position: 'fixed',
              top: 16,
              left: 16,
              zIndex: theme.zIndex.appBar,
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.shadows[2],
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Main content area */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

// Hook for using sidebar context
const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export default Sidebar;
export { Layout, useSidebar };
export type { SidebarMode };
