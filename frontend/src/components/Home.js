import React, { useContext } from 'react';
import AuthContext from '../AuthContext';
import UnauthenticatedHome from './UnauthenticatedHome';
import SecurityPersonnelHome from './SecurityPersonnelHome';
import MobileTaskForcesHome from './MobileTaskForcesHome';
import AdministrativePersonnelHome from './AdministrativePersonnelHome';

function Home() {
  const { auth } = useContext(AuthContext);

  if (!auth.isAuthenticated) {
    return <UnauthenticatedHome />;
  }

  switch (auth.role) {
    case 'Security Personnel':
      return <SecurityPersonnelHome />;
    case 'Mobile Task Forces':
      return <MobileTaskForcesHome />;
    case 'Administrative Personnel':
      return <AdministrativePersonnelHome />;
    default:
      return <UnauthenticatedHome />;
  }
}

export default Home;
