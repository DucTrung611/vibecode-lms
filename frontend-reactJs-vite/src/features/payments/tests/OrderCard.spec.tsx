import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OrderCard } from '../components/OrderCard';
import type { Order } from '../types/payment.types';

const order: Order = {
  id: 'order_1',
  studentId: 'student_1',
  totalAmount: 49.99,
  status: 'PAID',
  paidAt: '2026-01-15T00:00:00.000Z',
  createdAt: '2026-01-15T00:00:00.000Z',
  items: [
    {
      id: 'item_1',
      orderId: 'order_1',
      courseId: 'course_1',
      price: 49.99,
      course: { id: 'course_1', title: 'Intro to Algebra', thumbnailUrl: null },
    },
  ],
};

describe('OrderCard', () => {
  it('shows the course title, status, and total', () => {
    render(<OrderCard order={order} />);

    expect(screen.getByText('Intro to Algebra')).toBeInTheDocument();
    expect(screen.getByText('PAID')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    // Appears twice: once as the single item's price, once as the order total.
    expect(screen.getAllByText('$49.99')).toHaveLength(2);
  });

  it('falls back to "Untitled course" when the item has no course summary', () => {
    const [item] = order.items ?? [];
    render(
      <OrderCard order={{ ...order, items: [{ ...item, course: undefined }] }} />,
    );

    expect(screen.getByText('Untitled course')).toBeInTheDocument();
  });
});
