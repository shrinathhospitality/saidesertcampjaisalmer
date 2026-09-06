import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { FaStar } from 'react-icons/fa';

export default function TestimonialSlider({ testimonials }) {
  return (
    <Swiper modules={[Autoplay, Pagination]} loop autoplay={{ delay: 5000 }} pagination={{ clickable: true }} className="pb-12">
      {testimonials.map((item) => (
        <SwiperSlide key={item.name}>
          <blockquote className="mx-auto max-w-4xl text-center">
            <div className="mb-7 flex justify-center gap-1 text-champagne">{Array.from({ length: item.rating }).map((_, i) => <FaStar key={i} />)}</div>
            <p className="font-display text-4xl leading-tight text-pearl md:text-6xl">“{item.quote}”</p>
            <footer className="mt-8 text-sm uppercase tracking-[.25em] text-pearl/58">{item.name} · {item.role}</footer>
          </blockquote>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
