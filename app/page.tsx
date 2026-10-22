import { Hero } from '@/components/home/Hero';
import { Story } from '@/components/home/Story';
import { Marquee } from '@/components/home/Marquee';
import { Craft } from '@/components/home/Craft';
import { Memory } from '@/components/home/Memory';
import { Collections } from '@/components/home/Collections';
import { Featured } from '@/components/home/Featured';
import { NewArrivals } from '@/components/home/NewArrivals';
import { Journey } from '@/components/home/Journey';
import { Why } from '@/components/home/Why';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Story />
      <Marquee />
      <Craft />
      <Memory />
      <Collections />
      <Featured />
      <NewArrivals />
      <Journey />
      <Why />
    </>
  );
}
