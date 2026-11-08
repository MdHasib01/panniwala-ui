import { useEffect, useState } from 'react';
import { WATER_PACKAGES } from '@/src/data/packages';
import type { WaterPackage } from '@/src/types';
import package1Img from '@/src/assets/package1.png';
import { api } from './api';

/** Shape returned by GET /api/packages. */
export interface ApiPackage {
  _id: string;
  slug: string;
  title: string;
  subtitle?: string;
  volume?: string;
  price: number;
  regularPrice?: number;
  unit?: string;
  popular?: boolean;
  bestValue?: boolean;
  features: string[];
  depositRequired: boolean;
  depositAmount: number;
  iconName: WaterPackage['iconName'];
  image?: string;
}

/** Bundled artwork for the default packages; custom packages can set an image URL. */
export function packageImage(slug: string, image?: string): string {
  if (image) return image;
  return WATER_PACKAGES.find((p) => p.id === slug)?.image ?? package1Img;
}

export function toWaterPackage(p: ApiPackage): WaterPackage {
  return {
    id: p.slug,
    title: p.title,
    subtitle: p.subtitle ?? '',
    volume: p.volume ?? '',
    price: p.price,
    regularPrice: p.regularPrice,
    unit: p.unit ?? '',
    popular: p.popular,
    bestValue: p.bestValue,
    features: p.features ?? [],
    depositRequired: p.depositRequired,
    depositAmount: p.depositAmount,
    iconName: p.iconName,
    image: packageImage(p.slug, p.image),
  };
}

let cache: WaterPackage[] | null = null;
let inflight: Promise<WaterPackage[]> | null = null;

function loadPackages(): Promise<WaterPackage[]> {
  if (cache) return Promise.resolve(cache);
  inflight ??= api
    .get<{ items: ApiPackage[] }>('/packages')
    .then(({ items }) => {
      cache = items.length ? items.map(toWaterPackage) : WATER_PACKAGES;
      return cache;
    })
    .catch(() => WATER_PACKAGES)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/**
 * Packages managed from the admin dashboard. Renders the bundled defaults
 * immediately and swaps in live data once the API responds (or keeps the
 * defaults if the API is unreachable).
 */
export function usePackages(): WaterPackage[] {
  const [packages, setPackages] = useState<WaterPackage[]>(cache ?? WATER_PACKAGES);
  useEffect(() => {
    let alive = true;
    loadPackages().then((p) => alive && setPackages(p));
    return () => {
      alive = false;
    };
  }, []);
  return packages;
}
