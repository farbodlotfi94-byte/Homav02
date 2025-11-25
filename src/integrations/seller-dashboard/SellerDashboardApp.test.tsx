import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SellerDashboardApp } from './SellerDashboardApp';

describe('SellerDashboardApp', () => {
  it('renders login form with phone and password fields', () => {
    render(<SellerDashboardApp />);

    expect(
      screen.getByLabelText('شماره تماس', { selector: 'input' })
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('رمز عبور', { selector: 'input' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ورود' })).toBeInTheDocument();
  });

  it('allows logging in with demo credentials and shows dashboard header', async () => {
    render(<SellerDashboardApp />);

    fireEvent.change(
      screen.getByLabelText('شماره تماس', { selector: 'input' }),
      { target: { value: '09123456789' } }
    );
    fireEvent.change(
      screen.getByLabelText('رمز عبور', { selector: 'input' }),
      { target: { value: 'demo123' } }
    );
    fireEvent.click(screen.getByRole('button', { name: 'ورود' }));

    await waitFor(() => {
      expect(
        screen.getByText('داشبورد آمار بازدید')
      ).toBeInTheDocument();
    });
  });

  it('shows product list after login', async () => {
    render(<SellerDashboardApp />);

    fireEvent.change(
      screen.getByLabelText('شماره تماس', { selector: 'input' }),
      { target: { value: '09123456789' } }
    );
    fireEvent.change(
      screen.getByLabelText('رمز عبور', { selector: 'input' }),
      { target: { value: 'demo123' } }
    );
    fireEvent.click(screen.getByRole('button', { name: 'ورود' }));

    await waitFor(() => {
      expect(
        screen.getByText('مبل راحتی مدرن')
      ).toBeInTheDocument();
    });
    expect(screen.getByText('فرش دستباف کاشان')).toBeInTheDocument();
  });
});
