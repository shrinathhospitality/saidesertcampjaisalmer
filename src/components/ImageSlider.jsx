import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

export default function ImageSlider({ images = [], title = 'Image gallery', className = '' }) {
  // Plain slide transition, not "fade": fade combined with loop+autoplay on a
  // short slide list triggers a real Swiper sizing bug here (it corrupts the
  // container's own size calculation into garbage values, which crashes a
  // full-page screenshot render and leaves the slide blank in the browser).
  return (
    <Swiper modules={[Autoplay, Navigation, Pagination]} loop={images.length > 1} autoplay={images.length > 1 ? { delay: 4200, disableOnInteraction: false } : false} pagination={{ clickable: true }} navigation className={`h-[24rem] overflow-hidden rounded-[2rem] ${className}`}>
      {images.map((image) => (
        <SwiperSlide key={image}>
          <img src={image} alt={title} loading="lazy" className="h-full min-h-[24rem] w-full object-cover" />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
