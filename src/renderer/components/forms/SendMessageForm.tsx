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
  ListItem,
  IconButton,
  ListItemText,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SendIcon from '@mui/icons-material/Send';
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
  messageArgs: any[];
  messageClass?: string;
};

type LogItemProps = {
  event: Event;
  onClick?: () => void;
};

function LogItem({
  event: { timestamp, status, error, actorName, messageArgs, messageClass },
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
            onIdle="Send a message to an Actor"
            onSuccess={`Successfully sent message to '${actorName}' with body '${messageArgs}' and class '${messageClass}'`}
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

export default function SendMessageForm() {
  // const [actorName, setActorName] = useState('');
  // const [messageArgs, setmessageArgs] = useState('');
  // const [messageClass, setMessageClass] = useState<string>();

  const [formState, setFormState] = useState({
    actorName: '',
    messageArgs: [] as any[],
    messageClass: undefined,
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

  const [expanded, setExpanded] = useState(false);

  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<Error>();

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
    const { actorName, messageArgs, messageClass } = formState;
    if (
      !actorName ||
      (!messageArgs && !messageClass) ||
      (messageArgs.length === 0 && messageClass === '') ||
      status === 'pending'
    )
      return;
    setExpanded(true);
    setStatus('pending');

    let msgArgs = messageArgs;
    let msgClass = messageClass;

    if (msgClass === '') {
      msgClass = undefined;
      if (msgArgs.length === 1) [msgArgs] = msgArgs;
      else {
        setStatus('rejected');
        setError(
          new Error(
            'Message class must be specified if multiple arguments are provided'
          )
        );
        return;
      }
    }

    api
      .send(actorName, msgArgs, msgClass)
      .then(() => {
        return setStatus('resolved');
      })
      .catch((err: Error) => {
        setStatus('rejected');
        setError(err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]);

  useEffect(() => {
    const { actorName, messageArgs, messageClass } = formState;
    if (status === 'resolved' || status === 'rejected')
      setEventLog([
        {
          timestamp: Date.now(),
          status,
          error,
          actorName,
          messageArgs,
          messageClass,
        },
        ...eventLog,
      ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateFormState('actorName', event.currentTarget.actorName.value);
    updateFormState(
      'messageArgs',
      (event.currentTarget.messageArgs.value as string)
        .split(',')
        .map((arg: string) => arg.trim())
        .filter((arg: string) => arg !== '')
        .map((arg: string) => {
          if (!Number.isNaN(Number(arg))) return Number(arg);
          return arg;
        })
    );
    updateFormState('messageClass', event.currentTarget.messageClass.value);
  }

  return (
    <Card sx={{ maxWidth: 400, minWidth: 200 }}>
      <CardHeader title="Send a message to an Actor" />
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
              id="messageArgs"
              name="messageArgs"
              label="Message Arguments (sep. by commas)"
            />
          </FormGroup>
          <FormGroup sx={{ mb: 2 }}>
            <TextField
              type="text"
              id="messageClass"
              name="messageClass"
              label="Message Class"
            />
          </FormGroup>
        </CardContent>
        <CardActions disableSpacing>
          <Button type="submit" startIcon={<SendIcon />}>
            Send
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
                messageArgs: formState.messageArgs,
                messageClass: formState.messageClass,
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
