import Image from 'next/image';
import mugdhoPortrait from '@/src/assets/mir-mugdho-tribute.webp';
import paniwalaLogo from '@/src/assets/logo.png';

export function MugdhoTribute() {
  return (
    <section
      id="remembering-mugdho"
      lang="bn"
      aria-labelledby="mugdho-heading"
      className="relative isolate overflow-hidden border-t border-stone-200/80 bg-[#f7f7f2] py-14 sm:py-20 lg:py-24"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-48 bottom-0 -z-10 h-[32rem] w-[32rem] rounded-full border border-teal-900/[0.04]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 bottom-16 -z-10 h-96 w-96 rounded-full border border-teal-900/[0.04]" />

      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
        <div className="grid items-center gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-12 lg:gap-20">
          <figure className="mx-auto w-full max-w-[340px] md:max-w-none">
            <div className="relative">
              <div aria-hidden="true" className="absolute -bottom-3 -left-3 right-3 top-3 rounded-t-[7rem] rounded-b-2xl border border-teal-800/20 sm:-bottom-4 sm:-left-4 sm:right-4 sm:top-4" />
              <div className="relative overflow-hidden rounded-t-[7rem] rounded-b-2xl bg-[#eeeade] shadow-[0_16px_48px_-24px_rgba(28,66,53,0.3)]">
                <Image
                  src={mugdhoPortrait}
                  alt="মীর মাহফুজুর রহমান মুগ্ধের হাসিমুখের জলরঙের প্রতিকৃতি"
                  sizes="(max-width: 767px) 340px, (max-width: 1023px) 40vw, 410px"
                  placeholder="blur"
                  className="h-auto w-full"
                />
              </div>
            </div>
          </figure>

          <div>
            <div className="mb-5 flex items-center gap-3 text-sm font-medium text-teal-800">
              <span aria-hidden="true" className="h-px w-8 bg-teal-700/40" />
              স্মরণে ও শ্রদ্ধায়
            </div>

            <h2 id="mugdho-heading" className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              মীর মুগ্ধ
            </h2>
            <p className="mt-3 text-base text-stone-600 sm:text-lg">মীর মাহফুজুর রহমান মুগ্ধ</p>
            <p className="mt-2 text-sm text-stone-500">
              <time dateTime="1998-10-09">৯ অক্টোবর ১৯৯৮</time>
              <span aria-hidden="true" className="mx-2">—</span>
              <span className="sr-only">থেকে</span>
              <time dateTime="2024-07-18">১৮ জুলাই ২০২৪</time>
            </p>

            <blockquote className="mb-6 mt-8 border-l-2 border-teal-700/30 pl-5 sm:mt-9 sm:pl-6">
              <p className="text-3xl font-semibold leading-snug text-teal-900 sm:text-4xl lg:text-[2.65rem]">
                “পানি লাগবে, পানি?”
              </p>
            </blockquote>

            <p className="max-w-xl text-base leading-8 text-stone-600">
              খুলনা বিশ্ববিদ্যালয়ের গণিতের স্নাতক, ২৫ বছরের এক স্বপ্নবাজ তরুণ।
              ১৮ জুলাই ২০২৪, ঢাকার উত্তরায় আন্দোলনরত শিক্ষার্থীদের পানি বিতরণ
              করতে গিয়ে গুলিবিদ্ধ হয়ে প্রাণ হারান মুগ্ধ।
            </p>
            <p className="mt-3 max-w-xl text-base leading-8 text-stone-600">
              তাঁর হাসি, সাহস আর মানুষের পাশে দাঁড়ানোর স্মৃতির প্রতি আমাদের গভীর শ্রদ্ধা।
            </p>

            <div className="mt-6 flex justify-end">
              <div className="flex items-center gap-3 border-t border-teal-900/15 pt-4">
                <Image
                  src={paniwalaLogo}
                  alt="পানি ওয়ালা লোগো"
                  width={40}
                  height={40}
                  sizes="40px"
                  className="h-10 w-10 shrink-0 rounded-xl object-cover"
                />
                <div className="text-right">
                  <p className="text-xs leading-6 text-stone-500">স্মরণে ও শ্রদ্ধায়</p>
                  <p className="text-sm font-semibold leading-6 text-teal-900">পানি ওয়ালা পরিবার</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
