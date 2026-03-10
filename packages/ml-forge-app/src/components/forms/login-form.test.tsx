import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginForm } from './login-form'

const signInWithPassword = vi.fn()
const signInWithOAuth = vi.fn()

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword,
      signInWithOAuth,
    },
  },
}))

function renderLoginForm(initialRoute = '/login?next=/dashboard') {
  render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/dashboard" element={<h1>Dashboard</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('logs in successfully and navigates to next route', async () => {
    signInWithPassword.mockResolvedValue({
      data: { session: { access_token: 'token' } },
      error: null,
    })

    const user = userEvent.setup()
    renderLoginForm()

    await user.type(screen.getByLabelText(/email/i), '  user@example.com  ')
    await user.type(screen.getByLabelText(/password/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /login/i }))

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret123',
    })
  })

  it('shows friendly error on invalid credentials', async () => {
    signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: new Error('Invalid login credentials'),
    })

    const user = userEvent.setup()
    renderLoginForm()

    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrong-pass')
    await user.click(screen.getByRole('button', { name: /login/i }))

    expect(
      await screen.findByText('Invalid email or password. Please check your credentials.'),
    ).toBeInTheDocument()
  })
})
