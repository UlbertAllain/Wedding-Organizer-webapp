import {
  CalendarCheck2,
  ClipboardList,
  Gem,
  GlassWater,
  HandHeart,
  Sprout,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type LandingIcon = LucideIcon;

export interface ValueItem {
  icon: LandingIcon;
  title: string;
  description: string;
}

export interface ServiceItem {
  number: string;
  title: string;
  description: string;
}

export interface ProcessItem {
  number: string;
  icon: LandingIcon;
  title: string;
  description: string;
}

export interface TestimonialItem {
  quote: string;
  couple: string;
}

export const navigation = [
  { label: "Tentang", href: "#tentang" },
  { label: "Layanan", href: "#layanan" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Paket", href: "#paket" },
];

export const values: ValueItem[] = [
  {
    icon: Sprout,
    title: "Personalisasi total",
    description: "Setiap detail disesuaikan dengan cerita kalian.",
  },
  {
    icon: Gem,
    title: "Vendor pilihan terbaik",
    description: "Jaringan partner profesional yang terkurasi.",
  },
  {
    icon: HandHeart,
    title: "Eksekusi penuh perhatian",
    description: "Hari istimewa berjalan rapi tanpa kehilangan rasa.",
  },
];

export const services: ServiceItem[] = [
  {
    number: "01",
    title: "Full Wedding Planning",
    description:
      "Pendampingan menyeluruh sejak konsep, anggaran, venue, vendor, hingga koordinasi pada hari perayaan.",
  },
  {
    number: "02",
    title: "Wedding Day Coordination",
    description:
      "Finalisasi rundown, koordinasi vendor, dan pengawasan detail agar keluarga dapat menikmati hari istimewa dengan tenang.",
  },
  {
    number: "03",
    title: "Styling & Vendor Curation",
    description:
      "Konsep visual, moodboard, dekorasi, dokumentasi, dan partner pilihan yang selaras dengan karakter kalian.",
  },
];

export const processItems: ProcessItem[] = [
  {
    number: "01",
    icon: UsersRound,
    title: "Kenali cerita kalian",
    description: "Kami mulai dari percakapan hangat untuk memahami prioritas dan karakter perayaan.",
  },
  {
    number: "02",
    icon: ClipboardList,
    title: "Susun rencana realistis",
    description: "Konsep, anggaran, timeline, dan vendor disusun dalam satu arah kerja yang jelas.",
  },
  {
    number: "03",
    icon: CalendarCheck2,
    title: "Kawal setiap persiapan",
    description: "Setiap keputusan, progres, dan koordinasi dijaga agar tidak ada detail yang tercecer.",
  },
  {
    number: "04",
    icon: GlassWater,
    title: "Rayakan dengan tenang",
    description: "Kalian hadir sepenuhnya untuk momen; tim kami memastikan sisanya berjalan rapi.",
  },
];

export const testimonials: TestimonialItem[] = [
  {
    quote: "Detail kecil pun diperhatikan. Kami benar-benar bisa menikmati hari bahagia tanpa memikirkan hal teknis.",
    couple: "Alya & Dimas",
  },
  {
    quote: "Konsepnya terasa sangat kami. Seluruh proses transparan dan hasil akhirnya melampaui bayangan kami.",
    couple: "Rania & Bima",
  },
  {
    quote: "Dari awal sampai hari H semuanya tertata. Keluarga tenang, vendor terarah, dan kami bisa fokus merayakan.",
    couple: "Mira & Fajar",
  },
];
