import type { ReactNode } from 'react';

/** jsdom has no WebGL, so tests swap the React Bits effects for plain stand-ins. */
export const FlyingButtonMock = ({ children, onClick }: { children?: ReactNode; onClick?: () => void }) => (
  <button type="button" onClick={onClick}>
    {children}
  </button>
);
export const DecorMock = () => <div data-testid="decor" />;
