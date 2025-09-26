import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Menu,
  MenuItem as MenuItemComponent,
} from '@mui/material';
import {
  Search,
  FilterList,
  MoreVert,
  Email,
  Person,
  School,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Students = () => {
  const { user, isStudent } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [cohortFilter, setCohortFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Verificar permisos
  if (isStudent) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          No tienes permisos para ver esta página. Solo profesores y coordinadores pueden acceder a la lista de estudiantes.
        </Alert>
      </Box>
    );
  }

  useEffect(() => {
    loadStudents();
  }, [page, rowsPerPage, cohortFilter, programFilter]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
      });

      if (cohortFilter) params.append('cohort', cohortFilter);
      if (programFilter) params.append('program', programFilter);

      const response = await axios.get(`/api/students?${params}`);
      setStudents(response.data.students || []);
      setTotalCount(response.data.pagination?.totalRecords || 0);
    } catch (err) {
      console.error('Error cargando estudiantes:', err);
      setError(err.response?.data?.message || 'Error al cargar los estudiantes');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event, student) => {
    setAnchorEl(event.currentTarget);
    setSelectedStudent(student);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedStudent(null);
  };

  const handleSendEmail = () => {
    if (selectedStudent) {
      window.open(`mailto:${selectedStudent.email}`, '_blank');
    }
    handleMenuClose();
  };

  const handleViewProfile = () => {
    if (selectedStudent) {
      // En una implementación completa, esto navegaría al perfil del estudiante
      alert(`Ver perfil de ${selectedStudent.name}`);
    }
    handleMenuClose();
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUniqueValues = (field) => {
    const values = students
      .map(student => student.metadata?.[field])
      .filter(value => value && value !== null);
    return [...new Set(values)];
  };

  if (loading && students.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Cargando estudiantes...</Typography>
      </Box>
    );
  }

  return (
    <Box className="fade-in">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Estudiantes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión y seguimiento de estudiantes de Semillero Digital
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Cohorte</InputLabel>
              <Select
                value={cohortFilter}
                onChange={(e) => setCohortFilter(e.target.value)}
                label="Cohorte"
              >
                <MenuItem value="">Todas</MenuItem>
                {getUniqueValues('cohort').map(cohort => (
                  <MenuItem key={cohort} value={cohort}>
                    Cohorte {cohort}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Programa</InputLabel>
              <Select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                label="Programa"
              >
                <MenuItem value="">Todos</MenuItem>
                {getUniqueValues('specialization').map(program => (
                  <MenuItem key={program} value={program}>
                    {program}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => {
                setCohortFilter('');
                setProgramFilter('');
                setSearchTerm('');
              }}
            >
              Limpiar Filtros
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Estudiante</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Cohorte</TableCell>
                <TableCell>Programa</TableCell>
                <TableCell>Último Acceso</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        src={student.picture} 
                        alt={student.name}
                        sx={{ width: 40, height: 40 }}
                      >
                        {student.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                          {student.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {student.id.slice(-8)}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {student.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {student.metadata?.cohort ? (
                      <Chip 
                        label={`Cohorte ${student.metadata.cohort}`}
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No asignada
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {student.metadata?.specialization || 'No especificado'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {student.lastLogin 
                        ? new Date(student.lastLogin).toLocaleDateString('es-AR')
                        : 'Nunca'
                      }
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={student.isActive ? 'Activo' : 'Inactivo'}
                      color={student.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small"
                      onClick={(e) => handleMenuOpen(e, student)}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItemComponent onClick={handleViewProfile}>
          <Person fontSize="small" sx={{ mr: 1 }} />
          Ver Perfil
        </MenuItemComponent>
        <MenuItemComponent onClick={handleSendEmail}>
          <Email fontSize="small" sx={{ mr: 1 }} />
          Enviar Email
        </MenuItemComponent>
      </Menu>

      {/* Summary */}
      {students.length > 0 && (
        <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {filteredStudents.length} de {totalCount} estudiantes
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Students;
