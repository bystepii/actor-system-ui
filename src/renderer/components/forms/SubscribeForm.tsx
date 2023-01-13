import {
  FormGroup,
  FormLabel,
  List,
  ListItem,
  FormControlLabel,
  Checkbox,
  TextField,
  Button,
  Divider,
  Alert,
  Box,
  CircularProgress,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Collapse,
  IconButton,
  ListItemText,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';

import React, { useState, FormEvent, useContext, useEffect } from 'react';
import { ApiContext } from '@/lib/globals';

import {
  ActorEvent,
  ActorEventType,
  ActorEventTypeStrings,
  Status,
} from '@/lib/types';
import ExpandMore from '../ExpandMore';
import StateSwitch from './StateSwitch';

type Event = {
  timestamp: number;
  status: Status;
  error?: Error;
  eventType: 'subscribe' | 'event';
  subscriptionId?: number;
  events: ActorEventTypeStrings[];
  actorNames: string[];
  event?: ActorEvent;
};

type LogItemProps = {
  event: Event;
  onClick?: () => void;
};

function LogItem({
  event: {
    timestamp,
    status,
    error,
    eventType,
    subscriptionId,
    events,
    actorNames,
    event,
  },
  onClick,
}: LogItemProps) {
  const switchType = (type: 'subscribe' | 'unsubscribe' | 'event') => {
    switch (type) {
      case 'subscribe': {
        return (
          <StateSwitch
            status={status}
            error={error}
            onIdle="Subscribe to events"
            onSuccess={`Successfully subscribed to events '${events.join(
              ', '
            )}' for ${
              actorNames.length > 0
                ? `actors '${actorNames.join(', ')}'`
                : 'all actors'
            } with subscription id '${subscriptionId}'`}
            onClose={onClick}
          />
        );
      }
      case 'event': {
        if (event === undefined) return null;
        return (
          <StateSwitch
            status="idle"
            onIdle={`Received event '${event.eventType}' from actor '${
              event.source
            }' ${
              event.message
                ? `with ${
                    event.message.body === ''
                      ? 'empty message'
                      : `message '${event.message.body}'`
                  } of type '${event.messageClass ?? ''}' from '${
                    event.message.senderName
                  }'`
                : ''
            }`}
            onClose={onClick}
          />
        );
      }
      default: {
        return null;
      }
    }
  };

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
      {switchType(eventType)}
    </ListItem>
  );
}

LogItem.defaultProps = {
  onClick: null,
};

export default function SubcribeForm() {
  // const [checkedEventsState, setCheckedEventsState] = useState<boolean[]>(
  //   new Array(Object.keys(ActorEventType).length).fill(false)
  // );

  // const [actorNames, setActorNames] = useState<string[]>([]);

  const [formState, setFormState] = useState({
    checkedEvents: new Array(Object.keys(ActorEventType).length).fill(
      false
    ) as boolean[],
    actorNames: [] as string[],
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

  function getEvents(checkedEvents: boolean[]) {
    return Object.keys(ActorEventType).filter((_, index) => {
      return checkedEvents[index];
    }) as ActorEventTypeStrings[];
  }

  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<Error>();

  const [subscriptionId, setSubscriptionId] = useState<number>();

  const [expanded, setExpanded] = useState(false);
  const api = useContext(ApiContext);

  const [eventLog, setEventLog] = useState<Event[]>([]);

  const getLog = (events: Event[]) => {
    return events.map((event) => {
      return (
        <LogItem
          key={event.timestamp + event.eventType}
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

  function eventCallback(event: ActorEvent) {
    setEventLog((prevEventLog) => [
      {
        timestamp: Date.now(),
        status,
        eventType: 'event',
        events: getEvents(formState.checkedEvents),
        actorNames: formState.actorNames,
        event,
      },
      ...prevEventLog,
    ]);
  }

  useEffect(() => {
    const { checkedEvents, actorNames } = formState;
    const events = getEvents(checkedEvents);

    if (
      !events ||
      !actorNames ||
      events.length === 0 ||
      actorNames.length === 0 ||
      status === 'pending'
    )
      return undefined;

    setExpanded(true);
    setStatus('pending');

    api
      .subscribe(events, actorNames, eventCallback)
      .then((result: number) => {
        setStatus('resolved');
        setSubscriptionId(result);
        return undefined;
      })
      .catch((err: Error) => {
        setStatus('rejected');
        setError(err);
      });
    return () => {
      if (subscriptionId !== undefined) api.unsubscribe(subscriptionId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]);

  useEffect(() => {
    const { checkedEvents, actorNames } = formState;
    if (status === 'resolved' || status === 'rejected')
      setEventLog((prevEventLog) => [
        {
          timestamp: Date.now(),
          status,
          eventType: 'subscribe',
          subscriptionId,
          events: getEvents(checkedEvents),
          actorNames,
        },
        ...prevEventLog,
      ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateFormState(
      'actorNames',
      event.currentTarget.actorNames.value
        .split(',')
        .map((name: string) => name.trim())
    );
    updateFormState(
      'checkedEvents',
      Object.keys(ActorEventType).map((eventType: string) => {
        return event.currentTarget[eventType].checked;
      }) as boolean[]
    );
  }

  return (
    <Card sx={{ maxWidth: 400, minWidth: 200 }}>
      <CardHeader title="Subscribe to Actor Events" />
      <form onSubmit={handleSubmit}>
        <CardContent>
          <FormGroup sx={{ mb: 2 }}>
            <FormLabel>Event Types:</FormLabel>
            <List dense>
              {Object.keys(ActorEventType).map((eventType: string) => (
                <ListItem key={eventType}>
                  <FormControlLabel
                    control={<Checkbox id={eventType} name={eventType} />}
                    label={eventType}
                  />
                </ListItem>
              ))}
            </List>
          </FormGroup>
          <FormGroup sx={{ mb: 2 }}>
            <TextField
              type="text"
              id="actorNames"
              name="actorNames"
              label="Actor Names (comma separated)"
            />
          </FormGroup>
        </CardContent>
        <CardActions disableSpacing>
          <Button type="submit">Subscribe</Button>
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
                eventType: 'subscribe',
                subscriptionId,
                events: getEvents(formState.checkedEvents),
                actorNames: formState.actorNames,
              }}
            />
          ) : null}
          {getLog(
            eventLog[0]?.status === 'resolved' || eventLog[0]?.status === 'idle'
              ? eventLog
              : eventLog.slice(1)
          )}
        </List>
      </Collapse>
    </Card>
  );
}
