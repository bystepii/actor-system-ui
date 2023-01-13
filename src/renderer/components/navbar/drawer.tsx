import {
  List,
  ListItemIcon,
  ListItemText,
  Divider,
  Drawer,
  ListItemButton,
} from '@mui/material';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import routes, { RoutesType } from '@/routes';
import { Link } from 'react-router-dom';

type DrawerProps = {
  open: boolean;
  toggleDrawerHandler: () => void;
};

const DrawerComponent = ({ open, toggleDrawerHandler }: DrawerProps) => {
  const sideList = () => (
    <div
      role="presentation"
      onClick={toggleDrawerHandler}
      onKeyDown={toggleDrawerHandler}
    >
      <List sx={{ width: 250 }}>
        {routes.map((route: RoutesType) => (
          <ListItemButton key={route.key} href={route.route}>
            <ListItemIcon>{route.icon}</ListItemIcon>
            <ListItemText primary={route.name} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
    </div>
  );

  return (
    <Drawer open={open} onClose={toggleDrawerHandler}>
      {sideList()}
    </Drawer>
  );
};

export default DrawerComponent;
