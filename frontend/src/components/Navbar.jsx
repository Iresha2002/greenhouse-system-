import React from 'react';
import { Header } from './Header';

export const Navbar = ({
  user,
  currentUser,
  onLogout,
  onNavigateHome,
  onNavigateSupport,
  currentView,
  onOpenLogin,
  onGoToDashboard,
  onSelectModule,
}) => {
  return (
    <Header
      currentUser={user || currentUser}
      onLogout={onLogout}
      onNavigateHome={onNavigateHome}
      onNavigateSupport={onNavigateSupport}
      currentView={currentView}
      onOpenLogin={onOpenLogin}
      onGoToDashboard={onGoToDashboard}
      onSelectModule={onSelectModule}
    />
  );
};

export default Navbar;