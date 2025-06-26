import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Eco as EcoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userAPI, addressAPI, orderAPI } from '../services/api';
import { User, Address, Order } from '../types';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [userData, addressData, ordersData] = await Promise.all([
        userAPI.getProfile(),
        addressAPI.getAddress(),
        orderAPI.getOrders(),
      ]);
      
      setUser(userData);
      setAddress(addressData);
      setOrders(ordersData);
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.name || user?.email}!
        </Typography>

        {/* Address Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Collection Address
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => navigate('/address-form')}
            >
              {address ? 'Update Address' : 'Add Address'}
            </Button>
          </Box>
          
          {address ? (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body1" gutterBottom>
                  {address.address}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {address.city}, {address.state} {address.postal_code}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Alert severity="info">
              Please add your collection address to schedule pickups.
            </Alert>
          )}
        </Paper>

        {/* Quick Actions */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<ScheduleIcon />}
                onClick={() => navigate('/schedule-pickup')}
                disabled={!address}
                sx={{ py: 2 }}
              >
                Schedule E-Waste Pickup
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<EcoIcon />}
                onClick={() => navigate('/biowaste-collection')}
                disabled={!address}
                sx={{ py: 2 }}
                color="secondary"
              >
                Schedule Bio-Waste Pickup
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Recent Orders */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Orders
          </Typography>
          {orders.length > 0 ? (
            <Grid container spacing={2}>
              {orders.slice(0, 5).map((order) => (
                <Grid item xs={12} key={order.order_id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="h6">
                            Order #{order.order_id}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {new Date(order.date).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2">
                            Contact: {order.contact_number}
                          </Typography>
                          {order.description && (
                            <Typography variant="body2" color="textSecondary">
                              {order.description}
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          label={order.waste_type}
                          color={order.waste_type === 'e-waste' ? 'primary' : 'secondary'}
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">
              No orders yet. Schedule your first pickup!
            </Alert>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard; 