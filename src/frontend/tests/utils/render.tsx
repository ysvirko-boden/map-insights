import type { RenderOptions } from '@testing-library/react'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'

// Custom render function with providers
function customRender(ui: ReactElement, options?: RenderOptions) {
  // Add your providers here (e.g., Router, Theme, Store)
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>
  }

  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Re-export everything from testing library
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react'

// Override render method
export { customRender as render }
