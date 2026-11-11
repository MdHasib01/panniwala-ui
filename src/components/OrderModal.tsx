'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { HOTLINE_NUMBER, HOTLINE_TEL, toBengaliNumber } from '@/src/data/packages';
import { areaKey, getPickedArea, useAreas } from '@/src/lib/areas-api';
import { LocationSelect } from '@/src/account/LocationSelect';
import { usePackages } from '@/src/lib/packages-api';
import { api } from '@/src/lib/api';
import { useAuth } from '@/src/lib/auth';
import Link from 'next/link';
import { WaterPackage, ConfirmedOrder } from '@/src/types';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import bkashLogo from '@/src/assets/bkash-logo.svg';
import { X, Plus, Minus, Check, CircleCheck, Phone, Truck, Banknote, Lock, Info } from 'lucide-react';

/** Matches the server's per-order quantity limit. */
const MAX_QTY = 100;

type PaymentMethod = 'cod' | 'bkash' | 'nagad';

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cod: 'ক্যাশ অন ডেলিভারি',
  bkash: 'বিকাশ',
  nagad: 'নগদ',
};

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
  const packages = usePackages();
  const [packageId, setPackageId] = useState<string>(
    selectedPackage?.id || packages[0].id
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [hasEmptyJar, setHasEmptyJar] = useState<boolean>(true);

  // Customer form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const areas = useAreas();
  const [area, setArea] = useState('');
  // Keep the choice valid when the live list arrives or an area is removed.
  const areaKeys = areas.map(areaKey).join('|');
  useEffect(() => {
    if (area && !areas.some((a) => areaKey(a) === areaKey(area))) setArea('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaKeys]);
  const [address, setAddress] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('আজকেই দ্রুততম ডেলিভারি (১ ঘণ্টার মধ্যে)');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
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

  // A location just checked in a "do you deliver here?" search wins over the saved one.
  useEffect(() => {
    if (!isOpen) return;
    const picked = getPickedArea();
    const match = picked && areas.find((a) => areaKey(a) === areaKey(picked));
    if (match) setArea(match);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, areaKeys]);

  // Signed-in customers: pre-fill their saved details (never overwrite what they typed).
  const { user } = useAuth();
  useEffect(() => {
    if (!isOpen || !user) return;
    setName((v) => v || user.name);
    setPhone((v) => v || user.phone || '');
    setAddress((v) => v || user.address || '');
    if (user.area && areas.some((a) => areaKey(a) === areaKey(user.area!))) setArea((v) => v || user.area!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user, areaKeys]);

  if (!isOpen) return null;

  const currentPkg =
    packages.find((p) => p.id === packageId) || packages[0];

  // An order holds one package; switching rows starts the new one at 1.
  const selectPackage = (id: string) => {
    if (id === packageId) return;
    setPackageId(id);
    setQuantity(1);
  };

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
    if (!area) errs.area = 'আপনার ডেলিভারি এলাকা নির্বাচন করুন';
    if (!address.trim()) {
      errs.address = 'বাসা/ফ্ল্যাট নং ও রাস্তার বিস্তারিত ঠিকানা দিন';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // The server re-prices the order from the stored package; its total is authoritative.
      const { order } = await api.post<{
        order: { orderNumber: string; total: number; item: { jarDeposit: number; unitPrice: number } };
      }>('/orders', {
        packageId: currentPkg.id,
        quantity,
        hasEmptyJar,
        customer: { name, phone: phone.replace(/[\s-]/g, ''), area, address },
        deliverySlot,
        paymentMethod,
        notes: notes || undefined,
      });

      const newOrder: ConfirmedOrder = {
        orderId: order.orderNumber,
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
          unitPrice: order.item.unitPrice,
          hasEmptyJar,
          jarDeposit: order.item.jarDeposit,
          totalPrice: order.total,
        },
        status: 'নিশ্চিত হয়েছে',
      };

      setConfirmedOrder(newOrder);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // confetti is decorative only
      }
    } catch (err) {
      setErrors({
        submit:
          (err as Error).message ||
          'অর্ডার পাঠানো যায়নি। আবার চেষ্টা করুন অথবা হটলাইনে কল করুন।',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setConfirmedOrder(null);
    onClose();
  };

  const paymentOptionClass = (active: boolean) =>
    `relative cursor-pointer p-3 rounded-xl border flex items-center gap-3 text-left transition-colors ${
      active
        ? 'border-cyan-600 bg-cyan-50/50 ring-1 ring-cyan-600'
        : 'border-slate-200 bg-white hover:border-slate-300'
    }`;

  const radioDot = (active: boolean) => (
    <span
      className={`ml-auto w-5 h-5 shrink-0 rounded-full border flex items-center justify-center transition-colors ${
        active ? 'bg-cyan-600 border-cyan-600 text-white' : 'border-slate-300 bg-white'
      }`}
    >
      {active && <Check className="w-3 h-3" strokeWidth={3} />}
    </span>
  );

  return (
    <div
      id="order-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-xl my-8 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Modal Top Header */}
        <div className="flex items-start justify-between gap-3 px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg sm:text-xl font-bold leading-tight text-slate-900">
              {confirmedOrder ? 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে' : 'পানি অর্ডার করুন'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {confirmedOrder
                ? 'অর্ডার আইডি: ' + confirmedOrder.orderId
                : 'ডোরস্টেপে ফ্রি ডেলিভারি'}
            </p>
          </div>
          <button
            id="close-order-modal-btn"
            type="button"
            aria-label="বন্ধ করুন"
            onClick={handleClose}
            className="p-2 -mr-2 -mt-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {confirmedOrder ? (
          /* SUCCESS STATE */
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <CircleCheck className="w-14 h-14 text-emerald-600 mx-auto" strokeWidth={1.75} />

            <div className="space-y-1.5">
              <h4 className="text-2xl font-bold text-slate-900">
                ধন্যবাদ, {confirmedOrder.customer.name}!
              </h4>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                আপনার পানির অর্ডারটি গৃহীত হয়েছে। আমাদের ডেলিভারি টিম কিছুক্ষণের মধ্যেই আপনার নম্বরে কল দিয়ে কনফার্ম করবে।
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
                  {confirmedOrder.item.packageTitle} ({toBengaliNumber(confirmedOrder.item.quantity)} টি)
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
                <span className="font-medium text-slate-900">
                  {PAYMENT_LABEL[confirmedOrder.customer.paymentMethod]}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-base font-bold text-slate-900">
                <span>সর্বমোট প্রদেয়</span>
                <span className="text-cyan-700">৳{toBengaliNumber(confirmedOrder.item.totalPrice)}</span>
              </div>
            </div>

            {/* Action Buttons for Confirmed Order */}
            <div className="flex flex-col items-center gap-3">
              <a
                href={`tel:${HOTLINE_TEL}`}
                className="w-full py-3.5 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>হটলাইনে যোগাযোগ করুন: {HOTLINE_NUMBER}</span>
              </a>
              {user?.role === 'user' ? (
                <Link
                  href="/orders"
                  onClick={handleClose}
                  className="w-full py-3.5 px-5 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                >
                  <Truck className="w-4 h-4" />
                  <span>আমার অর্ডার — লাইভ ট্র্যাক করুন</span>
                </Link>
              ) : !user ? (
                <Link
                  href="/register"
                  onClick={handleClose}
                  className="text-xs font-semibold text-cyan-700 hover:underline"
                >
                  অ্যাকাউন্ট খুলে পরবর্তী অর্ডারগুলো লাইভ ট্র্যাক করুন →
                </Link>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2"
            >
              উইন্ডোটি বন্ধ করুন
            </button>
          </div>
        ) : (
          /* ORDER FORM STATE */
          <form onSubmit={handleOrderSubmit} className="p-5 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto">

            {/* Step 1: Package list — the selected row carries its own quantity stepper */}
            <section className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                ১. প্যাকেজ ও পরিমাণ
              </h4>
              <ul
                role="radiogroup"
                aria-label="প্যাকেজ"
                className="divide-y divide-slate-200 rounded-2xl border border-slate-200 overflow-hidden"
              >
                {packages.map((pkg) => {
                  const isSelected = pkg.id === packageId;
                  return (
                    <li
                      key={pkg.id}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onClick={() => selectPackage(pkg.id)}
                      onKeyDown={(e) => {
                        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          selectPackage(pkg.id);
                        }
                      }}
                      className={`flex items-center gap-3 p-3 cursor-pointer transition-colors outline-none focus-visible:bg-slate-50 ${
                        isSelected ? 'bg-cyan-50/60' : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <img
                        src={pkg.image}
                        alt={pkg.title}
                        className="w-14 h-14 object-contain shrink-0 rounded-xl bg-white border border-slate-100 p-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 leading-snug truncate">{pkg.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          <span className="font-bold text-cyan-700">৳{toBengaliNumber(pkg.price)}</span>
                          <span> / {pkg.unit} · {pkg.volume}</span>
                        </p>
                      </div>

                      {isSelected ? (
                        <div
                          className="flex items-center shrink-0 rounded-xl border border-cyan-600 bg-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            aria-label="পরিমাণ কমান"
                            disabled={quantity <= 1}
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            className="w-9 h-9 flex items-center justify-center text-cyan-700 hover:bg-cyan-50 rounded-l-xl disabled:text-slate-300 disabled:hover:bg-transparent transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-slate-900 tabular-nums" aria-live="polite">
                            {toBengaliNumber(quantity)}
                          </span>
                          <button
                            type="button"
                            aria-label="পরিমাণ বাড়ান"
                            disabled={quantity >= MAX_QTY}
                            onClick={() => setQuantity((q) => Math.min(MAX_QTY, q + 1))}
                            className="w-9 h-9 flex items-center justify-center text-cyan-700 hover:bg-cyan-50 rounded-r-xl disabled:text-slate-300 disabled:hover:bg-transparent transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="shrink-0 h-9 px-3.5 inline-flex items-center rounded-xl border border-slate-300 text-xs font-semibold text-slate-700">
                          বেছে নিন
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* The empty-jar question only matters for packages that take a deposit */}
              {currentPkg.depositRequired && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-xs font-semibold text-slate-700">আপনার কাছে কি খালি জার আছে?</span>
                  <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-50">
                    <button
                      type="button"
                      aria-pressed={hasEmptyJar}
                      onClick={() => setHasEmptyJar(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        hasEmptyJar ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      হ্যাঁ, আছে
                    </button>
                    <button
                      type="button"
                      aria-pressed={!hasEmptyJar}
                      onClick={() => setHasEmptyJar(false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        !hasEmptyJar ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      না, নতুন জার
                    </button>
                  </div>
                  {!hasEmptyJar && (
                    <p className="w-full flex items-start gap-1.5 text-[11px] text-slate-500">
                      <Info className="w-3.5 h-3.5 mt-px shrink-0" />
                      <span>
                        প্রতি নতুন জারে ৳{toBengaliNumber(currentPkg.depositAmount)} জামানত — জার ফেরত দিলে টাকা ফেরত পাবেন।
                      </span>
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* Step 2: Customer Details */}
            <section className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                ২. ডেলিভারি তথ্য দিন
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Name */}
                <div className="space-y-1">
                  <label htmlFor="order-name-input" className="text-xs font-semibold text-slate-700">আপনার পূর্ণ নাম *</label>
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
                  <label htmlFor="order-phone-input" className="text-xs font-semibold text-slate-700">মোবাইল নম্বর *</label>
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
                <LocationSelect
                  id="order-area-select"
                  value={area}
                  onChange={setArea}
                  placeholder="এলাকার নাম লিখে খুঁজুন (বাংলা / English)"
                  className={errors.area ? '[&>button]:border-rose-500' : ''}
                />
                {errors.area && <p className="text-[11px] text-rose-500">{errors.area}</p>}
              </div>

              {/* Full Address */}
              <div className="space-y-1">
                <label htmlFor="order-address-input" className="text-xs font-semibold text-slate-700">বিস্তারিত ঠিকানা (বাসা/ফ্ল্যাট, রোড, তলা) *</label>
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
                <label htmlFor="order-slot-select" className="text-xs font-semibold text-slate-700">ডেলিভারির সময়</label>
                <select
                  id="order-slot-select"
                  value={deliverySlot}
                  onChange={(e) => setDeliverySlot(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-cyan-500"
                >
                  <option value="আজকেই দ্রুততম ডেলিভারি (১ ঘণ্টার মধ্যে)">আজকেই দ্রুততম ডেলিভারি (১ ঘণ্টার মধ্যে)</option>
                  <option value="আজ সন্ধ্যায় (৬টা - ৯টা)">আজ সন্ধ্যায় (৬টা - ৯টা)</option>
                  <option value="আগামীকাল সকাল (৯টা - ১২টা)">আগামীকাল সকাল (৯টা - ১২টা)</option>
                  <option value="আগামীকাল দুপুর (২টা - ৫টা)">আগামীকাল দুপুর (২টা - ৫টা)</option>
                </select>
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-semibold text-slate-700">পেমেন্ট মেথড</span>
                <div role="radiogroup" aria-label="পেমেন্ট মেথড" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={paymentMethod === 'cod'}
                    onClick={() => setPaymentMethod('cod')}
                    className={paymentOptionClass(paymentMethod === 'cod')}
                  >
                    <span className="w-14 h-10 shrink-0 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-700">
                      <Banknote className="w-6 h-6" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-900">ক্যাশ অন ডেলিভারি</span>
                      <span className="block text-[11px] text-slate-500">পানি হাতে পেয়ে টাকা দিন</span>
                    </span>
                    {radioDot(paymentMethod === 'cod')}
                  </button>

                  <button
                    type="button"
                    role="radio"
                    aria-checked={paymentMethod === 'bkash'}
                    onClick={() => setPaymentMethod('bkash')}
                    className={paymentOptionClass(paymentMethod === 'bkash')}
                  >
                    <span className="w-14 h-10 shrink-0 rounded-lg border border-slate-200 bg-white flex items-center justify-center px-1.5">
                      <img src={bkashLogo.src} alt="বিকাশ" className="max-h-7 w-auto object-contain" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-900">বিকাশ</span>
                      <span className="block text-[11px] text-slate-500">বিকাশে পেমেন্ট করুন</span>
                    </span>
                    {radioDot(paymentMethod === 'bkash')}
                  </button>
                </div>
              </div>
            </section>

            {/* Price Summary Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>পানির মূল্য ({toBengaliNumber(quantity)} টি × ৳{toBengaliNumber(currentPkg.price)})</span>
                <span className="font-semibold text-slate-800">৳{toBengaliNumber(itemsCost)}</span>
              </div>
              {totalDeposit > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>নতুন জার জামানত ({toBengaliNumber(quantity)} টি × ৳{toBengaliNumber(currentPkg.depositAmount)})</span>
                  <span className="font-semibold text-slate-800">৳{toBengaliNumber(totalDeposit)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>হোম ডেলিভারি চার্জ</span>
                <span className="font-semibold text-emerald-700">ফ্রি</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>সর্বমোট প্রদেয় বিল</span>
                <span className="text-base text-cyan-800">৳{toBengaliNumber(grandTotal)}</span>
              </div>
            </div>

            {errors.submit && (
              <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
                {errors.submit}
              </p>
            )}

            {/* Submit Button */}
            <Button
              id="confirm-order-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full h-13 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-base active:scale-[0.99]"
            >
              {isSubmitting ? (
                <span>অর্ডার প্রসেস হচ্ছে...</span>
              ) : (
                <span>অর্ডার নিশ্চিত করুন (৳{toBengaliNumber(grandTotal)})</span>
              )}
            </Button>

            <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <Lock className="w-3 h-3" />
              <span>আপনার সকল তথ্য গোপন রাখা হবে • কোনো অগ্রিম পেমেন্টের ঝুঁকি নেই</span>
            </p>

          </form>
        )}

      </div>
    </div>
  );
};
