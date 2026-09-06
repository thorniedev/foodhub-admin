"use client";

import { motion, MotionValue, useScroll, useTransform } from "framer-motion";
import Lenis from "lenis";
import { useEffect, useRef, useState } from "react";

export interface AgeGroupData {
  id: string | number;
  title: string;
  ageRange: string;
  dishesCount: number;
  image: string;
}

interface Skipper30Props {
  data?: AgeGroupData[];
}

// Default dummy data based on the screenshot provided
// Using placeholder images from unsplash/picsum so they actually load!
const defaultData: AgeGroupData[] = [
  {
    id: 1,
    title: "កូនង៉ែត",
    ageRange: "(0-6)",
    dishesCount: 5,
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=400&q=80", // Baby placeholder
  },
  {
    id: 2,
    title: "កុមារ",
    ageRange: "(3-12)",
    dishesCount: 60,
    image: "https://images.unsplash.com/photo-1519340241574-2c20dd59d20b?auto=format&fit=crop&w=400&q=80", // Kids placeholder
  },
  {
    id: 3,
    title: "យុវវ័យ",
    ageRange: "(13-17)",
    dishesCount: 87,
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80", // Teen placeholder
  },
  {
    id: 4,
    title: "ពេញវ័យ",
    ageRange: "(18-59)",
    dishesCount: 97,
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80", // Adult placeholder
  },
  {
    id: 5,
    title: "វ័យចំណាស់",
    ageRange: "(60+)",
    dishesCount: 47,
    image: "https://images.unsplash.com/photo-1551829022-d949acbdcaaa?auto=format&fit=crop&w=400&q=80", // Elderly placeholder
  },
];

export const Skipper30 = ({ data = defaultData }: Skipper30Props) => {
  const gallery = useRef<HTMLDivElement>(null);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  const { scrollYProgress } = useScroll({
    target: gallery,
    offset: ["start end", "end start"],
  });

  const { height } = dimension;
  const y = useTransform(scrollYProgress, [0, 1], [0, height * 2]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, height * 3.3]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, height * 1.25]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, height * 3]);
  const y5 = useTransform(scrollYProgress, [0, 1], [0, height * 2.5]);

  useEffect(() => {
    const lenis = new Lenis();

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    const resize = () => {
      setDimension({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", resize);
    requestAnimationFrame(raf);
    resize();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Split the data into columns (1 item per column for the 5 items)
  const column1 = data.filter((_, i) => i % 5 === 0);
  const column2 = data.filter((_, i) => i % 5 === 1);
  const column3 = data.filter((_, i) => i % 5 === 2);
  const column4 = data.filter((_, i) => i % 5 === 3);
  const column5 = data.filter((_, i) => i % 5 === 4);

  return (
    <main className="w-full bg-[#eee] text-black overflow-hidden">
      <div className="py-16 text-center">
        <h2 className="text-4xl font-bold mb-4 text-[#136C34]">
          ចំណីអាហារ<span className="text-orange-500">ស្របតាមវ័យ</span>
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          ណែនាំមុខម្ហូបដែលសាកសមនឹងតម្រូវការអាហារូបត្ថម្ភនិងរបៀបរស់នៅរបស់មនុស្សគ្រប់វ័យ
          ចាប់ពីកុមារ មនុស្សពេញវ័យ រហូតដល់មនុស្សវ័យចំណាស់
        </p>
      </div>

      <div
        ref={gallery}
        className="relative box-border flex h-[120vh] gap-[2vw] overflow-hidden bg-[#eee] p-[2vw] justify-center"
      >
        {column1.length > 0 && <Column items={column1} y={y} />}
        {column2.length > 0 && <Column items={column2} y={y2} />}
        {column3.length > 0 && <Column items={column3} y={y3} />}
        {column4.length > 0 && <Column items={column4} y={y4} />}
        {column5.length > 0 && <Column items={column5} y={y5} />}
      </div>
    </main>
  );
};

type ColumnProps = {
  items: AgeGroupData[];
  y: MotionValue<number>;
};

const Column = ({ items, y }: ColumnProps) => {
  return (
    <motion.div
      className="relative -top-[35%] flex h-full w-1/5 min-w-[200px] max-w-[280px] flex-col gap-[2vw] first:top-[-45%] [&:nth-child(2)]:top-[-65%] [&:nth-child(3)]:top-[-35%] [&:nth-child(4)]:top-[-55%] [&:nth-child(5)]:top-[-45%]"
      style={{ y }}
    >
      {items.map((item, i) => (
        <AgeGroupCard key={i} item={item} />
      ))}
    </motion.div>
  );
};

const AgeGroupCard = ({ item }: { item: AgeGroupData }) => {
  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300">
      <div className="w-40 h-40 rounded-full overflow-hidden mb-6 border-4 border-[#136C34]">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover pointer-events-none"
        />
      </div>
      <h3 className="text-xl font-bold text-[#136C34] mb-1">{item.title}</h3>
      <p className="text-orange-500 font-medium mb-1">{item.ageRange}</p>
      <p className="text-gray-500 text-sm">({item.dishesCount} មុខម្ហូប)</p>
    </div>
  );
};
