import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Stack } from '@mui/material';
import {
  Container, Typography, Table, TableBody,
  TableCell, TableHead, TableRow, TextField, Chip
} from '@mui/material';

function App() {
  const [accounts, setAccounts] = useState([]);
  const [newAccount, setNewAccount] = useState({ email: '', password: '' });
  const [warmupStatus, setWarmupStatus] = useState(true);
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [newReceiver, setNewReceiver] = useState('');
  const [receivers, setReceivers] = useState([]);

  useEffect(() => {
  fetchWarmupStatus();
  fetchAccounts();
  fetchLogs(); // initial fetch

  const interval = setInterval(() => {
    fetchLogs(); // fetch every 10 seconds
  }, 10000); // 10000ms = 10 seconds

  return () => clearInterval(interval); // cleanup on unmount
}, []);
  const fetchWarmupStatus = async () => {
  const res = await axios.get('http://localhost:5000/warmup-status');
  setWarmupStatus(res.data.enabled);
};

  const fetchLogs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/logs');
      setLogs(res.data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };
  const fetchReceivers = async () => {
  const res = await axios.get('http://localhost:5000/receivers');
  setReceivers(res.data);
};

const addReceiver = async () => {
  if (!newReceiver) return;
  await axios.post('http://localhost:5000/receivers', { email: newReceiver });
  setNewReceiver('');
  fetchReceivers();
};
  const filteredLogs = logs.filter(log =>
    log.sender.toLowerCase().includes(search.toLowerCase()) ||
    log.receiver.toLowerCase().includes(search.toLowerCase())
  );
   
  
const toggleWarmup = async () => {
  const res = await axios.post('http://localhost:5000/toggle-warmup');
  setWarmupStatus(res.data.enabled);
};

const fetchAccounts = async () => {
  const res = await axios.get('http://localhost:5000/accounts');
  setAccounts(res.data);
};

const addAccount = async () => {
  if (!newAccount.email || !newAccount.password) return;
  await axios.post('http://localhost:5000/accounts', newAccount);
  setNewAccount({ email: '', password: '' });
  fetchAccounts();
};

  return (
    <Container style={{ marginTop: '40px' }}>
      <Typography variant="h4" gutterBottom>Email Warm-Up Logs</Typography>

      <TextField
        label="Search by sender or receiver"
        variant="outlined"
        fullWidth
        margin="normal"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Typography variant="caption" color="textSecondary">
  Logs auto-refresh every 10 seconds.
</Typography>
  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
      <Typography variant="h6">
        Warm-Up Scheduler: {warmupStatus ? '🟢 ON' : '🔴 OFF'}
      </Typography>
      <Button variant="contained" onClick={toggleWarmup}>
        {warmupStatus ? 'Pause Warm-Up' : 'Resume Warm-Up'}
      </Button>
    </Stack>
    <Typography variant="h5" gutterBottom>Add Warm-Up Email Account</Typography>
<Stack direction="row" spacing={2} mb={2}>
  <TextField
    label="Email"
    value={newAccount.email}
    onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
  />
  <TextField
    label="Password"
    type="password"
    value={newAccount.password}
    onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
  />
  <Button variant="contained" onClick={addAccount}>Add</Button>
</Stack>
<Typography variant="h6" mt={4}>Add Receiver Email</Typography>
<Stack direction="row" spacing={2} mb={2}>
  <TextField
    label="Receiver Email"
    value={newReceiver}
    onChange={(e) => setNewReceiver(e.target.value)}
  />
  <Button variant="contained" onClick={addReceiver}>Add Receiver</Button>
</Stack>

<Typography variant="h6">Saved Receivers:</Typography>
<ul>
  {receivers.map((r) => (
    <li key={r.id}>{r.email}</li>
  ))}
</ul>


<Typography variant="h6">Saved Email Accounts:</Typography>
<Table size="small">
  <TableHead>
    <TableRow>
      <TableCell>Email</TableCell>
      <TableCell>Password</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {accounts.map((acc) => (
      <TableRow key={acc.id}>
        <TableCell>{acc.email}</TableCell>
        <TableCell>••••••••</TableCell> {/* Hide for now */}
      </TableRow>
    ))}
  </TableBody>
</Table>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Sender</TableCell>
            <TableCell>Receiver</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Timestamp</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredLogs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{log.sender}</TableCell>
              <TableCell>{log.receiver}</TableCell>
              <TableCell>
                <Chip
                  label={log.status}
                  color={log.status === 'replied' ? 'success' : 'primary'}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
              <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}

export default App;
