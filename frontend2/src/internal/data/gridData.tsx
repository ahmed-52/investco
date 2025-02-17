import { GridColDef } from '@mui/x-data-grid';

// Define column structure with proper type annotations
export const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90, type: 'number' },
  { field: 'name', headerName: 'Name', width: 150, type: 'string' },
  { field: 'age', headerName: 'Age', width: 100, type: 'number' },
  { field: 'email', headerName: 'Email', width: 200, type: 'string' },
  { field: 'status', headerName: 'Status', width: 120, type: 'singleSelect', valueOptions: ['Active', 'Inactive', 'Pending'] },
];

// Sample row data
export const rows = [
  { id: 1, name: 'Alice Johnson', age: 28, email: 'alice@example.com', status: 'Active' },
  { id: 2, name: 'Bob Smith', age: 35, email: 'bob@example.com', status: 'Inactive' },
  { id: 3, name: 'Charlie Brown', age: 42, email: 'charlie@example.com', status: 'Active' },
  { id: 4, name: 'David Wilson', age: 29, email: 'david@example.com', status: 'Pending' },
  { id: 5, name: 'Emma Watson', age: 31, email: 'emma@example.com', status: 'Inactive' },
  { id: 6, name: 'Frank White', age: 37, email: 'frank@example.com', status: 'Active' },
  { id: 7, name: 'Grace Lee', age: 26, email: 'grace@example.com', status: 'Active' },
  { id: 8, name: 'Henry Adams', age: 33, email: 'henry@example.com', status: 'Pending' },
  { id: 9, name: 'Isabella Davis', age: 40, email: 'isabella@example.com', status: 'Inactive' },
  { id: 10, name: 'Jack Miller', age: 36, email: 'jack@example.com', status: 'Active' },
];

  