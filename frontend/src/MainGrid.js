import React from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";

const MainGrid = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Users</Typography>
            <Typography variant="h4">14k</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Sessions</Typography>
            <Typography variant="h4">13,277</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Revenue</Typography>
            <Typography variant="h4">$34,500</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default MainGrid;
