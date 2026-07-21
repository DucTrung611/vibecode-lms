import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NotificationList } from '../components/NotificationList';
import type { Notification } from '../types/notification.types';

const unread: Notification = {
  id: 'notif_1',
  userId: 'user_1',
  type: 'ENROLLMENT_COMPLETED',
  title: 'Course completed',
  content: 'You finished Intro to Algebra',
  isRead: false,
  createdAt: '2026-01-15T00:00:00.000Z',
};

describe('NotificationList', () => {
  it('shows an empty state when there are no notifications', () => {
    render(<NotificationList items={[]} onMarkAsRead={vi.fn()} />);

    expect(screen.getByText('No notifications yet.')).toBeInTheDocument();
  });

  it('renders each notification and calls onMarkAsRead for unread items', async () => {
    const user = userEvent.setup();
    const onMarkAsRead = vi.fn();

    render(
      <NotificationList items={[unread]} onMarkAsRead={onMarkAsRead} />,
    );

    expect(screen.getByText('Course completed')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Mark read' }));

    expect(onMarkAsRead).toHaveBeenCalledWith('notif_1');
  });

  it('does not show a mark-as-read button for already-read notifications', () => {
    render(
      <NotificationList
        items={[{ ...unread, isRead: true }]}
        onMarkAsRead={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole('button', { name: 'Mark read' }),
    ).not.toBeInTheDocument();
  });
});
