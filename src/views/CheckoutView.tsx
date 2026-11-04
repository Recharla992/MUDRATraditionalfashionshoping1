import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShippingAddress } from '../types';
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Banknote,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Delhi (NCR)',
  'Gujarat',
  'Haryana',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'West Bengal',
];

export const CheckoutView: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    deliveryCharge,
    cartDiscount,
    cartTotal,
    appliedCoupon,
    placeOrder,
    navigateTo,
    currentUser,
    showToast,
  } = useApp();

  // Multi-step checkout step
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Address state
  const defaultAddr = currentUser?.savedAddresses?.[0];
  const [fullName, setFullName] = useState(defaultAddr?.fullName || currentUser?.name || '');
  const [email, setEmail] = useState(defaultAddr?.email || currentUser?.email || '');
  const [phone, setPhone] = useState(defaultAddr?.phone || currentUser?.phone || '');
  const [street, setStreet] = useState(defaultAddr?.street || '');
  const [landmark, setLandmark] = useState(defaultAddr?.landmark || '');
  const [city, setCity] = useState(defaultAddr?.city || '');
  const [state, setState] = useState(defaultAddr?.state || 'Uttar Pradesh');
  const [pincode, setPincode] = useState(defaultAddr?.pincode || '');

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card' | 'razorpay'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Razorpay simulated modal
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-heading text-2xl font-bold text-[#0C2B4E]">Your Bag is Empty</h2>
        <p className="text-xs text-[#718096]">
          Please add items to your cart before proceeding to checkout.
        </p>
        <button
          onClick={() => navigateTo('shop')}
          className="px-6 py-2.5 bg-[#0C2B4E] text-white text-xs font-semibold rounded-md"
        >
          Browse Collections
        </button>
      </div>
    );
  }

  const validateStep1 = () => {
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      showToast('Please fill all contact details.', 'error');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!street.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      showToast('Please provide your complete shipping address & PIN code.', 'error');
      return false;
    }
    if (pincode.trim().length !== 6) {
      showToast('Please provide a valid 6-digit Indian PIN code.', 'error');
      return false;
    }
    return true;
  };

  const handleExecuteOrder = () => {
    setIsProcessing(true);
    const shippingAddress: ShippingAddress = {
      fullName,
      email,
      phone,
      street,
      landmark,
      city,
      state,
      pincode,
    };

    setTimeout(() => {
      const order = placeOrder(shippingAddress, paymentMethod);
      setIsProcessing(false);
      setShowRazorpayModal(false);
      showToast('Order confirmed with sacred blessings!', 'success');
      navigateTo('confirmation', { orderId: order.orderNumber });
    }, 1200);
  };

  const handlePlaceOrderClick = () => {
    if (!validateStep1() || !validateStep2()) return;

    if (paymentMethod === 'razorpay') {
      setShowRazorpayModal(true);
      return;
    }

    if (paymentMethod === 'upi' && !upiId.includes('@')) {
      showToast('Please enter a valid UPI ID (e.g. name@okhdfcbank or 9876543210@upi).', 'error');
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardNumber || !cardExpiry || !cardCvv) {
        showToast('Please enter complete credit/debit card information.', 'error');
        return;
      }
    }

    handleExecuteOrder();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Checkout Progress Stepper */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="flex items-center justify-between text-xs font-semibold">
          <div
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2 cursor-pointer ${
              currentStep >= 1 ? 'text-[#0C2B4E]' : 'text-[#A0AEC0]'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-mono ${
                currentStep >= 1 ? 'bg-[#0C2B4E] text-[#D4AF37]' : 'bg-[#E8E2D9]'
              }`}
            >
              1
            </span>
            <span>Contact</span>
          </div>

          <div className="flex-1 h-px bg-[#E8E2D9] mx-3" />

          <div
            onClick={() => validateStep1() && setCurrentStep(2)}
            className={`flex items-center gap-2 cursor-pointer ${
              currentStep >= 2 ? 'text-[#0C2B4E]' : 'text-[#A0AEC0]'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-mono ${
                currentStep >= 2 ? 'bg-[#0C2B4E] text-[#D4AF37]' : 'bg-[#E8E2D9]'
              }`}
            >
              2
            </span>
            <span>Shipping</span>
          </div>

          <div className="flex-1 h-px bg-[#E8E2D9] mx-3" />

          <div
            onClick={() => validateStep1() && validateStep2() && setCurrentStep(3)}
            className={`flex items-center gap-2 cursor-pointer ${
              currentStep >= 3 ? 'text-[#0C2B4E]' : 'text-[#A0AEC0]'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-mono ${
                currentStep >= 3 ? 'bg-[#0C2B4E] text-[#D4AF37]' : 'bg-[#E8E2D9]'
              }`}
            >
              3
            </span>
            <span>Payment</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-xl border border-[#E8E2D9] shadow-xs space-y-8">
          
          {/* Step 1: Contact Information */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D9] mb-4">
              <h2 className="font-heading text-base font-bold text-[#0C2B4E] flex items-center gap-2">
                <span>1. Customer Details</span>
                {currentStep > 1 && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </h2>
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-[#8C7A58] hover:underline"
                >
                  Edit
                </button>
              )}
            </div>

            {currentStep === 1 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2D3748] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Radhika Sen"
                    className="w-full text-xs px-3 py-2.5 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md focus:outline-hidden focus:border-[#0C2B4E]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2D3748] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="radhika.sen@mudra.in"
                      className="w-full text-xs px-3 py-2.5 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md focus:outline-hidden focus:border-[#0C2B4E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2D3748] mb-1">
                      Mobile Number (for Courier & OTP) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full text-xs px-3 py-2.5 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md focus:outline-hidden focus:border-[#0C2B4E]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep1()) setCurrentStep(2);
                    }}
                    className="px-6 py-2.5 text-xs font-semibold text-white bg-[#0C2B4E] hover:bg-[#07172C] rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Proceed to Delivery Address</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#4A5568] bg-[#FAF8F5] p-3 rounded-md">
                <p className="font-semibold text-[#1A202C]">{fullName}</p>
                <p>{email} · {phone}</p>
              </div>
            )}
          </div>

          {/* Step 2: Delivery Address */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D9] mb-4">
              <h2 className="font-heading text-base font-bold text-[#0C2B4E] flex items-center gap-2">
                <span>2. Temple Delivery Address</span>
                {currentStep > 2 && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </h2>
              {currentStep > 2 && (
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-[#8C7A58] hover:underline"
                >
                  Edit
                </button>
              )}
            </div>

            {currentStep === 2 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2D3748] mb-1">
                    Flat / House No. / Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Flat 402, Vrindavan Heights, Temple Road"
                    className="w-full text-xs px-3 py-2.5 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md focus:outline-hidden focus:border-[#0C2B4E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2D3748] mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near Krishna Balaram Mandir"
                    className="w-full text-xs px-3 py-2.5 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md focus:outline-hidden focus:border-[#0C2B4E]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2D3748] mb-1">
                      City / District *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Mathura"
                      className="w-full text-xs px-3 py-2.5 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md focus:outline-hidden focus:border-[#0C2B4E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2D3748] mb-1">
                      State *
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md focus:outline-hidden focus:border-[#0C2B4E]"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2D3748] mb-1">
                      6-Digit PIN Code *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="281121"
                      className="w-full text-xs px-3 py-2.5 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md font-mono focus:outline-hidden focus:border-[#0C2B4E]"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-[#718096] hover:underline"
                  >
                    Back to Contact
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep2()) setCurrentStep(3);
                    }}
                    className="px-6 py-2.5 text-xs font-semibold text-white bg-[#0C2B4E] hover:bg-[#07172C] rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                  </button>
                </div>
              </div>
            ) : currentStep > 2 ? (
              <div className="text-xs text-[#4A5568] bg-[#FAF8F5] p-3 rounded-md">
                <p>{street}, {landmark && `${landmark}, `}{city}, {state} - {pincode}</p>
              </div>
            ) : null}
          </div>

          {/* Step 3: Payment Method */}
          {currentStep >= 3 && (
            <div>
              <div className="pb-3 border-b border-[#E8E2D9] mb-4">
                <h2 className="font-heading text-base font-bold text-[#0C2B4E]">
                  3. Select Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                {/* UPI Option */}
                <label
                  className={`block p-4 rounded-lg border transition-all cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'border-[#0C2B4E] bg-[#FAF5E8]'
                      : 'border-[#E8E2D9] bg-white hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="text-[#0C2B4E] focus:ring-[#0C2B4E]"
                    />
                    <QrCode className="w-5 h-5 text-[#0C2B4E]" />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-[#0C2B4E] block">
                        Instant UPI / Google Pay / PhonePe / Paytm
                      </span>
                      <span className="text-[11px] text-[#718096]">
                        Pay directly via any UPI app with 0% transaction fee
                      </span>
                    </div>
                  </div>

                  {paymentMethod === 'upi' && (
                    <div className="mt-4 pt-3 border-t border-[#D9D0C3] space-y-3">
                      <div className="flex items-center gap-4">
                        {/* Static QR Code representation */}
                        <div className="w-20 h-20 bg-white p-1 border border-[#D9D0C3] rounded-md flex items-center justify-center shrink-0">
                          <img
                            src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=upi://pay?pa=mudra.ateliers@okhdfcbank&pn=MUDRA%20Ateliers&am=0&cu=INR"
                            alt="Scan UPI QR"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="text-xs text-[#4A5568] space-y-1">
                          <p className="font-semibold text-[#0C2B4E]">Scan & Pay via Mobile</p>
                          <p className="text-[11px]">or enter your Virtual Payment Address (VPA):</p>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="e.g. 9876543210@upi"
                            className="text-xs px-3 py-1.5 bg-white border border-[#D9D0C3] rounded-md w-full font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </label>

                {/* Razorpay Online Option */}
                <label
                  className={`block p-4 rounded-lg border transition-all cursor-pointer ${
                    paymentMethod === 'razorpay'
                      ? 'border-[#0C2B4E] bg-[#FAF5E8]'
                      : 'border-[#E8E2D9] bg-white hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="text-[#0C2B4E] focus:ring-[#0C2B4E]"
                    />
                    <Sparkles className="w-5 h-5 text-[#0C2B4E]" />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-[#0C2B4E] block">
                        Razorpay Secure Gateway (Test Mode Enabled)
                      </span>
                      <span className="text-[11px] text-[#718096]">
                        Netbanking, Wallets, International Cards, Cred
                      </span>
                    </div>
                  </div>
                </label>

                {/* Credit / Debit Cards */}
                <label
                  className={`block p-4 rounded-lg border transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-[#0C2B4E] bg-[#FAF5E8]'
                      : 'border-[#E8E2D9] bg-white hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="text-[#0C2B4E] focus:ring-[#0C2B4E]"
                    />
                    <CreditCard className="w-5 h-5 text-[#0C2B4E]" />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-[#0C2B4E] block">
                        Credit / Debit Card (Visa, RuPay, Mastercard, Amex)
                      </span>
                      <span className="text-[11px] text-[#718096]">
                        256-bit encrypted bank checkout
                      </span>
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="mt-4 pt-3 border-t border-[#D9D0C3] space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#2D3748] mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="•••• •••• •••• ••••"
                          className="w-full text-xs px-3 py-2 bg-white border border-[#D9D0C3] rounded-md font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#2D3748] mb-1">
                            MM / YY
                          </label>
                          <input
                            type="text"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="08/28"
                            className="w-full text-xs px-3 py-2 bg-white border border-[#D9D0C3] rounded-md font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[#2D3748] mb-1">
                            CVV
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="•••"
                            className="w-full text-xs px-3 py-2 bg-white border border-[#D9D0C3] rounded-md font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </label>

                {/* Cash on Delivery */}
                <label
                  className={`block p-4 rounded-lg border transition-all cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-[#0C2B4E] bg-[#FAF5E8]'
                      : 'border-[#E8E2D9] bg-white hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="text-[#0C2B4E] focus:ring-[#0C2B4E]"
                    />
                    <Banknote className="w-5 h-5 text-[#0C2B4E]" />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-[#0C2B4E] block">
                        Cash on Delivery (COD)
                      </span>
                      <span className="text-[11px] text-[#718096]">
                        Pay in cash or courier QR at the time of doorstep delivery
                      </span>
                    </div>
                  </div>
                </label>
              </div>

              {/* Submit Order Button */}
              <div className="pt-6">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handlePlaceOrderClick}
                  className="w-full py-3.5 bg-[#0C2B4E] hover:bg-[#07172C] text-white text-xs sm:text-sm font-semibold rounded-md shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-[#D4AF37]" />
                  <span>
                    {isProcessing
                      ? 'Blessing & Placing Your Order...'
                      : `Place Order • ₹${cartTotal.toLocaleString('en-IN')}`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Summary (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#E8E2D9] space-y-5 shadow-xs">
          <h2 className="font-heading text-lg font-bold text-[#0C2B4E] pb-3 border-b border-[#E8E2D9]">
            Order Review ({cart.reduce((t, i) => t + i.quantity, 0)} items)
          </h2>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {cart.map((item, idx) => {
              const isCustom = item.customization?.isCustomized;
              const unitPrice = item.product.price + (item.customization?.totalFee || 0);
              const itemTotal = unitPrice * item.quantity;

              return (
                <div
                  key={`${item.product.id}-${item.selectedSize}-${idx}`}
                  className="flex gap-3 text-xs border-b border-[#F0EBE1] pb-3"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-14 h-16 object-cover rounded bg-[#F3EFE9] shrink-0"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-[#1A202C] line-clamp-1">{item.product.name}</p>
                    <p className="text-[11px] text-[#718096]">
                      Qty: {item.quantity} · Size: {item.selectedSize} · Color: {item.selectedColor}
                    </p>
                    {isCustom && item.customization && (
                      <div className="mt-1 text-[10px] bg-[#FAF6EE] p-1.5 rounded border border-[#D4AF37]/30 text-[#0C2B4E]">
                        <span className="font-semibold text-[#8C7A58]">✂ Atelier Custom: </span>
                        {item.customization.stitchingOption !== 'unstitched' && (
                          <span>{item.customization.stitchingOption === 'bespoke_madetomeasure' ? 'Bespoke Fit' : 'Stitched'} · </span>
                        )}
                        {item.customization.monogramText && (
                          <span className="font-mono text-amber-900">"{item.customization.monogramText}" · </span>
                        )}
                        {item.customization.fallPico && <span>Fall & Pico · </span>}
                        {item.customization.matchingInskirt && <span>Inskirt · </span>}
                        <span className="font-mono font-bold">+₹{item.customization.totalFee}</span>
                      </div>
                    )}
                    <p className="font-mono font-bold text-[#0C2B4E] mt-0.5">
                      ₹{itemTotal.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-1.5 text-xs text-[#4A5568] pt-2 border-t border-[#E8E2D9]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums text-[#1A202C]">₹{cartSubtotal.toLocaleString('en-IN')}</span>
            </div>
            {cartDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Discount ({appliedCoupon?.code})</span>
                <span className="font-mono tabular-nums">-₹{cartDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-mono tabular-nums text-[#1A202C]">
                {deliveryCharge === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${deliveryCharge}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#0C2B4E] pt-2 border-t border-[#E8E2D9]">
              <span>Final Total Payable</span>
              <span className="font-mono tabular-nums">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="p-3 bg-[#FAF5E8] rounded-md text-[11px] text-[#8C7A58] space-y-1">
            <p className="font-semibold text-[#0C2B4E]">Estimated Temple Dispatch:</p>
            <p>Orders are dispatched within 24-48 hours via BlueDart Express with sanctified care.</p>
          </div>
        </div>
      </div>

      {/* Simulated Razorpay Test Modal */}
      {showRazorpayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-[#D9D0C3]">
            <div className="bg-[#0C2340] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-wider text-sm">RAZORPAY</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                  TEST MODE
                </span>
              </div>
              <span className="text-xs font-mono font-bold">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <p className="text-[#4A5568]">
                Simulating secure test payment authentication for <strong>MUDRA Ateliers</strong>.
              </p>
              <div className="bg-[#FAF8F5] p-3 rounded border border-[#E8E2D9] space-y-1 font-mono text-[11px]">
                <p>Order ID: {`rzp_test_${Math.floor(Math.random() * 900000)}`}</p>
                <p>Customer: {fullName}</p>
                <p>Amount: ₹{cartTotal.toLocaleString('en-IN')}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleExecuteOrder}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-xs cursor-pointer"
                >
                  Simulate Success
                </button>
                <button
                  type="button"
                  onClick={() => setShowRazorpayModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
