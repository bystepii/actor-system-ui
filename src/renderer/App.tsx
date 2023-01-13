import {
  createTheme,
  CssBaseline,
  ThemeProvider,
  darkScrollbar,
} from '@mui/material';
import { useMemo, useState } from 'react';
import {
  MemoryRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
// import icon from '../../assets/icon.svg';
// import './App.css';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { ColorModeContext } from './lib/globals';
import Layout from './components/layout';

import routes, { RoutesType } from './routes';

export default function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
        typography: {
          fontFamily: 'Roboto',
        },
      }),
    [mode]
  );

  const getRoutes = (allRoutes: RoutesType[]) =>
    allRoutes.map((route) => {
      if (route.route) {
        return (
          <Route
            path={route.route}
            element={<Layout>{route.component}</Layout>}
            key={route.key}
          />
        );
      }

      return null;
    });

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <Router>
          <Routes>
            {getRoutes(routes)}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
