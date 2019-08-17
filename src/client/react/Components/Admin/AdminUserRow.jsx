import React, {useState, useEffect} from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, FormControlLabel, Checkbox,
  FormHelperText, CircularProgress, TextField, withMobileDialog } from '@material-ui/core';

export default function AdminUserRow(props) {
  const [deletionDialogOpen, setDeletionDialogOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => setEmail(""), [deletionDialogOpen]);
  useEffect(() => setPassword(""), [loginDialogOpen]);

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
      alert('Error logging', error.message);
      window.location = '/';
      return;
    }
    await props.api.swapPasswords(props.user.id);
    window.location = '/';
  };

  const deleteAccount = async (event) => {
    if (event) event.preventDefault();
    if (email != props.user.email) return;

    try {
      await props.api.deleteAccount(props.user.id);
    } catch(error) {
      console.log(error);
      alert(error);
    }
    
    setDeletionDialogOpen(false);
    props.onChange();
  }

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
              <Button color="secondary" onClick={() => setDeletionDialogOpen(true)}>Delete Account</Button>
              <Button style={{paddingLeft: 8}} color="secondary" onClick={() => setLoginDialogOpen(true)}>Log in as this user</Button>
            </div>
          }
        </td>

        <Dialog
          open={deletionDialogOpen}
          fullScreen={false}
          onClose={() => setDeletionDialogOpen(false)}
        >
          <form onSubmit={deleteAccount}>
            <DialogTitle id="deletion-warning">Are you sure you want to delete {props.user.email}'s Account?</DialogTitle>
            <DialogContent>
                <TextField
                  autoFocus
                  label="Enter the email address again, just to be sure..."
                  fullWidth
                  onChange={event => setEmail(event.target.value)}
                />
            </DialogContent>
            <DialogActions style={{justifyContent: 'flex-end'}}>
              <Button onClick={() => setDeletionDialogOpen(false)} color="primary">
                Cancel
              </Button>
              <Button type="submit" color="primary" disabled={email != props.user.email}>
                Delete Account
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog
          open={loginDialogOpen}
          fullScreen={false}
          onClose={() => setLoginDialogOpen(false)}
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
              <Button onClick={() => setLoginDialogOpen(false)} color="primary">
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
