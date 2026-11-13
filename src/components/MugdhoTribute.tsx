import Image from 'next/image';
import mugdhoPortrait from '@/src/assets/mir-mugdho-face-art.webp';
import paniwalaLogo from '@/src/assets/logo.png';
import fallingDrops from '@/src/assets/mugdho-falling-drops.webp';
import redSplash from '@/src/assets/mugdho-red-splash.webp';

export function MugdhoTribute() {
  return (
    <section
      id="remembering-mugdho"
      lang="bn"
      aria-labelledby="mugdho-heading"
      className="relative isolate overflow-hidden border-t border-stone-200/80 bg-[#f7f7f2] py-7 sm:py-9"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 select-none">
        <Image
          src={fallingDrops}
          alt=""
          sizes="(min-width: 1024px) 300px, (min-width: 640px) 220px, 144px"
          className="absolute right-0 top-0 h-auto w-36 opacity-70 sm:w-[220px] sm:opacity-80 lg:w-[300px]"
        />
        <Image
          src={redSplash}
          alt=""
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 280px, 176px"
          className="absolute bottom-0 left-0 h-auto w-44 opacity-40 sm:w-[280px] sm:opacity-50 lg:w-[380px]"
        />
      </div>

      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-[104px_minmax(0,1fr)] items-center gap-x-5 gap-y-4 sm:grid-cols-[144px_minmax(0,1fr)] sm:gap-x-7 md:grid-cols-[220px_minmax(0,1fr)] md:gap-x-10 md:gap-y-3">
          <figure className="w-full md:row-span-2">
            <div className="relative">
              <div aria-hidden="true" className="absolute -bottom-1.5 -left-1.5 right-1.5 top-1.5 rounded-2xl border border-cyan-700/20 sm:rounded-3xl" />
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#eeeade] shadow-[0_12px_32px_-20px_rgba(8,145,178,0.25)] sm:rounded-3xl">
                <Image
                  src={mugdhoPortrait}
                  alt="মীর মাহফুজুর রহমান মুগ্ধের হাসিমুখের পেন্সিল ও জলরঙে আঁকা প্রতিকৃতি"
                  sizes="(max-width: 639px) 104px, (max-width: 767px) 144px, 220px"
                  placeholder="blur"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </figure>

          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-cyan-700">
              <span aria-hidden="true" className="h-px w-5 bg-cyan-600/40" />
              স্মরণে ও শ্রদ্ধায়
            </div>

            <h2 id="mugdho-heading" className="text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl">
              মীর মুগ্ধ
            </h2>
            <p className="mt-1 text-sm text-stone-600">মীর মাহফুজুর রহমান মুগ্ধ</p>
            <p className="mt-1 text-xs leading-5 text-stone-500">
              <time dateTime="1998-10-09">৯ অক্টোবর ১৯৯৮</time>
              <span aria-hidden="true" className="mx-2">—</span>
              <span className="sr-only">থেকে</span>
              <time dateTime="2024-07-18">১৮ জুলাই ২০২৪</time>
            </p>
          </div>

          <div className="col-span-2 min-w-0 md:col-span-1">
            <blockquote className="mb-3 border-l-2 border-cyan-600/30 pl-4">
              <p className="text-3xl font-bold leading-snug text-cyan-600 sm:text-4xl">
                “পানি লাগবে, পানি?”
              </p>
            </blockquote>

            <p className="text-sm leading-7 text-stone-600">
              খুলনা বিশ্ববিদ্যালয়ের গণিতের স্নাতক, ২৫ বছরের এক স্বপ্নবাজ তরুণ।
              ১৮ জুলাই ২০২৪, ঢাকার উত্তরায় আন্দোলনরত শিক্ষার্থীদের পানি বিতরণ
              করতে গিয়ে গুলিবিদ্ধ হয়ে প্রাণ হারান মুগ্ধ।
            </p>
            <p className="mt-1.5 text-sm leading-7 text-stone-600">
              তাঁর হাসি, সাহস আর মানুষের পাশে দাঁড়ানোর স্মৃতির প্রতি আমাদের গভীর শ্রদ্ধা।
            </p>

            <div className="mt-4 flex justify-end">
              <div className="flex items-center gap-2.5 border-t border-cyan-900/15 pt-2.5">
                <Image
                  src={paniwalaLogo}
                  alt="পানি ওয়ালা লোগো"
                  width={32}
                  height={32}
                  sizes="32px"
                  className="h-8 w-8 shrink-0 rounded-lg object-cover"
                />
                <div className="text-right">
                  <p className="text-xs leading-5 text-stone-500">স্মরণে ও শ্রদ্ধায়</p>
                  <p className="text-sm font-semibold leading-5 text-cyan-700">পানি ওয়ালা পরিবার</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
