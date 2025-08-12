import { CartItem as CartItemType } from "../../types/cart";

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

const CartItem = ({ item, onQuantityChange, onRemove }: CartItemProps) => {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
      <div className="flex-1">
        <h3 className="text-lg font-medium text-gray-900">{item.productName}</h3>
        <p className="text-gray-600">${item.price.toFixed(2)} each</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={item.quantity <= 1}
          >
            -
          </button>
          <span className="px-3 py-1 text-gray-900 font-medium min-w-[3rem] text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            +
          </button>
        </div>
        
        <div className="text-right">
          <p className="text-lg font-medium text-gray-900">
            ${(item.price * item.quantity).toFixed(2)}
          </p>
        </div>
        
        <button
          onClick={() => onRemove(item.id)}
          className="text-red-600 hover:text-red-800 transition-colors p-1"
          title="Remove item"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CartItem;
