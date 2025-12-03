interface PaymentConsoleProps {
  className?: string;
}

export const PaymentInfoConsole = ({ className }: PaymentConsoleProps) => {
  return (
    <div className={`flex flex-col mt-auto space-y-3 ${className}`}>
      <div className="flex space-x-4">
        <label>Payment Options:</label>
      </div>
      
      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 justify-left md:space-x-10 w-full">
        <div className="w-[70%] md:w-[40%] min-h-[80px] px-8 py-4 border-1 border-green-800">
          <div>
            <div className="font-semibold">SSLCommerz</div>
            <div className="text-sm text-green-200">Secure Payment Gateway</div>
          </div>
        </div>

        <div className="w-[70%] md:w-[40%] min-h-[80px] px-8 py-4 border-1 border-green-800">
          <div>
            <div className="font-semibold">EMI</div>
            <div className="text-sm text-green-200">Pay monthly!</div>
          </div>
        </div>

        <div className="w-[70%] md:w-[40%] min-h-[80px] px-8 py-4 border-1 border-green-800">
          <div>
            <div className="font-semibold">Cash on Delivery</div>
            <div className="text-sm text-green-200">Conditions Apply</div>
          </div>
        </div>
      </div>
    </div>
  );
};
