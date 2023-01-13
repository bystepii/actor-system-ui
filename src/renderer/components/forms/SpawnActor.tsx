import {
  FormGroup,
  TextField,
  Button,
  Collapse,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  List,
  IconButton,
  ListItem,
  ListItemText,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';

import { FormEvent, useContext, useEffect, useState } from 'react';
import { Status } from '@/lib/types';
import { ApiContext } from '@/lib/globals';
import ExpandMore from '../ExpandMore';
import StateSwitch from './StateSwitch';

type Event = {
  timestamp: number;
  status: Status;
  error?: Error;
  actorName: string;
  actorClass: string;
};

type LogItemProps = {
  event: Event;
  onClick?: () => void;
};

function LogItem({
  event: { timestamp, status, error, actorName, actorClass },
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
            onIdle="Spawn an actor"
            onSuccess={`Successfully spawned actor '${actorName}' of class '${actorClass}'`}
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

export default function SpawnActorForm() {
  const [formState, setFormState] = useState({
    actorName: '',
    actorClass: '',
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
            setEventLog((prevEventLog) => {
              return prevEventLog.filter(
                (e) => e.timestamp !== event.timestamp
              );
            });
          }}
        />
      );
    });
  };

  useEffect(() => {
    const { actorName, actorClass } = formState;
    if (!actorName || !actorClass || status === 'pending') return;
    setExpanded(true);
    setStatus('pending');
    api
      .spawnActor(actorName, actorClass)
      .then(() => {
        setStatus('resolved');
        return undefined;
      })
      .catch((err: Error) => {
        setStatus('rejected');
        return setError(err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]);

  useEffect(() => {
    const { actorName, actorClass } = formState;
    if (status === 'resolved' || status === 'rejected')
      setEventLog((prevEventLog) => [
        {
          timestamp: Date.now(),
          status,
          error,
          actorName,
          actorClass,
        },
        ...prevEventLog,
      ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateFormState('actorName', event.currentTarget.actorName.value);
    updateFormState('actorClass', event.currentTarget.actorClass.value);
  }

  return (
    <Card sx={{ maxWidth: 400, minWidth: 200 }}>
      <CardHeader title="Spawn an Actor" />
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
            <TextField
              type="text"
              id="actorClass"
              name="actorClass"
              label="Actor Class"
              required
            />
          </FormGroup>
        </CardContent>
        <CardActions disableSpacing>
          <Button type="submit" startIcon={<PlayArrowIcon />}>
            Spawn Actor
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
                actorName: formState.actorName,
                actorClass: formState.actorClass,
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
