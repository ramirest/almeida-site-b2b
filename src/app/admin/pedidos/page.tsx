import React from 'react';
import { ShoppingCart, Calendar, Search } from 'lucide-react';
import { getAllOrders } from '@/actions/orders';
import { OrdersClientTable } from '@/components/OrdersClientTable';

export default async function PedidosPage() {
  const orders = await getAllOrders();

  return (
    <div className="max-w-7xl mx-auto">
      <OrdersClientTable initialOrders={orders} />
    </div>
  );
}
