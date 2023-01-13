import { Status } from '@/lib/types';
import { Alert, Box, CircularProgress } from '@mui/material';

type StateSwitchProps = {
  status: Status;
  error?: Error;
  onIdle: React.ReactNode;
  onSuccess?: React.ReactNode;
  onClose?: () => void;
};

export default function StateSwitch({
  status,
  error,
  onIdle,
  onSuccess,
  onClose,
}: StateSwitchProps) {
  switch (status) {
    case 'idle': {
      return (
        <Alert severity="info" sx={{ borderRadius: 0 }} onClose={onClose}>
          {onIdle}
        </Alert>
      );
    }
    case 'rejected': {
      return (
        <Alert severity="error" sx={{ borderRadius: 0 }} onClose={onClose}>
          Error: {error?.message}
        </Alert>
      );
    }
    case 'pending': {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      );
    }
    case 'resolved': {
      return (
        <Alert severity="success" sx={{ borderRadius: 0 }} onClose={onClose}>
          {onSuccess || 'Success'}
        </Alert>
      );
    }
    default: {
      return (
        <Alert severity="error" sx={{ borderRadius: 0 }} onClose={onClose}>
          Unknown status: {status}
        </Alert>
      );
    }
  }
}

StateSwitch.defaultProps = {
  error: null,
  onSuccess: null,
  onClose: null,
};
