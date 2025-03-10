import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers, makeAdmin } from "../../../slices/authSlice";
import { RootState, AppDispatch } from "../../../redux/store";
import { DashboardContent } from "../../../layouts/dashboard";
import { Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, Typography } from "@mui/material";
import { useSnackbar } from "notistack";

export function UserView() {
  const dispatch = useDispatch<AppDispatch>();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);
  const { users, loading, error } = useSelector((state: RootState) => state.auth);

  const handleMakeAdmin = (userId: string) => {
    dispatch(makeAdmin(userId))
    .unwrap()
    .then(() => {
      enqueueSnackbar("User promoted to Admin successfully!", { variant: "success" });
      dispatch(getAllUsers()); 
    })
    .catch((err) => {
      enqueueSnackbar(err || "Failed to promote user", { variant: "error" });
    });
  };

  return (
    
     <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4">Users</Typography>
      </Box>

      <Card>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box p={3}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : users && users.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Admin</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.isAdmin ? "✅ Yes" : "❌ No"}</TableCell>
                    <TableCell>
                      {!user.isAdmin && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleMakeAdmin(user._id)}
                        >
                          Make Admin
                        </Button>
                      )}
                      {user.isAdmin && (
                        <div>
                          Admin
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box p={3}>
            <Typography>No users found.</Typography>
          </Box>
        )}
      </Card>
     </DashboardContent>
  );
}