import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { WATER_PACKAGES, KHULNA_AREAS, HOTLINE_NUMBER, HOTLINE_TEL, toBengaliNumber } from '@/src/data/packages';
import { WaterPackage, CustomerDetails, ConfirmedOrder } from '@/src/types';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/card';
import {
  X,
  Plus,
  Minus,
  CheckCircle2,
  Phone,
  Truck,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  CreditCard
} from 'lucide-react';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage?: WaterPackage | null;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  selectedPackage = null,
}) => {
  const [packageId, setPackageId] = useState<string>(
    selectedPackage?.id || WATER_PACKAGES[0].id
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [hasEmptyJar, setHasEmptyJar] = useState<boolean>(true);

  // Customer form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState(KHULNA_AREAS[0]);
  const [address, setAddress] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('আজকেই দ্রুততম ডেলিভারি (১ ঘণ্টার মধ্যে)');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [notes, setNotes] = useState('');

  // Form error state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);

  useEffect(() => {
    if (selectedPackage) {
      setPackageId(selectedPackage.id);
    }
  }, [selectedPackage]);

  if (!isOpen) return null;

  const currentPkg =
    WATER_PACKAGES.find((p) => p.id === packageId) || WATER_PACKAGES[0];

  // Pricing math
  const itemsCost = currentPkg.price * quantity;
  const depositPerJar = currentPkg.depositRequired && !hasEmptyJar ? currentPkg.depositAmount : 0;
  const totalDeposit = depositPerJar * quantity;
  const deliveryCharge = 0; // Free delivery!
  const grandTotal = itemsCost + totalDeposit + deliveryCharge;

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!name.trim()) errs.name = 'অনুগ্রহ করে আপনার নাম লিখুন';
    if (!phone.trim()) {
      errs.phone = 'অনুগ্রহ করে আপনার মোবাইল নম্বর লিখুন';
    } else if (!/^01[3-9]\d{8}$/.test(phone.replace(/[\s-]/g, ''))) {
      errs.phone = 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)';
    }
    if (!address.trim()) {
      errs.address = 'বাসা/ফ্ল্যাট নং ও রাস্তার বিস্তারিত ঠিকানা দিন';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const randomId = 'PW-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder: ConfirmedOrder = {
      orderId: randomId,
      createdAt: new Date().toLocaleTimeString('bn-BD', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      customer: {
        name,
        phone,
        area,
        address,
        deliverySlot,
        paymentMethod,
        notes,
      },
      item: {
        packageId: currentPkg.id,
        packageTitle: currentPkg.title,
        quantity,
        unitPrice: currentPkg.price,
        hasEmptyJar,
        jarDeposit: totalDeposit,
        totalPrice: grandTotal,
      },
      status: 'নিশ্চিত হয়েছে',
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setConfirmedOrder(newOrder);

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // fallback
      }
    }, 600);
  };

  const handleClose = () => {
    setConfirmedOrder(null);
    onClose();
  };


  return (
    <div
      id="order-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-xl my-8 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 bg-gradient-to-r from-cyan-600 to-sky-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold leading-tight">
                {confirmedOrder ? 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে!' : 'দ্রুত খাবার পানি অর্ডার করুন'}
              </h3>
              <p className="text-xs text-cyan-100 mt-0.5">
                {confirmedOrder
                  ? 'আপনার অর্ডার আইডি: ' + confirmedOrder.orderId
                  : 'ডোরস্টেপে ফ্রি ডেলিভারি • দ্রুততম সার্ভিস'}
              </p>
            </div>
          </div>
          <button
            id="close-order-modal-btn"
            onClick={handleClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {confirmedOrder ? (
          /* SUCCESS STATE */
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-2xl font-bold text-slate-900">
                ধন্যবাদ, {confirmedOrder.customer.name}!
              </h4>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                আপনার পানির অর্ডারটি গৃহীত হয়েছে। আমাদের ডেলিভারি টিম কিছুক্ষণের মধ্যেই আপনার নম্বরে কল দিয়ে কনফার্ম করবে।
              </p>
            </div>

            {/* Order Summary Card */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 text-left space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between pb-2 border-b border-slate-200 font-semibold text-slate-700">
                <span>অর্ডার আইডি</span>
                <span className="font-mono text-cyan-700 font-bold">#{confirmedOrder.orderId}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>নির্বাচিত প্যাকেজ</span>
                <span className="font-medium text-slate-900">
                  {confirmedOrder.item.packageTitle} (<strong className="font-bold text-slate-900">{confirmedOrder.item.quantity}</strong> টি)
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ডেলিভারি ঠিকানা</span>
                <span className="font-medium text-slate-900 max-w-[220px] truncate text-right">
                  {confirmedOrder.customer.address}, {confirmedOrder.customer.area}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>পেমেন্ট মেথড</span>
                <span className="font-medium text-emerald-700">
                  {confirmedOrder.customer.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : 'বিকাশ / নগদ'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-base font-bold text-slate-900">
                <span>সর্বমোট প্রদেয়</span>
                <span className="text-cyan-700 font-bold">৳{toBengaliNumber(confirmedOrder.item.totalPrice)}</span>
              </div>
            </div>

            {/* Action Buttons for Confirmed Order */}
            <div className="flex flex-col items-center gap-3">
              <a
                href={`tel:${HOTLINE_TEL}`}
                className="w-full py-3.5 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-cyan-600/20 transition-colors"
              >
                <Phone className="w-4 h-4 text-white" />
                <span>হটলাইনে যোগাযোগ করুন: <strong className="font-bold text-white">{HOTLINE_NUMBER}</strong></span>
              </a>
            </div>

            <button
              onClick={handleClose}
              className="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2"
            >
              উইন্ডোটি বন্ধ করুন
            </button>
          </div>
        ) : (
          /* ORDER FORM STATE */
          <form onSubmit={handleOrderSubmit} className="p-5 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto">
            
            {/* Step 1: Choose Package */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                ১. প্যাকেজ নির্বাচন করুন
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {WATER_PACKAGES.map((pkg) => {
                  const isSelected = pkg.id === packageId;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setPackageId(pkg.id)}
                      className={`cursor-pointer p-3 rounded-2xl border transition-all text-left flex items-center gap-2.5 ${
                        isSelected
                          ? 'border-cyan-600 bg-cyan-50/70 ring-2 ring-cyan-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <img
                        src={pkg.image}
                        alt={pkg.title}
                        className="w-12 h-12 object-contain shrink-0 rounded-xl bg-slate-50 p-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 leading-snug truncate">
                            {pkg.title}
                          </span>
                          <span className="text-xs font-extrabold text-cyan-700 shrink-0">
                            {pkg.isCustomPricing ? 'কাস্টম' : `৳${toBengaliNumber(pkg.price)}`}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {pkg.volume}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Quantity & Empty Jar Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200">
              
              {/* Quantity Counter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">পরিমাণ (সংখ্যা)</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shadow-xs"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-bold text-slate-900 w-8 text-center">
                    {toBengaliNumber(quantity)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-slate-500 font-medium ml-1">
                    টি {currentPkg.unit}
                  </span>
                </div>
              </div>

              {/* Empty Jar Switch (if package requires deposit) */}
              {currentPkg.depositRequired ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">আপনার কাছে কি খালি জার আছে?</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHasEmptyJar(true)}
                      className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all ${
                        hasEmptyJar
                          ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      হ্যাঁ, আছে (৳<strong className="font-bold">০</strong>)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasEmptyJar(false)}
                      className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all ${
                        !hasEmptyJar
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      না, নতুন (+৳<strong className="font-bold">{toBengaliNumber(currentPkg.depositAmount)}</strong>)
                    </button>
                  </div>
                  {!hasEmptyJar && (
                    <p className="text-[10px] text-amber-700 mt-1">
                      *নতুন জারের জন্য ৳<strong className="font-bold text-amber-950">{toBengaliNumber(currentPkg.depositAmount)}</strong> জামানত (জার ফেরত দিলে এই টাকা ফেরত পাবেন)
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center text-xs text-emerald-700 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/60">
                  <span>✓ এই প্যাকেজে কোনো খালি জারের প্রয়োজন নেই!</span>
                </div>
              )}
            </div>

            {/* Step 3: Customer Details */}
            <div className="space-y-3 pt-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                ২. ডেলিভারি তথ্য দিন
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">আপনার পূর্ণ নাম *</label>
                  <Input
                    id="order-name-input"
                    type="text"
                    placeholder="যেমন: মোঃ সাব্বির আহমেদ"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={errors.name ? 'border-rose-500 ring-rose-200' : ''}
                  />
                  {errors.name && <p className="text-[11px] text-rose-500">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">মোবাইল নম্বর *</label>
                  <Input
                    id="order-phone-input"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={errors.phone ? 'border-rose-500 ring-rose-200' : ''}
                  />
                  {errors.phone && <p className="text-[11px] text-rose-500">{errors.phone}</p>}
                </div>
              </div>

              {/* Delivery Area Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">ডেলিভারি এলাকা নির্বাচন করুন *</label>
                <select
                  id="order-area-select"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-cyan-500"
                >
                  {KHULNA_AREAS.map((loc, idx) => (
                    <option key={idx} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Full Address */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">বিস্তারিত ঠিকানা (বাসা/ফ্ল্যাট, রোড, তলা) *</label>
                <textarea
                  id="order-address-input"
                  rows={2}
                  placeholder="যেমন: বাড়ি নং ১২, ফ্ল্যাট ৪-বি (৪র্থ তলা), রোড নং ৭, ব্লক-সি..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-cyan-500 ${
                    errors.address ? 'border-rose-500' : ''
                  }`}
                />
                {errors.address && <p className="text-[11px] text-rose-500">{errors.address}</p>}
              </div>

              {/* Delivery Timing Slot */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">ডেলিভারির সময়</label>
                <select
                  value={deliverySlot}
                  onChange={(e) => setDeliverySlot(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-cyan-500"
                >
                  <option value="আজকেই দ্রুততম ডেলিভারি (১ ঘণ্টার মধ্যে)">⚡ আজকেই দ্রুততম ডেলিভারি (১ ঘণ্টার মধ্যে)</option>
                  <option value="আজ সন্ধ্যায় (৬টা - ৯টা)">আজ সন্ধ্যায় (৬টা - ৯টা)</option>
                  <option value="আগামীকাল সকাল (৯টা - ১২টা)">আগামীকাল সকাল (৯টা - ১২টা)</option>
                  <option value="আগামীকাল দুপুর (২টা - ৫টা)">আগামীকাল দুপুর (২টা - ৫টা)</option>
                </select>
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-slate-700">পেমেন্ট মেথড</label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`cursor-pointer p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-cyan-600 bg-cyan-50/70 text-cyan-950 ring-2 ring-cyan-500/20'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
                    <span>ক্যাশ অন ডেলিভারি</span>
                  </div>
                  <div
                    onClick={() => setPaymentMethod('bkash')}
                    className={`cursor-pointer p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                      paymentMethod === 'bkash'
                        ? 'border-pink-600 bg-pink-50/70 text-pink-950 ring-2 ring-pink-500/20'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-600" />
                    <span>বিকাশ / নগদ পেমেন্ট</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Price Summary Breakdown */}
            <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-200/80 space-y-1.5 text-xs">
              {currentPkg.isCustomPricing ? (
                <div className="flex justify-between text-slate-600">
                  <span>পানির মূল্য</span>
                  <span className="font-bold text-slate-800">কাস্টম (আলোচনা সাপেক্ষে)</span>
                </div>
              ) : (
                <div className="flex justify-between text-slate-600">
                  <span>পানির মূল্য (<strong className="font-bold text-slate-800">{toBengaliNumber(quantity)}</strong> টি × ৳<strong className="font-bold text-slate-800">{toBengaliNumber(currentPkg.price)}</strong>)</span>
                  <span className="font-bold text-slate-800">৳{toBengaliNumber(itemsCost)}</span>
                </div>
              )}
              {totalDeposit > 0 && (
                <div className="flex justify-between text-amber-800">
                  <span>নতুন জার ডিপোজিট (<strong className="font-bold text-amber-950">{toBengaliNumber(quantity)}</strong> টি × ৳<strong className="font-bold text-amber-950">{toBengaliNumber(currentPkg.depositAmount)}</strong>)</span>
                  <span className="font-bold">৳{toBengaliNumber(totalDeposit)}</span>
                </div>
              )}
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>হোম ডেলিভারি চার্জ</span>
                <span className="font-bold">ফ্রি (৳<strong className="font-bold">০</strong>)</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-cyan-200 text-sm font-bold text-slate-900">
                <span>সর্বমোট প্রদেয় বিল</span>
                <span className="text-base text-cyan-800 font-extrabold">
                  {currentPkg.isCustomPricing ? 'কাস্টম রেট' : `৳${toBengaliNumber(grandTotal)}`}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              id="confirm-order-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full h-13 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-base shadow-lg shadow-cyan-600/30 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <span>অর্ডার প্রসেস হচ্ছে...</span>
              ) : (
                <span>
                  {currentPkg.isCustomPricing
                    ? 'কাস্টম অর্ডার অনুসন্ধান পাঠান'
                    : `অর্ডার নিশ্চিত করুন (৳${toBengaliNumber(grandTotal)})`}
                </span>
              )}
            </Button>

            <p className="text-[11px] text-center text-slate-500">
              🔒 আপনার সকল তথ্য গোপন রাখা হবে • কোনো অগ্রিম পেমেন্টের ঝুঁকি নেই
            </p>

          </form>
        )}

      </div>
    </div>
  );
};
