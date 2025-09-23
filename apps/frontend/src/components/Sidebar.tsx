"use client";

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
  Message as MessageIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import {
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
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

const drawerWidth = 280;

const adminNavigationItems: NavigationItem[] = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/admin" },
  { text: "Leads", icon: <GroupOutlinedIcon />, path: "/dealer/leads" },
  { text: "Dealers", icon: <PersonIcon />, path: "/admin/dealer" },
];

const dealerNavigationItems: NavigationItem[] = [
  { text: "Home", icon: <HomeIcon />, path: "/dealer" },
  { text: "Leads", icon: <Groups2Icon />, path: "/dealer/leads" },
  { text: "Messages", icon: <MessageIcon />, path: "/dealer/messages" },
  {
    text: "Packages",
    icon: <Inventory2OutlinedIcon />,
    path: "/dealer/packages",
  },
  {
    text: "Profile",
    icon: <AccountBoxOutlinedIcon />,
    path: "/dealer/profile",
  },
];
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
  userType: string | undefined;
  mobileOpen?: boolean;
  onMobileToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  userType,
  mobileOpen = false,
  onMobileToggle,
}) => {
  console.log("userType ===>", userType);

  const navigationItems =
    userType === "dealer" ? dealerNavigationItems : adminNavigationItems;

  const bottomNavigationItems: NavigationItem[] = [
    // { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
    // { text: "Help", icon: <HelpIcon />, path: "/help" },
    { text: "Logout", icon: <LogoutIcon />, path: "/logout" },
  ];
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

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
    return pathname === path || (pathname?.startsWith(path) && path !== "/");
  };

  const renderNavigationItem = (item: NavigationItem) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems.includes(item.text);
    const active = isActive(item.path);

    return (
      <React.Fragment key={item.text}>
        <ListItem disablePadding>
          {hasSubItems ? (
            <ListItemButton
              onClick={() => handleExpandClick(item.text)}
              sx={{
                backgroundColor: active
                  ? theme.palette.primary.main
                  : "transparent",
                color: active ? theme.palette.primary.contrastText : "inherit",
                "&:hover": {
                  backgroundColor: active
                    ? theme.palette.primary.dark
                    : theme.palette.action.hover,
                },
                borderRadius: 1,
                mx: 1,
                my: 0.5,
              }}
            >
              <ListItemIcon
                sx={{
                  color: active
                    ? theme.palette.primary.contrastText
                    : "inherit",
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} sx={{ ml: 1 }} />
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          ) : (
            <Link
              href={item.path}
              style={{
                textDecoration: "none",
                color: "inherit",
                width: "100%",
              }}
              onClick={handleMobileClose}
            >
              <ListItemButton
                sx={{
                  backgroundColor: active
                    ? theme.palette.primary.main
                    : "transparent",
                  color: active
                    ? theme.palette.primary.contrastText
                    : "inherit",
                  "&:hover": {
                    backgroundColor: active
                      ? theme.palette.primary.dark
                      : theme.palette.action.hover,
                  },
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    color: active
                      ? theme.palette.primary.contrastText
                      : "inherit",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} sx={{ ml: 1 }} />
              </ListItemButton>
            </Link>
          )}
        </ListItem>

        {hasSubItems && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.subItems?.map((subItem) => (
                <ListItem key={subItem.text} disablePadding>
                  <Link
                    href={subItem.path}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      width: "100%",
                    }}
                    onClick={handleMobileClose}
                  >
                    <ListItemButton
                      sx={{
                        pl: 4,
                        backgroundColor: isActive(subItem.path)
                          ? theme.palette.primary.main
                          : "transparent",
                        color: isActive(subItem.path)
                          ? theme.palette.primary.contrastText
                          : "inherit",
                        "&:hover": {
                          backgroundColor: isActive(subItem.path)
                            ? theme.palette.primary.dark
                            : theme.palette.action.hover,
                        },
                        borderRadius: 1,
                        mx: 1,
                        my: 0.25,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 20 }}>
                        <CircleIcon
                          sx={{
                            fontSize: 8,
                            color: isActive(subItem.path)
                              ? theme.palette.primary.contrastText
                              : theme.palette.text.secondary,
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText primary={subItem.text} sx={{ ml: 1 }} />
                    </ListItemButton>
                  </Link>
                </ListItem>
              ))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
            Your App
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Dashboard
          </Typography>
        </Link>
      </Box>

      {/* Main Navigation */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        <List>{navigationItems.map(renderNavigationItem)}</List>
      </Box>

      {/* Bottom Navigation */}
      <Box>
        <Divider />
        <List sx={{ py: 1 }}>
          {bottomNavigationItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <Link
                href={item.path}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  width: "100%",
                }}
                onClick={handleMobileClose}
              >
                <ListItemButton
                  sx={{
                    backgroundColor: isActive(item.path)
                      ? theme.palette.primary.main
                      : "transparent",
                    color: isActive(item.path)
                      ? theme.palette.primary.contrastText
                      : "inherit",
                    "&:hover": {
                      backgroundColor: isActive(item.path)
                        ? theme.palette.primary.dark
                        : theme.palette.action.hover,
                    },
                    borderRadius: 1,
                    mx: 1,
                    my: 0.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive(item.path)
                        ? theme.palette.primary.contrastText
                        : "inherit",
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} sx={{ ml: 1 }} />
                </ListItemButton>
              </Link>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
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
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            border: "none",
            boxShadow: theme.shadows[8],
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            border: "none",
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

// Layout component
const Layout: React.FC<{
  children: React.ReactNode;
  userType: string | undefined;
}> = ({ children, userType }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        userType={userType}
        mobileOpen={mobileOpen}
        onMobileToggle={handleDrawerToggle}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: theme.palette.grey[50],
          minHeight: "100vh",
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
              position: "fixed",
              top: 16,
              left: 16,
              zIndex: theme.zIndex.appBar,
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.shadows[2],
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Main content area */}
        <Box>{children}</Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
export { Layout };
