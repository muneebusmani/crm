'use client';

import type { Highlight, Notification, QuickAction, Task } from '@crm/types';
import {
  Add,
  ArrowForward,
  AttachMoney,
  CalendarToday,
  Download,
  Notifications,
  People,
  Schedule,
  TrendingUp,
  Warning,
} from '@mui/icons-material';
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from '@mui/material';
import { useState } from 'react';

const HomePage = () => {
  const theme = useTheme();
  const [notifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'Quota Low',
      description: 'Only 3 leads remaining this month',
      type: 'warning',
      time: '2 hours ago',
    },
    {
      id: 2,
      title: 'Renew Now',
      description: 'Your package expires in 5 days',
      type: 'info',
      time: '1 day ago',
    },
    {
      id: 3,
      title: 'New Feature',
      description: 'Reporting dashboard now available',
      type: 'success',
      time: '3 days ago',
    },
  ]);

  const [tasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Follow up with client',
      dueDate: 'Today, 3:00 PM',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Send monthly report',
      dueDate: 'Tomorrow',
      priority: 'medium',
    },
    {
      id: 3,
      title: 'Review new leads',
      dueDate: 'Tomorrow',
      priority: 'low',
    },
  ]);

  const quickActions: QuickAction[] = [
    {
      title: 'View Leads',
      icon: <People />,
      color: 'primary',
      action: () => console.log('View Leads'),
    },
    {
      title: 'Upgrade Package',
      icon: <TrendingUp />,
      color: 'success',
      action: () => console.log('Upgrade Package'),
    },
    {
      title: 'Download Report',
      icon: <Download />,
      color: 'secondary',
      action: () => console.log('Download Report'),
    },
    {
      title: 'New Campaign',
      icon: <Add />,
      color: 'info',
      action: () => console.log('New Campaign'),
    },
  ];

  const highlights: Highlight[] = [
    {
      title: 'New Leads Today',
      value: '5',
      change: '+2 from yesterday',
      changeType: 'positive',
      icon: <People sx={{ fontSize: 24 }} />,
      color: 'primary',
    },
    {
      title: 'Leads Remaining',
      value: '12',
      icon: <Notifications sx={{ fontSize: 24 }} />,
      color: 'warning',
    },
    {
      title: 'Conversion Rate',
      value: '24%',
      change: '+3% from last week',
      changeType: 'positive',
      icon: <TrendingUp sx={{ fontSize: 24 }} />,
      color: 'success',
    },
    {
      title: 'Revenue',
      value: '$2,450',
      change: '+12% this month',
      changeType: 'positive',
      icon: <AttachMoney sx={{ fontSize: 24 }} />,
      color: 'secondary',
    },
  ];

  // Progress data
  const leadProgress = 75; // 75% of monthly quota
  const taskCompletion = 40; // 40% of tasks completed

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Greeting Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="fontWeightBold">
          Welcome back,{' '}
          <span style={{ color: theme.palette.primary.main }}>
            Ali Auto Garage
          </span>{' '}
          👋
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 1 }}>
          Here's what's happening with your business today
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" fontWeight="fontWeightBold">
            Quick Actions
          </Typography>
          <Button
            endIcon={<Add />}
            variant="text"
            color="primary"
            onClick={() => console.log('Add new action')}
          >
            Add New
          </Button>
        </Box>
        <Grid container spacing={2}>
          {quickActions.map((action) => (
            <Grid key={action.title} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  border: `1px solid ${alpha(theme.palette[action.color].main, 0.1)}`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                    border: `1px solid ${theme.palette[action.color].main}`,
                  },
                }}
                onClick={action.action}
              >
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        backgroundColor: alpha(
                          theme.palette[action.color].main,
                          0.1,
                        ),
                        color: theme.palette[action.color].main,
                        mr: 2,
                      }}
                    >
                      {action.icon}
                    </Box>
                    <Typography variant="h6" fontWeight="fontWeightBold">
                      {action.title}
                    </Typography>
                    <ArrowForward
                      sx={{ ml: 'auto', color: 'text.secondary' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {/* Today's Highlights */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="fontWeightBold" gutterBottom>
                Today's Highlights
              </Typography>
              <Grid container spacing={2}>
                {highlights.map((highlight) => (
                  <Grid key={highlight.title} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card
                      variant="outlined"
                      sx={{
                        height: '100%',
                        borderColor: 'divider',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          borderColor: theme.palette[highlight.color].main,
                          backgroundColor: alpha(
                            theme.palette[highlight.color].main,
                            0.03,
                          ),
                        },
                      }}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: '8px',
                              backgroundColor: alpha(
                                theme.palette[highlight.color].main,
                                0.1,
                              ),
                              color: theme.palette[highlight.color].main,
                              mr: 1,
                            }}
                          >
                            {highlight.icon}
                          </Box>
                          <Typography variant="body2" color="textSecondary">
                            {highlight.title}
                          </Typography>
                        </Box>
                        <Typography
                          variant="h4"
                          fontWeight="fontWeightBold"
                          mb={0.5}
                        >
                          {highlight.value}
                        </Typography>
                        {highlight.change && (
                          <Chip
                            label={highlight.change}
                            size="small"
                            color={
                              highlight.changeType === 'positive'
                                ? 'success'
                                : 'error'
                            }
                            variant="outlined"
                            sx={{
                              height: 20,
                              borderRadius: '6px',
                              '.MuiChip-label': {
                                fontSize: '0.7rem',
                              },
                            }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Progress Section */}
              <Box sx={{ mt: 3 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    Monthly Lead Quota
                  </Typography>
                  <Typography variant="body2" fontWeight="fontWeightMedium">
                    {leadProgress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={leadProgress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: theme.palette.primary.main,
                    },
                  }}
                />
                <Box display="flex" justifyContent="space-between" mt={0.5}>
                  <Typography variant="caption" color="textSecondary">
                    45 of 60 leads
                  </Typography>
                  <Typography variant="caption" color="primary">
                    15 remaining
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    Task Completion
                  </Typography>
                  <Typography variant="body2" fontWeight="fontWeightMedium">
                    {taskCompletion}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={taskCompletion}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: theme.palette.success.main,
                    },
                  }}
                />
                <Box display="flex" justifyContent="space-between" mt={0.5}>
                  <Typography variant="caption" color="textSecondary">
                    2 of 5 tasks completed
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    3 remaining
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar Section */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Grid container spacing={3}>
            {/* Notifications */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6" fontWeight="fontWeightBold">
                      Notifications
                    </Typography>
                    <IconButton
                      size="small"
                      sx={{
                        backgroundColor: alpha(theme.palette.warning.main, 0.1),
                        color: theme.palette.warning.main,
                        '&:hover': {
                          backgroundColor: alpha(
                            theme.palette.warning.main,
                            0.2,
                          ),
                        },
                      }}
                    >
                      <Notifications />
                    </IconButton>
                  </Box>

                  <List>
                    {notifications.map((notification) => (
                      <Box key={notification.id}>
                        <ListItem
                          sx={{
                            py: 1.5,
                            borderRadius: 1,
                            mb: 1,
                            backgroundColor:
                              notification.type === 'warning'
                                ? alpha(theme.palette.warning.main, 0.1)
                                : notification.type === 'info'
                                  ? alpha(theme.palette.info.main, 0.1)
                                  : alpha(theme.palette.success.main, 0.1),
                            border: `1px solid ${
                              notification.type === 'warning'
                                ? alpha(theme.palette.warning.main, 0.3)
                                : notification.type === 'info'
                                  ? alpha(theme.palette.info.main, 0.3)
                                  : alpha(theme.palette.success.main, 0.3)
                            }`,
                            '&:hover': {
                              backgroundColor:
                                notification.type === 'warning'
                                  ? alpha(theme.palette.warning.main, 0.2)
                                  : notification.type === 'info'
                                    ? alpha(theme.palette.info.main, 0.2)
                                    : alpha(theme.palette.success.main, 0.2),
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 36,
                              color:
                                notification.type === 'warning'
                                  ? theme.palette.warning.main
                                  : notification.type === 'info'
                                    ? theme.palette.info.main
                                    : theme.palette.success.main,
                            }}
                          >
                            {notification.type === 'warning' ? (
                              <Warning />
                            ) : (
                              <Notifications />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography
                                variant="body2"
                                fontWeight="fontWeightBold"
                                color="textPrimary"
                              >
                                {notification.title}
                              </Typography>
                            }
                            secondary={
                              <>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="textSecondary"
                                >
                                  {notification.description}
                                </Typography>
                                <br />
                                <Typography
                                  component="span"
                                  variant="caption"
                                  color="textSecondary"
                                  sx={{ opacity: 0.7 }}
                                >
                                  {notification.time}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </Box>
                    ))}
                  </List>

                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{ mt: 1 }}
                    onClick={() => console.log('View all notifications')}
                  >
                    View All Notifications
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Upcoming Tasks */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6" fontWeight="fontWeightBold">
                      Upcoming Tasks
                    </Typography>
                    <IconButton
                      size="small"
                      sx={{
                        backgroundColor: alpha(theme.palette.info.main, 0.1),
                        color: theme.palette.info.main,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.info.main, 0.2),
                        },
                      }}
                    >
                      <Schedule />
                    </IconButton>
                  </Box>

                  <List>
                    {tasks.map((task) => (
                      <ListItem
                        key={task.id}
                        sx={{
                          py: 1.5,
                          borderRadius: 1,
                          mb: 1,
                          border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                          '&:hover': {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.05,
                            ),
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor:
                                task.priority === 'high'
                                  ? theme.palette.error.main
                                  : task.priority === 'medium'
                                    ? theme.palette.warning.main
                                    : theme.palette.success.main,
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              fontWeight="fontWeightMedium"
                              color="textPrimary"
                            >
                              {task.title}
                            </Typography>
                          }
                          secondary={
                            <Box
                              display="flex"
                              alignItems="center"
                              mt={0.5}
                              component={'span'}
                            >
                              <CalendarToday
                                sx={{
                                  fontSize: 14,
                                  mr: 0.5,
                                  color: 'textSecondary',
                                }}
                              />
                              <Typography
                                component="span"
                                variant="caption"
                                color="textSecondary"
                              >
                                {task.dueDate}
                              </Typography>
                            </Box>
                          }
                        />
                        <Chip
                          label={task.priority}
                          size="small"
                          color={
                            task.priority === 'high'
                              ? 'error'
                              : task.priority === 'medium'
                                ? 'warning'
                                : 'success'
                          }
                          variant="outlined"
                          sx={{
                            height: 20,
                            borderRadius: '6px',
                            '.MuiChip-label': {
                              fontSize: '0.65rem',
                            },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Add />}
                    sx={{ mt: 1 }}
                    onClick={() => console.log('Add new task')}
                  >
                    Add New Task
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;
