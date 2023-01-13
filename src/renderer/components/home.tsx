import {
  Alert,
  Badge,
  Box,
  Card,
  CardHeader,
  Container,
  Paper,
  Rating,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Grid from '@mui/system/Unstable_Grid';

import SendIcon from '@mui/icons-material/Send';
import MailIcon from '@mui/icons-material/Mail';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';

import { useContext, useEffect, useState } from 'react';

import { ApiContext } from '@/lib/globals';
import { ActorProxy, RemoteActorProxy } from '@/lib/RemoteActorProxy';
import { assert } from 'console';
import { ActorEvent } from '@/lib/types';
import ReceiveMessageForm from './forms/ReceiveMessageForm';
import SendMessageForm from './forms/SendMessageForm';
import SpawnActorForm from './forms/SpawnActor';
import SubcribeForm from './forms/SubscribeForm';

type ActorData = {
  proxy: ActorProxy;
  messagesSent: number;
  messagesReceived: number;
  messagesProcessed: number;
};

function List() {
  const api = useContext(ApiContext);

  const [error, setError] = useState<Error>();

  const [subscriptionId, setSubscriptionId] = useState<number>();

  const [actorNames, setActorNames] = useState<Set<string>>(new Set());
  const [actorData, setActorData] = useState<Map<string, ActorData>>(new Map());

  useEffect(() => {
    api
      .getNames()
      .then((names) => {
        setActorNames(new Set(names));
        return undefined;
      })
      .catch((err) => {
        setError(err);
      });

    api
      .subscribe(['CREATED', 'STOPPED', 'ABORTED'], [], (event) => {
        switch (event.eventType) {
          case 'CREATED':
            setActorNames((prev) => {
              const copy = new Set(prev);
              copy.add(event.source);
              return copy;
            });
            break;
          case 'STOPPED':
          case 'ABORTED':
            setActorNames((prev) => {
              const copy = new Set(prev);
              copy.delete(event.source);
              return copy;
            });
            break;
          default:
            break;
        }
      })
      .then((id: number) => {
        setSubscriptionId(id);
        return undefined;
      })
      .catch((err) => {
        setError(err);
      });
    return () => {
      if (subscriptionId) {
        api
          .unsubscribe(subscriptionId)
          .then(() => {
            setSubscriptionId(undefined);
            return undefined;
          })
          .catch((err) => {
            setError(err);
          });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMessageEvent(event: ActorEvent) {
    setActorData((prev) => {
      const copy = new Map(prev);
      const actor = copy.get(event.source);
      if (actor) {
        switch (event.eventType) {
          case 'MESSAGE_SENT':
            actor.messagesSent += 1;
            break;
          case 'MESSAGE_RECEIVED':
            actor.messagesReceived += 1;
            break;
          case 'MESSAGE_PROCESSED':
            actor.messagesProcessed += 1;
            break;
          default:
            break;
        }
        copy.set(event.source, actor);
      }
      return copy;
    });
  }

  useEffect(() => {
    setActorData((prev) => {
      const copy = new Map(prev);
      actorNames.forEach(async (name) => {
        const existentData = copy.get(name);
        const actor =
          existentData !== undefined
            ? existentData
            : {
                proxy: new RemoteActorProxy(name, api),
                messagesSent: 0,
                messagesReceived: 0,
                messagesProcessed: 0,
              };
        copy.set(name, actor);
        try {
          await actor.proxy.removeAllEventListeners();
          await actor.proxy.addEventListener(
            ['MESSAGE_SENT', 'MESSAGE_RECEIVED', 'MESSAGE_PROCESSED'],
            handleMessageEvent
          );
        } catch (err) {
          setError(err as Error);
        }
      });
      return copy;
    });
    return () => {
      actorData.forEach(async (actor) => {
        try {
          await actor.proxy.removeAllEventListeners();
        } catch (err) {
          setError(err as Error);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actorNames]);

  return (
    <Card sx={{ minWidth: 200 }}>
      <CardHeader title="List of Actors" />
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Actor Name</TableCell>
              <TableCell align="right">Sent messages</TableCell>
              <TableCell align="right">Received messsages</TableCell>
              <TableCell align="right">Processed messages</TableCell>
              <TableCell align="right">Queued messages</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from(actorData).map(([key, actor]) => (
              <TableRow
                key={key}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {key}
                </TableCell>
                <TableCell align="center">
                  <Badge
                    badgeContent={actor.messagesSent}
                    max={10000}
                    showZero
                    color="primary"
                  >
                    <SendIcon />
                  </Badge>
                </TableCell>
                <TableCell align="center">
                  <Badge
                    badgeContent={actor.messagesReceived}
                    max={10000}
                    showZero
                    color="success"
                  >
                    <MailIcon />
                  </Badge>
                </TableCell>
                <TableCell align="center">
                  <Badge
                    badgeContent={actor.messagesProcessed}
                    max={10000}
                    showZero
                    color="secondary"
                  >
                    <MarkEmailReadIcon />
                  </Badge>
                </TableCell>
                <TableCell align="center">
                  <Rating
                    readOnly
                    value={actor.messagesReceived - actor.messagesProcessed}
                    icon={<MailIcon />}
                    emptyIcon={<MailOutlineIcon />}
                    max={10}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {error && <Alert severity="error">{error.message}</Alert>}
    </Card>
  );
}

export default function Home() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      mt={4}
      mb={4}
    >
      <Container maxWidth="lg">
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
          justifyContent="center"
          justifyItems="center"
        >
          <Grid xs={4} alignItems="center" justifyContent="center">
            <SpawnActorForm />
          </Grid>
          <Grid xs={4}>
            <SendMessageForm />
          </Grid>
          <Grid xs={4}>
            <ReceiveMessageForm />
          </Grid>
          {/* <Grid xs={3}>
            <ListActors />
          </Grid> */}
          <Grid xs={8}>
            <List />
          </Grid>
          <Grid xs={4}>
            <SubcribeForm />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
