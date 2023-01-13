import { ReactNode } from 'react';
import Header from './header';

type Props = {
  children?: ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
};

Layout.defaultProps = {
  children: null,
};

export default Layout;
