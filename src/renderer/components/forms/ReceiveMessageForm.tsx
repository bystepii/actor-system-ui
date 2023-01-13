import {
  FormGroup,
  TextField,
  Button,
  Collapse,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Slider,
  FormLabel,
  List,
  ListItem,
  IconButton,
  ListItemText,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';

import { FormEvent, useContext, useEffect, useState } from 'react';

import { Status } from '@/lib/types';
import { ApiContext } from '@/lib/globals';
import ExpandMore from '../ExpandMore';
import StateSwitch from './StateSwitch';

type Event = {
  timestamp: number;
  status: Status;
  error?: Error;
  message: string;
  actorName: string;
  timeout: number;
};

type LogItemProps = {
  event: Event;
  onClick?: () => void;
};

function LogItem({
  event: { timestamp, status, error, message, actorName, timeout },
  onClick,
}: LogItemProps) {
  return (
    <ListItem
      disablePadding
      sx={{ display: 'list-item' }}
      // secondaryAction={
      //  onClick && (
      //    <IconButton edge="end" aria-label="delete" onClick={onClick}>
      //      <DeleteIcon />
      //    </IconButton>
      //  )
      // }
    >
      <ListItemText
        primary={
          <StateSwitch
            status={status}
            error={error}
            onIdle="Receive a message"
            onSuccess={`Successfully received '${message}' from ${actorName}`}
            onClose={onClick}
          />
        }
      />
    </ListItem>
  );
}

LogItem.defaultProps = {
  onClick: null,
};

export default function ReceiveMessageForm() {
  // const [actorName, setActorName] = useState('');
  // const [timeout, setTimeout] = useState(0);

  const [formState, setFormState] = useState({
    actorName: '',
    timeout: 0,
  });

  function updateFormState(
    key: keyof typeof formState,
    value: typeof formState[keyof typeof formState]
  ) {
    setFormState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  }

  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<Error>();

  const [message, setMessage] = useState<string>('');

  const [expanded, setExpanded] = useState(false);

  const api = useContext(ApiContext);

  const [eventLog, setEventLog] = useState<Event[]>([]);

  const getLog = (events: Event[]) => {
    return events.map((event) => {
      return (
        <LogItem
          key={event.timestamp}
          event={event}
          onClick={() => {
            setEventLog(
              eventLog.filter((e) => e.timestamp !== event.timestamp)
            );
          }}
        />
      );
    });
  };

  useEffect(() => {
    const { actorName, timeout } = formState;
    if (!actorName || status === 'pending') return;
    setExpanded(true);
    setStatus('pending');
    api
      .receive(actorName, timeout)
      .then((res) => {
        setStatus('resolved');
        setMessage(res as string);
        return undefined;
      })
      .catch((err: Error) => {
        setStatus('rejected');
        setError(err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]);

  useEffect(() => {
    const { actorName, timeout } = formState;
    if (status === 'resolved' || status === 'rejected')
      setEventLog([
        {
          timestamp: Date.now(),
          status,
          error,
          message,
          actorName,
          timeout,
        },
        ...eventLog,
      ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateFormState('actorName', event.currentTarget.actorName.value);
    updateFormState('timeout', event.currentTarget.timeout.value as number);
  }

  return (
    <Card sx={{ maxWidth: 400, minWidth: 200 }}>
      <CardHeader title="Receive a message from an actor" />
      <form onSubmit={handleSubmit}>
        <CardContent>
          <FormGroup sx={{ mb: 2 }}>
            <TextField
              type="text"
              id="actorName"
              name="actorName"
              label="Actor Name"
              required
            />
          </FormGroup>
          <FormGroup sx={{ mb: 2 }}>
            <FormLabel>Timeout (ms)</FormLabel>
            <Slider
              name="timeout"
              id="timeout"
              aria-label="Timeout"
              valueLabelDisplay="auto"
              value={100}
              min={0}
              max={1000}
            />
          </FormGroup>
        </CardContent>
        <CardActions disableSpacing>
          <Button type="submit" startIcon={<MoveToInboxIcon />}>
            Receive
          </Button>
          <ExpandMore
            expand={expanded}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        </CardActions>
      </form>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <List disablePadding>
          {status !== 'resolved' ? (
            <LogItem
              event={{
                timestamp: Date.now(),
                status,
                error,
                message,
                actorName: formState.actorName,
                timeout: formState.timeout,
              }}
            />
          ) : null}
          {getLog(
            eventLog[0]?.status === 'resolved' ? eventLog : eventLog.slice(1)
          )}
        </List>
      </Collapse>
    </Card>
  );
}
