import {
  Alert,
  Box,
  CircularProgress,
  List,
  ListItem,
  Typography,
  Button,
  Divider,
  Card,
  CardHeader,
  CardActions,
  CardContent,
  Collapse,
  ListItemText,
  ListSubheader,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

import { useState, useRef, useContext, useEffect, useCallback } from 'react';

import { ApiContext } from '@/lib/globals';
import { Status } from '@/lib/types';

import ExpandMore from '../ExpandMore';
import StateSwitch from './StateSwitch';

export default function ListActors() {
  const [isSending, setIsSending] = useState(false);
  const isMounted = useRef(true);

  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<string[]>([]);
  const [error, setError] = useState<Error>();

  const api = useContext(ApiContext);

  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // set isMounted to false when we unmount the component
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const sendRequest = useCallback(async () => {
    // don't send again while we are sending
    if (isSending) return;

    // update state
    setIsSending(true);
    setStatus('pending');

    api
      .getNames()
      .then((res: string[]) => {
        setStatus('resolved');
        setResult(res);
        return result;
      })
      .catch((err: Error) => {
        setStatus('rejected');
        setError(err);
      });

    // once the request is sent, update state again
    // if (isMounted.current) // only update if we are still mounted
    setIsSending(false);

    setExpanded(true);
  }, [api, isSending, result]); // update the callback if the state changes

  return (
    <Card sx={{ minWidth: 200 }}>
      <CardHeader title="List Actors" />
      <CardActions disableSpacing>
        <Button
          type="button"
          disabled={isSending}
          onClick={sendRequest}
          startIcon={<FormatListBulletedIcon />}
        >
          List Actors
        </Button>
        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <StateSwitch
          status={status}
          error={error}
          onIdle="Click the button to list actors"
          onSuccess={
            <List
              dense
              subheader={
                result.length === 0 ? 'No actors found' : 'List of Actors:'
              }
            >
              {result.map((actorName) => (
                <ListItem key={actorName}>
                  <ListItemText primary={actorName} />
                </ListItem>
              ))}
            </List>
          }
        />
      </Collapse>
    </Card>
  );
}
