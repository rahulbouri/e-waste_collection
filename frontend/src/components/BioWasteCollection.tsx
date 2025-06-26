import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { orderAPI } from '../services/api';

const validationSchema = yup.object({
  contact_number: yup
    .string()
    .matches(/^[0-9]{10}$/, 'Contact number must be 10 digits')
    .required('Contact number is required'),
  bio_waste_category: yup
    .string()
    .required('Bio-waste category is required'),
  quantity: yup
    .number()
    .positive('Quantity must be positive')
    .required('Quantity is required'),
  unit: yup
    .string()
    .required('Unit is required'),
  description: yup
    .string()
    .max(500, 'Description must be less than 500 characters'),
  special_instructions: yup
    .string()
    .max(200, 'Special instructions must be less than 200 characters'),
});

const bioWasteCategories = [
  'Food Waste',
  'Garden Waste',
  'Paper Waste',
  'Wood Waste',
  'Agricultural Waste',
  'Animal Waste',
  'Other Organic Waste',
];

const units = [
  'kg',
  'liters',
  'pieces',
  'bags',
  'containers',
];

const BioWasteCollection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const navigate = useNavigate();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      setUploadedFiles(prev => [...prev, ...acceptedFiles]);
    },
  });

  const formik = useFormik({
    initialValues: {
      contact_number: '',
      bio_waste_category: '',
      quantity: '',
      unit: '',
      description: '',
      special_instructions: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await orderAPI.createBioWasteOrder({
          ...values,
          quantity: Number(values.quantity),
          images: uploadedFiles.length > 0 ? uploadedFiles : undefined,
        });
        toast.success('Bio-waste pickup scheduled successfully!');
        navigate('/dashboard');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to schedule pickup');
      } finally {
        setLoading(false);
      }
    },
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Schedule Bio-Waste Pickup
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Schedule a pickup for your organic and biodegradable waste
        </Typography>

        <Paper sx={{ p: 4, mt: 3 }}>
          <Box component="form" onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="contact_number"
                  name="contact_number"
                  label="Contact Number"
                  value={formik.values.contact_number}
                  onChange={formik.handleChange}
                  error={formik.touched.contact_number && Boolean(formik.errors.contact_number)}
                  helperText={formik.touched.contact_number && formik.errors.contact_number}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="bio-waste-category-label">Bio-Waste Category</InputLabel>
                  <Select
                    labelId="bio-waste-category-label"
                    id="bio_waste_category"
                    name="bio_waste_category"
                    value={formik.values.bio_waste_category}
                    onChange={formik.handleChange}
                    error={formik.touched.bio_waste_category && Boolean(formik.errors.bio_waste_category)}
                    disabled={loading}
                  >
                    {bioWasteCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="quantity"
                  name="quantity"
                  label="Quantity"
                  type="number"
                  value={formik.values.quantity}
                  onChange={formik.handleChange}
                  error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                  helperText={formik.touched.quantity && formik.errors.quantity}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="unit-label">Unit</InputLabel>
                  <Select
                    labelId="unit-label"
                    id="unit"
                    name="unit"
                    value={formik.values.unit}
                    onChange={formik.handleChange}
                    error={formik.touched.unit && Boolean(formik.errors.unit)}
                    disabled={loading}
                  >
                    {units.map((unit) => (
                      <MenuItem key={unit} value={unit}>
                        {unit}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Description"
                  multiline
                  rows={3}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="special_instructions"
                  name="special_instructions"
                  label="Special Instructions"
                  multiline
                  rows={2}
                  value={formik.values.special_instructions}
                  onChange={formik.handleChange}
                  error={formik.touched.special_instructions && Boolean(formik.errors.special_instructions)}
                  helperText={formik.touched.special_instructions && formik.errors.special_instructions}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Upload Images (Optional)
                </Typography>
                <Box
                  {...getRootProps()}
                  sx={{
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <Typography>Drop the files here...</Typography>
                  ) : (
                    <Typography>
                      Drag & drop images here, or click to select files
                    </Typography>
                  )}
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Maximum 5 files, 5MB each
                  </Typography>
                </Box>

                {uploadedFiles.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Uploaded Files:
                    </Typography>
                    {uploadedFiles.map((file, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 1,
                          border: '1px solid #ddd',
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2">{file.name}</Typography>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => removeFile(index)}
                          disabled={loading}
                        >
                          Remove
                        </Button>
                      </Box>
                    ))}
                  </Box>
                )}
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
                    {loading ? <CircularProgress size={24} /> : 'Schedule Pickup'}
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

export default BioWasteCollection; 