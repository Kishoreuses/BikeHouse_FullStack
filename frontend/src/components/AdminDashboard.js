import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../api/api';
import {
    Container,
    Typography,
    Grid,
    Box,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Card,
    CardContent,
    Avatar,
    Chip,
    Divider
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from 'recharts';
import {
    People as PeopleIcon,
    TwoWheeler as BikeIcon,
    AttachMoney as MoneyIcon,
    TrendingUp as TrendingUpIcon,
    AdminPanelSettings as AdminIcon,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    Assessment as AssessmentIcon
} from '@mui/icons-material';

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Royal color palette
const royalColors = {
    primary: '#1a237e', // Deep blue
    secondary: '#ffd700', // Gold
    accent: '#c62828', // Deep red
    success: '#2e7d32', // Green
    warning: '#f57c00', // Orange
    info: '#0277bd', // Light blue
    background: '#f8f9fa',
    card: '#ffffff',
    text: '#263238',
    textSecondary: '#546e7a'
};



function AdminDashboard() {
    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    const [bikes, setBikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [salesData, setSalesData] = useState([]);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedBike, setSelectedBike] = useState(null);
    const [message, setMessage] = useState('');


    const fetchData = async () => {
        const token = localStorage.getItem('token');
        setLoading(true);
        Promise.all([
            axios.get(`${API_URL}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${API_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${API_URL}/api/admin/bikes`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${API_URL}/api/admin/sales-report`, { headers: { Authorization: `Bearer ${token}` } })
        ]).then(([statsRes, usersRes, bikesRes, salesRes]) => {
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setBikes(bikesRes.data);
            const chartData = salesRes.data.map(item => ({
                month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
                sales: item.sales
            }));
            setSalesData(chartData);
        }).finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, []);

    const handleMarkAsSold = async () => {
        if (!selectedBike) return;
        const token = localStorage.getItem('token');
        try {
            await axios.patch(`${API_URL}/api/bikes/${selectedBike._id}/sold`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Bike marked as sold!');
            setConfirmOpen(false);
            setSelectedBike(null);
            fetchData();
        } catch (err) {
            setMessage('Failed to mark as sold');
            setConfirmOpen(false);
            setSelectedBike(null);
        }
    };

    // Stats Cards Component
    const StatsCard = ({ title, value, icon, color, subtitle }) => (
        <Card
            sx={{
                background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
                border: `1px solid ${color}30`,
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                }
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Avatar
                        sx={{
                            bgcolor: color,
                            width: 56,
                            height: 56,
                            boxShadow: `0 4px 20px ${color}40`
                        }}
                    >
                        {icon}
                    </Avatar>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: color }}>
                            {value}
                        </Typography>
                        <Typography variant="body2" sx={{ color: royalColors.textSecondary }}>
                            {subtitle}
                        </Typography>
                    </Box>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: royalColors.text }}>
                    {title}
                </Typography>
            </CardContent>
        </Card>
    );

    // User Card Component
    const UserCard = ({ user }) => (
        <Card
            sx={{
                mb: 2,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                    transform: 'translateY(-2px)'
                }
            }}
        >
            <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        sx={{
                            bgcolor: royalColors.primary,
                            width: 48,
                            height: 48
                        }}
                    >
                        {user.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: royalColors.text }}>
                            {user.username}
                        </Typography>
                        <Typography variant="body2" sx={{ color: royalColors.textSecondary }}>
                            {user.email}
                        </Typography>
                    </Box>
                    <Chip
                        label="Active"
                        color="success"
                        size="small"
                        icon={<CheckIcon />}
                    />
                </Box>
            </CardContent>
        </Card>
    );

    // Bike Card Component
    const BikeCard = ({ bike }) => (
        <Card
            sx={{
                mb: 2,
                background: bike.sold
                    ? 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)'
                    : 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                border: `1px solid ${bike.sold ? '#ef5350' : '#4caf50'}`,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                    transform: 'translateY(-2px)'
                }
            }}
        >
            <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                            sx={{
                                bgcolor: bike.sold ? royalColors.accent : royalColors.success,
                                width: 48,
                                height: 48
                            }}
                        >
                            <BikeIcon />
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: royalColors.text, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                                {bike.brand} {bike.model}
                            </Typography>
                            <Typography variant="body2" sx={{ color: royalColors.textSecondary, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                                Owner: {bike.owner?.username || 'Unknown'}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                            label={bike.sold ? 'SOLD' : 'Available'}
                            color={bike.sold ? 'error' : 'success'}
                            size="small"
                            icon={bike.sold ? <CancelIcon /> : <CheckIcon />}
                        />
                        {!bike.sold && (
                            <Button
                                variant="contained"
                                size="small"
                                color="error"
                                onClick={() => { setSelectedBike(bike); setConfirmOpen(true); }}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600
                                }}
                            >
                                Mark Sold
                            </Button>
                        )}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                        Loading Royal Dashboard...
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            pb: 4
        }}>
            <Container maxWidth="xl" sx={{ pt: 4 }}>
                {/* Header */}
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                        <AdminIcon sx={{ fontSize: 48, color: 'white', mr: 2 }} />
                        <Typography variant="h3" sx={{
                            fontWeight: 'bold',
                            color: 'white',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                            fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' }
                        }}>
                            Royal Admin Dashboard
                        </Typography>
                    </Box>
                    <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: { xs: '0.9rem', md: '1.25rem' } }}>
                        Manage your bike marketplace with royal precision
                    </Typography>
                </Box>

                {/* Stats Overview */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard
                            title="Total Sales"
                            value={stats.totalSales || 0}
                            icon={<MoneyIcon />}
                            color={royalColors.success}
                            subtitle="Revenue"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard
                            title="Total Users"
                            value={stats.totalUsers || 0}
                            icon={<PeopleIcon />}
                            color={royalColors.primary}
                            subtitle="Registered"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard
                            title="Total Bikes"
                            value={bikes.length}
                            icon={<BikeIcon />}
                            color={royalColors.info}
                            subtitle="Listed"
                        />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <StatsCard
                            title="Growth"
                            value="+12.5%"
                            icon={<TrendingUpIcon />}
                            color={royalColors.warning}
                            subtitle="This Month"
                        />
                    </Grid>
                </Grid>

                {/* Main Content */}
                <Grid container spacing={3}>
                    {/* Users Section */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <PeopleIcon sx={{ color: royalColors.primary, mr: 2, fontSize: 28 }} />
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: royalColors.text }}>
                                        Registered Users
                                    </Typography>
                                    <Chip
                                        label={users.length}
                                        color="primary"
                                        sx={{ ml: 'auto' }}
                                    />
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                                    {users.map(user => (
                                        <UserCard key={user._id} user={user} />
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Bikes Section */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <BikeIcon sx={{ color: royalColors.info, mr: 2, fontSize: 28 }} />
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: royalColors.text }}>
                                        Bike Listings
                                    </Typography>
                                    <Chip
                                        label={bikes.length}
                                        color="info"
                                        sx={{ ml: 'auto' }}
                                    />
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                                    {bikes.map(bike => (
                                        <BikeCard key={bike._id} bike={bike} />
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Sales Chart */}
                    <Grid item xs={12}>
                        <Card sx={{
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <AssessmentIcon sx={{ color: royalColors.success, mr: 2, fontSize: 28 }} />
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: royalColors.text }}>
                                        Sales Analytics
                                    </Typography>
                                </Box>
                                <Divider sx={{ mb: 3 }} />
                                <Box sx={{ height: { xs: 300, md: 400 }, width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={salesData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                            <XAxis
                                                dataKey="month"
                                                tick={{ fill: royalColors.textSecondary, fontSize: 10 }}
                                                axisLine={{ stroke: royalColors.textSecondary }}
                                            />
                                            <YAxis
                                                allowDecimals={false}
                                                tick={{ fill: royalColors.textSecondary, fontSize: 10 }}
                                                axisLine={{ stroke: royalColors.textSecondary }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255,255,255,0.95)',
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                                    fontSize: '12px'
                                                }}
                                            />
                                            <Bar
                                                dataKey="sales"
                                                fill={royalColors.success}
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Confirmation Dialog */}
                <Dialog
                    open={confirmOpen}
                    onClose={() => setConfirmOpen(false)}
                    PaperProps={{
                        sx: {
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
                        }
                    }}
                >
                    <DialogTitle sx={{
                        background: `linear-gradient(135deg, ${royalColors.accent}15 0%, ${royalColors.accent}05 100%)`,
                        borderBottom: `1px solid ${royalColors.accent}30`
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CancelIcon sx={{ color: royalColors.accent, mr: 2 }} />
                            Mark as Sold
                        </Box>
                    </DialogTitle>
                    <DialogContent sx={{ p: 3 }}>
                        <DialogContentText sx={{ fontSize: '1.1rem' }}>
                            Are you sure you want to mark this bike as sold? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button
                            onClick={() => setConfirmOpen(false)}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="error"
                            variant="contained"
                            onClick={handleMarkAsSold}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600
                            }}
                        >
                            Mark as Sold
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Success Message */}
                {message && (
                    <Box sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        bgcolor: 'background.paper',
                        p: 3,
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                        border: `1px solid ${royalColors.success}30`,
                        background: `linear-gradient(135deg, ${royalColors.success}15 0%, ${royalColors.success}05 100%)`
                    }}>
                        <Typography sx={{ color: royalColors.success, fontWeight: 600 }}>
                            {message}
                        </Typography>
                    </Box>
                )}
            </Container>
        </Box>
    );
}

export default AdminDashboard; 