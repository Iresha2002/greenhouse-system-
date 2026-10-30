import React from 'react';
import { Header } from './Header';

export const Navbar = ({
  user,
  currentUser,
  onLogout,
  onNavigateHome,
  onOpenLogin,
  onGoToDashboard,
  onSelectModule,
}) => {
  return (
    <Header
      currentUser={user || currentUser}
      onLogout={onLogout}
      onNavigateHome={onNavigateHome}
      onOpenLogin={onOpenLogin}
      onGoToDashboard={onGoToDashboard}
      onSelectModule={onSelectModule}
    />
  );
};

export default Navbar;