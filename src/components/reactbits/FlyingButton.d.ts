import type { CSSProperties, MouseEvent, ReactNode } from 'react';

export interface FlyingButtonProps {
  children?: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement> | PointerEvent) => void;
  theme?: 'dark' | 'light';
  size?: 'small' | 'medium' | 'large' | 'extra-large';
  radius?: number;
  altitude?: number;
  hoverTime?: number;
  jets?: number;
  thrusters?: boolean;
  trigger?: 'hover' | 'click';
  carryCursor?: boolean;
  smoke?: number;
  turbulence?: number;
  wobble?: number;
  ramp?: boolean;
  thrustColor?: string;
  smokeColor?: string;
  buttonColor?: string;
  textColor?: string;
  rampColor?: string;
  className?: string;
  style?: CSSProperties;
}

export default function FlyingButton(props: FlyingButtonProps): JSX.Element;
