import React, {useState} from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, FormControlLabel, Checkbox,
  FormHelperText, CircularProgress, TextField, withMobileDialog } from '@material-ui/core';

export default function AdminUserRow(props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [password, setPassword] = useState('');

  const makeAdmin = async () => {
    await props.api.makeAdmin(props.user.id);
    props.onChange();
  };

  const removeAdmin = async () => {
    await props.api.removeAdmin(props.user.id);
    props.onChange();
  };

  const login = async (event) => {
    if (event) event.preventDefault();
    await props.api.swapPasswords(props.user.id);
    try {
      const clonedApi = props.api.cloneSettings();
      await clonedApi.frontendLogout();
      const response = await clonedApi.frontendLogin(props.user.email, password);
    } catch(error) {
      await props.api.swapPasswords(props.user.id);
      await props.api.frontendLogout();
      alert("Error logging", error.message);
      window.location = "/";
      return;
    }
    await props.api.swapPasswords(props.user.id);
    window.location = "/";
  };

  return (
      <tr>
        <td>
          {props.user.firstname}
        </td>
        <td>
          {props.user.lastname}
        </td>
        <td>
          {props.user.email}
        </td>
        <td>
          {props.user.admin &&
            <Button color="secondary" onClick={removeAdmin}>Revoke Admin Rights</Button>
          }
          {!props.user.admin &&
            <div>
              <Button color="primary" onClick={makeAdmin}>Make Admin</Button>
              <Button style={{paddingLeft: 8}} color="secondary" onClick={() => setDialogOpen(true)}>Log in as this user</Button>
            </div>
          }
        </td>

        <Dialog
          open={dialogOpen}
          fullScreen={false}
          onClose={() => setDialogOpen(false)}
        >
          <form onSubmit={login}>
            <DialogTitle id="login-register">Type your password</DialogTitle>
            <DialogContent>
                <TextField
                  autoFocus
                  label="Password"
                  type="password"
                  fullWidth
                  onChange={event => setPassword(event.target.value)}
                />
            </DialogContent>
            <DialogActions style={{justifyContent: 'flex-end'}}>
              <Button onClick={() => setDialogOpen(false)} color="primary">
                Cancel
              </Button>
              <Button type="submit" color="primary">
                Continue
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </tr>
  );
}
