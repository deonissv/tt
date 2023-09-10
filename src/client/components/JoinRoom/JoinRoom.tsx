import * as MUI from '@mui/material';

export default () => {
  return (
    <MUI.Unstable_Grid2 container justifyContent="center">
      <MUI.Unstable_Grid2 xs={6}>
        <MUI.Box className="m-9">
          <input type="text" placeholder="Enter nickname" className="mb-3 w-full p-3 border-2 border-black rounded" />
          <MUI.Button variant="contained" color="primary" fullWidth>
            Join Room
          </MUI.Button>
        </MUI.Box>
      </MUI.Unstable_Grid2>
    </MUI.Unstable_Grid2>
  );
};
