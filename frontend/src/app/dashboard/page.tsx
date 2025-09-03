"use client";

import {
  ArrowDownward,
  ArrowUpward,
  AttachMoney,
  CalendarToday,
  MoreVert,
  People,
  ShoppingCart,
  Visibility,
} from "@mui/icons-material";
import {
  Avatar,
  alpha,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import type React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Types
interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
  icon: React.ReactNode;
  color: string;
}

interface RevenueData {
  name: string;
  revenue: number;
  profit: number;
}

interface TrafficData {
  name: string;
  value: number;
  color: string;
}

interface RecentActivity {
  id: number;
  user: string;
  action: string;
  time: string;
  avatar: string;
}

// Mock data
const revenueData: RevenueData[] = [
  { name: "Jan", revenue: 4000, profit: 2400 },
  { name: "Feb", revenue: 3000, profit: 1398 },
  { name: "Mar", revenue: 9800, profit: 2000 },
  { name: "Apr", revenue: 3908, profit: 2780 },
  { name: "May", revenue: 4800, profit: 1890 },
  { name: "Jun", revenue: 3800, profit: 2390 },
  { name: "Jul", revenue: 4300, profit: 3490 },
];

const trafficData: TrafficData[] = [
  { name: "Direct", value: 400, color: "#0088FE" },
  { name: "Social", value: 300, color: "#00C49F" },
  { name: "Referral", value: 300, color: "#FFBB28" },
  { name: "Email", value: 200, color: "#FF8042" },
];

const recentActivities: RecentActivity[] = [
  {
    id: 1,
    user: "John Doe",
    action: "Made a purchase",
    time: "2 min ago",
    avatar: "JD",
  },
  {
    id: 2,
    user: "Sarah Smith",
    action: "Subscribed to newsletter",
    time: "15 min ago",
    avatar: "SS",
  },
  {
    id: 3,
    user: "Mike Johnson",
    action: "Left a review",
    time: "1 hour ago",
    avatar: "MJ",
  },
  {
    id: 4,
    user: "Emma Wilson",
    action: "Shared on social media",
    time: "3 hours ago",
    avatar: "EW",
  },
];

// Components
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  color,
}) => {
  return (
    <Card
      sx={{
        height: "100%",
        boxShadow: 3,
        transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Typography
              color="textSecondary"
              gutterBottom
              variant="h6"
              component="h2"
            >
              {title}
            </Typography>
            <Typography variant="h4" component="h3" fontWeight="fontWeightBold">
              {value}
            </Typography>
          </Box>
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.1),
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar>
        </Box>
        <Box display="flex" alignItems="center" mt={2}>
          {changeType === "positive" ? (
            <ArrowUpward sx={{ color: "success.main", fontSize: 16 }} />
          ) : (
            <ArrowDownward sx={{ color: "error.main", fontSize: 16 }} />
          )}
          <Typography
            variant="body2"
            sx={{
              color: changeType === "positive" ? "success.main" : "error.main",
              fontWeight: "fontWeightMedium",
              ml: 0.5,
            }}
          >
            {change}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ ml: 0.5 }}>
            vs last month
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const AnalyticsPage: React.FC = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              fontWeight="fontWeightBold"
              gutterBottom
            >
              Analytics Dashboard
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarToday sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="body2" color="textSecondary">
                Last updated: Today at 14:30
              </Typography>
            </Box>
          </Box>
          <Chip
            label="Live"
            color="success"
            icon={
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: theme.palette.success.main,
                }}
              />
            }
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Revenue"
            value="$42,567"
            change="+12.5%"
            changeType="positive"
            icon={<AttachMoney />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="New Customers"
            value="1,248"
            change="+8.2%"
            changeType="positive"
            icon={<People />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Orders"
            value="3,842"
            change="-3.1%"
            changeType="negative"
            icon={<ShoppingCart />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Page Views"
            value="89,321"
            change="+24.7%"
            changeType="positive"
            icon={<Visibility />}
            color={theme.palette.secondary.main}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" fontWeight="fontWeightBold">
                  Revenue Overview
                </Typography>
                <MoreVert sx={{ color: "text.secondary" }} />
              </Box>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={revenueData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="revenue"
                      fill={theme.palette.primary.main}
                      name="Revenue"
                    />
                    <Bar
                      dataKey="profit"
                      fill={theme.palette.success.main}
                      name="Profit"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Traffic Sources */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" fontWeight="fontWeightBold">
                  Traffic Sources
                </Typography>
                <MoreVert sx={{ color: "text.secondary" }} />
              </Box>
              <Box sx={{ height: 200, mb: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={trafficData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${percent ? (percent * 100).toFixed(0) : "0"}%`
                      }
                    >
                      {trafficData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box>
                {trafficData.map((item) => (
                  <Box
                    key={item.name}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={1}
                  >
                    <Box display="flex" alignItems="center">
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          backgroundColor: item.color,
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2">{item.name}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="fontWeightMedium">
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Performance Trend */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" fontWeight="fontWeightBold">
                  Performance Trend
                </Typography>
                <MoreVert sx={{ color: "text.secondary" }} />
              </Box>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={revenueData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke={theme.palette.primary.main}
                      activeDot={{ r: 8 }}
                      name="Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke={theme.palette.success.main}
                      name="Profit"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" fontWeight="fontWeightBold">
                  Recent Activity
                </Typography>
                <MoreVert sx={{ color: "text.secondary" }} />
              </Box>
              <List sx={{ maxHeight: 300, overflow: "auto" }}>
                {recentActivities.map((activity) => (
                  <ListItem key={activity.id} sx={{ py: 1.5 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        {activity.avatar}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.user}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="textPrimary"
                          >
                            {activity.action}
                          </Typography>
                          {" — "}
                          {activity.time}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Progress Section */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="fontWeightBold" gutterBottom>
                Sales Target
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="textSecondary">
                  Monthly Goal
                </Typography>
                <Typography variant="body2" fontWeight="fontWeightMedium">
                  75%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={75}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "grey.200",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: theme.palette.success.main,
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="fontWeightBold" gutterBottom>
                Customer Satisfaction
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="textSecondary">
                  This Month
                </Typography>
                <Typography variant="body2" fontWeight="fontWeightMedium">
                  92%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={92}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "grey.200",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: theme.palette.info.main,
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="fontWeightBold" gutterBottom>
                Conversion Rate
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="textSecondary">
                  Current
                </Typography>
                <Typography variant="body2" fontWeight="fontWeightMedium">
                  4.8%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={48}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "grey.200",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: theme.palette.warning.main,
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AnalyticsPage;
