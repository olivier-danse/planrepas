import { NavLink } from 'react-router-dom';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

export function AppHeader() {
  const isOnline = useOnlineStatus();
  const { canInstall, install } = useInstallPrompt();

  return (
    <>
      {!isOnline && (
        <div className="offline-banner">
          Mode hors-ligne — les modifications seront synchronisées au retour du réseau
        </div>
      )}
      <header className="app-header">
        <div className="app-logo">
          <div className="app-logo-icon">MP</div>
          <span>MealPlan</span>
        </div>
        <nav className="app-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `app-nav-link${isActive ? ' active' : ''}`
            }
          >
            Planning
          </NavLink>
          <NavLink
            to="/courses"
            className={({ isActive }) =>
              `app-nav-link${isActive ? ' active' : ''}`
            }
          >
            Courses
          </NavLink>
          {canInstall && (
            <button
              className="app-nav-link"
              onClick={install}
              title="Installer l'application"
            >
              Installer
            </button>
          )}
        </nav>
      </header>
    </>
  );
}
