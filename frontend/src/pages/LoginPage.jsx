import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../app/hooks/useAuth'
import { useToast } from '../app/hooks/useToast'
import { Input, Spinner } from '../components/common'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const { login, loading, error: authError } = useAuth()
  const { show: showToast } = useToast()
  const navigate = useNavigate()

  const validate = () => {
    const newErrors = {}
    if (!email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid'
    if (!password) newErrors.password = 'Password is required'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await login(email, password)
      showToast('Login successful!', 'success')
      navigate('/chat')
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || authError || 'Login failed'
      showToast(msg, 'error')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-heading">Login</h1>

        {authError && <div className="auth-alert">{authError}</div>}

        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: '' }) }}
            error={errors.email}
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: '' }) }}
            error={errors.password}
            placeholder="••••••••"
          />

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <Spinner /> : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Register</Link>
        </div>
      </div>
    </div>
  )
}
