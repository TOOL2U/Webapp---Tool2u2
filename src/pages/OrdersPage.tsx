import { useState, useEffect } from 'react';
import NotificationManager from '../components/NotificationManager';
import { useNotification } from '../contexts/NotificationContext';

export default function OrdersPage() {
  const { lastNotification } = useNotification();
  const [orders, setOrders] = useState<any[]>([]);

  // This is a placeholder for demonstration
  // In a real app, you would fetch orders from your database
  useEffect(() => {
    // Add the notification to orders if it contains order data
    if (lastNotification && lastNotification.data) {
      const newOrder = {
        id: lastNotification.data.orderId || `order-${Date.now()}`,
        customer: lastNotification.data.customer || 'New Customer',
        items: lastNotification.data.items || 'Items not specified',
        status: 'New',
        timestamp: new Date().toISOString(),
        ...lastNotification.data
      };
      
      setOrders(prevOrders => [newOrder, ...prevOrders]);
    }
  }, [lastNotification]);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Orders Dashboard</h1>
        
        <div className="mt-6">
          <NotificationManager />
          
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <li key={order.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          Order #{order.id}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {order.status}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {order.customer}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            {order.items}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            {new Date(order.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-6 text-center text-gray-500">
                  No orders yet. New orders will appear here when received.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
