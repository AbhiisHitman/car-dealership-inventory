import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { makeVehicle } from '../test/fixtures';
import { VehiclePhoto } from './VehiclePhoto';

const withPhoto = makeVehicle({
  imageUrl: 'https://upload.wikimedia.org/car.jpg',
  imageCredit: 'Jane Doe, CC BY-SA 4.0',
  imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:Car.jpg'
});

describe('VehiclePhoto', () => {
  it('shows the photo with descriptive alt text and a linked credit', () => {
    render(<VehiclePhoto vehicle={withPhoto} />);

    expect(screen.getByRole('img', { name: '2024 Toyota Corolla in Celestite Grey' })).toHaveAttribute('src', withPhoto.imageUrl);
    const credit = screen.getByRole('link', { name: 'Photo: Jane Doe, CC BY-SA 4.0' });
    expect(credit).toHaveAttribute('href', withPhoto.imageSourceUrl);
    expect(credit).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('falls back to the illustration when the photo fails to load', () => {
    render(<VehiclePhoto vehicle={withPhoto} />);

    fireEvent.error(screen.getByRole('img', { name: /corolla in/i }));

    expect(screen.getByRole('img', { name: 'Sedan illustration' })).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('uses the illustration when there is no photo', () => {
    render(<VehiclePhoto vehicle={makeVehicle()} />);

    expect(screen.getByRole('img', { name: 'Sedan illustration' })).toBeInTheDocument();
  });

  it('can hide the credit on small thumbnails', () => {
    render(<VehiclePhoto vehicle={withPhoto} showCredit={false} />);

    expect(screen.queryByText(/photo:/i)).not.toBeInTheDocument();
  });
});
