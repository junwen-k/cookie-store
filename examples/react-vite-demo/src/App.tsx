import { useState } from 'react';
import { useCookie, useCookies, cookieStore } from '@cookie-store/react';

function App() {
  const [newCookieName, setNewCookieName] = useState('');
  const [newCookieValue, setNewCookieValue] = useState('');

  // Watch specific cookies
  const session = useCookie('session');
  const theme = useCookie('theme');

  // Watch all cookies
  const allCookies = useCookies();

  const handleLogin = async () => {
    if (!cookieStore) {
      alert('Cookie Store API not supported in this browser');
      return;
    }

    await cookieStore.set('session', `session_${Date.now()}`, {
      expires: Date.now() + 86400000, // 24 hours
      secure: window.location.protocol === 'https:',
      sameSite: 'lax',
      path: '/',
    });
  };

  const handleLogout = async () => {
    if (!cookieStore) return;
    await cookieStore.delete('session');
  };

  const handleSetTheme = async (newTheme: string) => {
    if (!cookieStore) return;
    await cookieStore.set('theme', newTheme, {
      expires: Date.now() + 365 * 86400000, // 1 year
      path: '/',
    });
  };

  const handleAddCookie = async () => {
    if (!cookieStore || !newCookieName || !newCookieValue) return;

    await cookieStore.set(newCookieName, newCookieValue, {
      path: '/',
    });

    setNewCookieName('');
    setNewCookieValue('');
  };

  const handleDeleteCookie = async (name: string) => {
    if (!cookieStore) return;
    await cookieStore.delete(name);
  };

  return (
    <div>
      <h1>@cookie-store/react Demo</h1>

      {!cookieStore && (
        <div className="status warning">
          <strong>Warning:</strong> Cookie Store API is not supported in this browser.
          <br />
          Please use Chrome/Edge 87+ or Opera 73+.
        </div>
      )}

      <div className="card">
        <h2>Authentication Demo</h2>
        {session ? (
          <div className="status success">
            <p>
              <strong>Logged in!</strong>
            </p>
            <p>Session: {session.value}</p>
            <p>Expires: {session.expires ? new Date(session.expires).toLocaleString() : 'Never'}</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div>
            <p>Not logged in</p>
            <button onClick={handleLogin}>Login</button>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Theme Preference</h2>
        <p>Current theme: {theme?.value || 'default'}</p>
        <div>
          <button onClick={() => handleSetTheme('light')}>Light</button>
          <button onClick={() => handleSetTheme('dark')}>Dark</button>
          <button onClick={() => handleSetTheme('auto')}>Auto</button>
        </div>
      </div>

      <div className="card">
        <h2>Add Custom Cookie</h2>
        <div>
          <input
            type="text"
            placeholder="Cookie name"
            value={newCookieName}
            onChange={(e) => setNewCookieName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Cookie value"
            value={newCookieValue}
            onChange={(e) => setNewCookieValue(e.target.value)}
          />
          <button onClick={handleAddCookie} disabled={!newCookieName || !newCookieValue}>
            Add Cookie
          </button>
        </div>
      </div>

      <div className="card">
        <h2>All Cookies ({allCookies.size})</h2>
        {allCookies.size === 0 ? (
          <p>No cookies found</p>
        ) : (
          <div className="cookie-list">
            {Array.from(allCookies.entries()).map(([name, cookie]) => (
              <div key={name} className="cookie-item">
                <div>
                  <strong>{name}:</strong> {cookie.value}
                  <br />
                  <small>
                    Path: {cookie.path} | SameSite: {cookie.sameSite} | Secure: {cookie.secure ? 'Yes' : 'No'}
                  </small>
                </div>
                <button onClick={() => handleDeleteCookie(name)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.7 }}>
        <p>
          This demo uses the native Cookie Store API with reactive hooks.
          <br />
          Open DevTools Console to see cookie changes in real-time.
        </p>
      </div>
    </div>
  );
}

export default App;
