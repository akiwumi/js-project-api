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
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-heading">Create Account</h1>

        {authError && <div className="auth-alert">{authError}</div>}

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

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <Spinner /> : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Login</Link>
        </div>
      </div>
    </div>
  )
}
