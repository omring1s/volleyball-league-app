import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import api from '../api/client';

export default function Auth() {
  const [tab, setTab] = useState('login');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ email: '', username: '', password: '', full_name: '', skill_level: 'beginner', position: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const r = await api.post('/auth/login', loginForm);
      login(r.data);
      navigate('/');
    } catch (e) { setError(e.response?.data?.error || 'Login failed'); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const r = await api.post('/auth/register', regForm);
      login(r.data);
      navigate('/');
    } catch (e) { setError(e.response?.data?.error || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🏐</div>
          <h1 className="text-2xl font-bold text-gray-900">VBLeague</h1>
          <p className="text-gray-500 text-sm mt-1">Your volleyball community</p>
        </div>

        <div className="flex border-b mb-6">
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${tab === t ? 'border-b-2 border-blue-700 text-blue-700' : 'text-gray-500'}`}>
              {t === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</div>}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input label="Email" type="email" value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} required autoFocus />
            <Input label="Password" type="password" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} required />
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Email *" type="email" value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} required />
              <Input label="Username *" value={regForm.username} onChange={e => setRegForm(f => ({ ...f, username: e.target.value }))} required />
            </div>
            <Input label="Full name" value={regForm.full_name} onChange={e => setRegForm(f => ({ ...f, full_name: e.target.value }))} />
            <Input label="Password *" type="password" value={regForm.password} onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))} required />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Skill level" value={regForm.skill_level} onChange={e => setRegForm(f => ({ ...f, skill_level: e.target.value }))}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
              <Input label="Position" value={regForm.position} onChange={e => setRegForm(f => ({ ...f, position: e.target.value }))} placeholder="e.g. Setter" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</Button>
          </form>
        )}
      </div>
    </div>
  );
}
