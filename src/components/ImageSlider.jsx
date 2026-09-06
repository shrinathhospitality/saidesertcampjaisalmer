import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';

export default function ImageSlider({ images = [], title = 'Image gallery', className = '' }) {
  return (
    <Swiper modules={[Autoplay, EffectFade, Navigation, Pagination]} effect="fade" loop autoplay={{ delay: 4200, disableOnInteraction: false }} pagination={{ clickable: true }} navigation className={`overflow-hidden rounded-[2rem] ${className}`}>
      {images.map((image) => (
        <SwiperSlide key={image}>
          <img src={image} alt={title} loading="lazy" className="h-full min-h-[24rem] w-full object-cover" />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
