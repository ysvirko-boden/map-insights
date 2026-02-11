import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Firebase Auth
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: null,
  })),
  onAuthStateChanged: vi.fn((_auth, callback) => {
    callback(null)
    return vi.fn() // unsubscribe function
  }),
  signInWithEmailAndPassword: vi.fn(() => 
    Promise.resolve({ user: { email: 'test@example.com', uid: 'test-uid' } })
  ),
  createUserWithEmailAndPassword: vi.fn(() => 
    Promise.resolve({ user: { email: 'test@example.com', uid: 'test-uid' } })
  ),
  signInWithPopup: vi.fn(() => 
    Promise.resolve({ user: { email: 'test@example.com', uid: 'test-uid' } })
  ),
  signOut: vi.fn(() => Promise.resolve()),
  GoogleAuthProvider: vi.fn(() => ({})),
}))

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(() => vi.fn()),
  Link: ({ children }: { children: React.ReactNode; to: string }) => children,
}))

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  readonly root: Element | null = null
  readonly rootMargin: string = '0px'
  readonly thresholds: ReadonlyArray<number> = []

  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver
