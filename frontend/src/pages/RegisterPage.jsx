import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../app/hooks/useAuth'
import { useToast } from '../app/hooks/useToast'
import { Input, Spinner } from '../components/common'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const { register, loading, error: authError } = useAuth()
  const { show: showToast } = useToast()
  const navigate = useNavigate()

  const validate = () => {
    const newErrors = {}
    if (!name) newErrors.name = 'Name is required'
    if (!email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid'
    if (!password) newErrors.password = 'Password is required'
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
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
      await register(name, email, password)
      showToast('Registration successful!', 'success')
      navigate('/chat')
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || authError || 'Registration failed'
      showToast(msg, 'error')
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--ds-bg, #f4f7fa)' }}>
      <div style={{ background: 'white', borderRadius: '12px', padding: 32, width: '100%', maxWidth: 400, boxShadow: '0 8px 20px rgba(38,49,63,0.06)' }}>
        <h1 style={{ margin: '0 0 24px 0', textAlign: 'center', fontSize: 24, fontWeight: 600, color: 'var(--ds-text, #24303a)' }}>Create Account</h1>
        
        {authError && <div style={{ background: '#ffe8e8', color: 'var(--ds-danger, #ff6b6b)', padding: '10px 12px', borderRadius: '8px', marginBottom: 16, fontSize: '14px' }}>{authError}</div>}

        <form onSubmit={handleSubmit}>
          <Input
            label="Name"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors({ ...errors, name: '' }) }}
            error={errors.name}
            placeholder="John Doe"
          />
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
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setErrors({ ...errors, confirmPassword: '' }) }}
            error={errors.confirmPassword}
            placeholder="••••••••"
          />

          <button type="submit" style={{ width: '100%', marginTop: 8, padding: '10px 14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(180deg, var(--ds-accent), var(--ds-accent-600))', color: 'white', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} disabled={loading}>
            {loading ? <Spinner /> : 'Register'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: '14px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--ds-accent, #2ec8a8)', textDecoration: 'none', fontWeight: 600 }}>Login</Link>
        </div>
      </div>
    </div>
  )
}
