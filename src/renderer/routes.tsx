import HomeIcon from '@mui/icons-material/Home';
import Home from './components/home';

const routes = [
  {
    name: 'Home',
    key: 'home',
    icon: <HomeIcon />,
    route: '/',
    component: <Home />,
  },
];

export type RoutesType = {
  name: string;
  key: string;
  icon: React.ReactNode;
  route: string;
  component: React.ReactNode;
};

export default routes;
