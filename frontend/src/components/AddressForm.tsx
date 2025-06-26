import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  CircularProgress,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addressAPI } from '../services/api';

const validationSchema = yup.object({
  address: yup
    .string()
    .required('Address is required'),
  city: yup
    .string()
    .required('City is required'),
  state: yup
    .string()
    .required('State is required'),
  postal_code: yup
    .string()
    .matches(/^[0-9]{6}$/, 'Postal code must be 6 digits')
    .required('Postal code is required'),
  google_maps: yup
    .string()
    .url('Must be a valid URL'),
});

const AddressForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [existingAddress, setExistingAddress] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadExistingAddress();
  }, []);

  const loadExistingAddress = async () => {
    try {
      const address = await addressAPI.getAddress();
      if (address) {
        setExistingAddress(address);
        formik.setValues({
          address: address.address || '',
          city: address.city || '',
          state: address.state || '',
          postal_code: address.postal_code || '',
          google_maps: address.google_maps || '',
        });
      }
    } catch (error) {
      // Address not found, which is fine for new users
    }
  };

  const formik = useFormik({
    initialValues: {
      address: '',
      city: '',
      state: '',
      postal_code: '',
      google_maps: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (existingAddress) {
          await addressAPI.updateAddress(values);
          toast.success('Address updated successfully!');
        } else {
          await addressAPI.createAddress(values);
          toast.success('Address added successfully!');
        }
        navigate('/dashboard');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to save address');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {existingAddress ? 'Update Address' : 'Add Collection Address'}
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          {existingAddress 
            ? 'Update your collection address for waste pickup'
            : 'Add your address where waste collection will take place'
          }
        </Typography>

        <Paper sx={{ p: 4, mt: 3 }}>
          <Box component="form" onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="address"
                  name="address"
                  label="Address"
                  multiline
                  rows={2}
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
                  disabled={loading}
                  placeholder="Enter your complete address"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="city"
                  name="city"
                  label="City"
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  error={formik.touched.city && Boolean(formik.errors.city)}
                  helperText={formik.touched.city && formik.errors.city}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="state"
                  name="state"
                  label="State"
                  value={formik.values.state}
                  onChange={formik.handleChange}
                  error={formik.touched.state && Boolean(formik.errors.state)}
                  helperText={formik.touched.state && formik.errors.state}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="postal_code"
                  name="postal_code"
                  label="Postal Code"
                  value={formik.values.postal_code}
                  onChange={formik.handleChange}
                  error={formik.touched.postal_code && Boolean(formik.errors.postal_code)}
                  helperText={formik.touched.postal_code && formik.errors.postal_code}
                  disabled={loading}
                  inputProps={{ maxLength: 6 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="google_maps"
                  name="google_maps"
                  label="Google Maps Link (Optional)"
                  value={formik.values.google_maps}
                  onChange={formik.handleChange}
                  error={formik.touched.google_maps && Boolean(formik.errors.google_maps)}
                  helperText={formik.touched.google_maps && formik.errors.google_maps}
                  disabled={loading}
                  placeholder="https://maps.google.com/..."
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ flex: 1 }}
                  >
                    {loading ? <CircularProgress size={24} /> : (existingAddress ? 'Update Address' : 'Add Address')}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/dashboard')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AddressForm; 